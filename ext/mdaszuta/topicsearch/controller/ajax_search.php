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
	}

	private function normalize_string($str)
	{
		return strtr($str, self::NORMALIZATION_MAP);
	}

	private function build_normalize_sql($column)
	{
		$sql = "LOWER($column)";
		foreach (self::NORMALIZATION_MAP as $from => $to) {
			// Escape single quotes for SQL
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
		$escaped = $this->db->sql_escape($normalized_search);

		// ✅ Cached allowed forums
		$allowed_forums = array_keys($this->auth->acl_getf('f_list', true));

		if (empty($allowed_forums))
		{
			return new JsonResponse([]);
		}
		$allowed_forums_sql = implode(',', array_map('intval', $allowed_forums));

		// Build normalization expression once for use in subquery
		$normalized_expr = $this->build_normalize_sql('t.topic_title');

		$like_prefix = $escaped . '%';
		$like_anywhere = '%' . $escaped . '%';

		$sql_block = "
			SELECT * FROM (
				SELECT 
					t.topic_id, 
					t.topic_title, 
					t.topic_last_post_id, 
					t.topic_last_post_time, 
					f.forum_id, 
					f.forum_name,
					" . $normalized_expr . " AS normalized_title
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

		$result = $this->db->sql_query($sql_block);

		$topics_raw = [];
		$forum_topics = [];
		$track_topics = ($this->user->data['user_id'] != ANONYMOUS);

		while ($row = $this->db->sql_fetchrow($result))
		{
			$topics_raw[] = $row;

			if ($track_topics) {
				$forum_id = (int)$row['forum_id'];
				$topic_id = (int)$row['topic_id'];

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
			$topic_id = (int)$row['topic_id'];
			$forum_id = (int)$row['forum_id'];

			$unread = false;
			if ($track_topics) {
				$last_post_time = (int)$row['topic_last_post_time'];
				$last_read = isset($topic_tracking_info[$topic_id]) ? (int)$topic_tracking_info[$topic_id] : 0;
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
