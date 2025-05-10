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
	private $normalizedTitleSql;

	private const MIN_QUERY_LENGTH = 2;
	private const MAX_RESULTS = 20;

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
		$this->normalizedTitleSql = $this->build_normalized_title_sql('t.topic_title');
	}

	/**
	 * Returns the normalization map used for both PHP and SQL normalization.
	 * If you update this map, ensure both normalize_search_string() and build_normalized_title_sql() stay in sync.
	 */
	private function get_normalization_map()
	{
		return self::NORMALIZATION_MAP;
	}

	private function normalize_search_string($str)
	{
		return strtr($str, $this->get_normalization_map());
	}

	private function build_normalized_title_sql($column)
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
		if (utf8_strlen($q) < self::MIN_QUERY_LENGTH)
		{
			return new JsonResponse([]);
		}
		$lowercase_search = utf8_strtolower($q);
		$normalized_search = $this->normalize_search_string($lowercase_search);
		// escape and neutralize any literal % or _ in user input
		$escaped_search = addcslashes($this->db->sql_escape($normalized_search), '%_');

		// ✅ Cached allowed forums
		$allowed_forums = array_keys($this->auth->acl_getf('f_list', true));
		if (empty($allowed_forums))
		{
			return new JsonResponse([]);
		}
		$allowed_forum_ids_sql = implode(',', array_map('intval', $allowed_forums));

		// Prepare LIKE patterns
		$like_prefix = $escaped_search . '%';
		$like_anywhere = '%' . $escaped_search . '%';

		// Main SQL: normalize in a subquery, then apply prefix/substring logic
		$matched_topics = $this->get_topics($escaped_search, $like_prefix, $like_anywhere, $allowed_forum_ids_sql);

		$forum_topics = [];
		$track_topics = ($this->user->data['user_id'] != ANONYMOUS);

		foreach ($matched_topics as $row)
		{
			if ($track_topics) {
				$forum_id = (int) $row['forum_id'];
				$topic_id = (int) $row['topic_id'];
				if (!isset($forum_topics[$forum_id])) {
					$forum_topics[$forum_id] = [];
				}
				$forum_topics[$forum_id][] = $topic_id;
			}
		}

		$topics = [];

		// 🚀 Skip tracking if there are no results
		$topic_tracking_info = [];
		if ($track_topics && !empty($matched_topics)) {
			foreach ($forum_topics as $forum_id => $topic_ids) {
				$topic_tracking_info += get_complete_topic_tracking($forum_id, $topic_ids);
			}
		}

		foreach ($matched_topics as $row)
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

	private function get_topics(string $escaped_search, string $like_prefix, string $like_anywhere, string $allowed_forum_ids_sql): array
	{
		$normalized_expr = $this->normalizedTitleSql;

		$sql = "
			SELECT 
				sub.topic_id,
				sub.topic_title,
				sub.topic_last_post_id,
				sub.topic_last_post_time,
				sub.forum_id,
				sub.forum_name
			FROM (
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
					AND t.forum_id IN ($allowed_forum_ids_sql)
			) sub
			WHERE sub.normalized_title LIKE '$like_prefix'
				OR (sub.normalized_title LIKE '$like_anywhere' AND sub.normalized_title NOT LIKE '$like_prefix')
			ORDER BY 
				CASE 
					WHEN sub.normalized_title LIKE '$like_prefix' THEN 1
					ELSE 2
				END,
				sub.topic_title ASC
			LIMIT " . self::MAX_RESULTS . "
		";

		$result = $this->db->sql_query($sql);

		$topic_rows = [];
		while ($row = $this->db->sql_fetchrow($result))
		{
			$topic_rows[] = $row;
		}
		$this->db->sql_freeresult($result);

		return $topic_rows;
	}
}
