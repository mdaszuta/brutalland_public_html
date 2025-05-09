<?php
namespace mdaszuta\topicsearch\controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use phpbb\request\request_interface;
use phpbb\db\driver\driver_interface;
use phpbb\user;
use phpbb\auth\auth;

class ajax_search
{
	protected $db;
	protected $request;
	protected $user;
	protected $auth;

	/** @var string The SQL expression that normalizes t.topic_title */
	private $normalizedExpr;

	private const NORMALIZATION_MAP = [
		'ß' => 'ss', 'þ' => 'th', 'ƿ' => 'w', 'ð' => 'd', 'ø' => 'o',
		'æ' => 'ae', 'œ' => 'oe', 'ł' => 'l', 'ı' => 'i', '§' => 's',
		'µ' => 'u', '¡' => '!', '¿' => '?',
	];

	public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth)
	{
		$this->db      = $db;
		$this->request = $request;
		$this->user    = $user;
		$this->auth    = $auth;

		// Build and cache the normalization SQL once
		$this->normalizedExpr = $this->build_normalize_sql('t.topic_title');
	}

	/**
	 * Returns the normalization map used for both PHP and SQL normalization.
	 * If you update this map, ensure both normalize_string() and build_normalize_sql() stay in sync.
	 */
	private function get_normalization_map()
	{
		return self::NORMALIZATION_MAP;
	}

	private function normalize_string($str)
	{
		return strtr($str, $this->get_normalization_map());
	}

	private function build_normalize_sql($column)
	{
		$map = $this->get_normalization_map();
		$sql = "LOWER($column)";
		foreach ($map as $from => $to) {
			$from_escaped = str_replace("'", "\\'", $from);
			$to_escaped = str_replace("'", "\\'", $to);
			$sql = "REPLACE($sql, '$from_escaped', '$to_escaped')";
		}
		return $sql;
	}

	public function handle()
	{
		$q = trim((string) $this->request->variable('q', '', true));
		if (utf8_strlen($q) < 2)
		{
			return new JsonResponse([]);
		}
		$search_term = utf8_strtolower($q);
		$normalized_search = $this->normalize_string($search_term);
		// escape and neutralize any literal % or _ in user input
		$escaped = addcslashes($this->db->sql_escape($normalized_search), '%_');

		// ✅ Cached allowed forums
		$allowed_forums = array_keys($this->auth->acl_getf('f_list', true));
		if (empty($allowed_forums))
		{
			return new JsonResponse([]);
		}
		$allowed_forums_sql = implode(',', array_map('intval', $allowed_forums));

		// Use the pre-built normalization expression
		$normalized_expr = $this->normalizedExpr;

		// Prepare LIKE patterns
		$like_prefix = $escaped . '%';
		$like_anywhere = '%' . $escaped . '%';

		// Main SQL: normalize in a subquery, then apply prefix/substring logic
		$sql_block = "
			SELECT * FROM (
				SELECT 
					t.topic_id, 
					t.topic_title, 
					t.topic_last_post_id, 
					t.topic_last_post_time, 
					f.forum_id, 
					f.forum_name,
					{$normalized_expr} AS normalized_title
				FROM " . TOPICS_TABLE . " t
				JOIN " . FORUMS_TABLE . " f ON t.forum_id = f.forum_id
				WHERE 
					t.topic_status <> " . ITEM_MOVED . "
					AND t.forum_id IN ($allowed_forums_sql)
			) sub
			WHERE sub.normalized_title LIKE '$like_prefix'
				OR (sub.normalized_title LIKE '$like_anywhere' AND sub.normalized_title NOT LIKE '$like_prefix')
			ORDER BY 
				CASE 
					WHEN sub.normalized_title LIKE '$like_prefix' THEN 1
					ELSE 2
				END,
				sub.topic_title ASC
			LIMIT 20
		";

		// Execute and handle any SQL errors gracefully
		$result = $this->db->sql_query($sql_block);
		if (!$result) {
			$err = $this->db->sql_error();
			trigger_error(
				'TopicSearch SQL failed: ' . $err['message'] . ' (code ' . $err['code'] . ')',
				E_USER_WARNING
			);
			return new JsonResponse([], 500);
		}

		$topics_raw = [];
		$forum_topics = [];
		$track_topics = ($this->user->data['user_id'] != ANONYMOUS);

		while ($row = $this->db->sql_fetchrow($result))
		{
			$topics_raw[] = $row;
			if ($track_topics) {
				$forum_id = (int) $row['forum_id'];
				$topic_id = (int) $row['topic_id'];
				if (!isset($forum_topics[$forum_id])) {
					$forum_topics[$forum_id] = [];
				}
				$forum_topics[$forum_id][] = $topic_id;
			}
		}
		$this->db->sql_freeresult($result);

		$topics = [];

		if ($track_topics) {
			$topic_tracking_info = [];
			foreach ($forum_topics as $forum_id => $topic_ids) {
				$topic_tracking_info += get_complete_topic_tracking($forum_id, $topic_ids);
			}
		}

		foreach ($topics_raw as $row)
		{
			$topic_id = (int) $row['topic_id'];
			$forum_id = (int) $row['forum_id'];

			$unread = false;
			if ($track_topics) {
				$last_post_time = (int) $row['topic_last_post_time'];
				$last_read = isset($topic_tracking_info[$topic_id]) ? (int) $topic_tracking_info[$topic_id] : 0;
				$unread = ($last_post_time > $last_read);
			}

			$topics[] = [
				'id'					=> $topic_id,
				'title'					=> $row['topic_title'],
				'topic_last_post_id'	=> (int) $row['topic_last_post_id'],
				'forum'					=> $row['forum_name'],
				'forum_id'				=> $forum_id,
				'unread'				=> $unread,
			];
		}

		return new JsonResponse($topics);
	}
}
