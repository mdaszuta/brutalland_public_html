<?php
declare(strict_types=1);

namespace mdaszuta\topicsearch\controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use phpbb\request\request_interface;
use phpbb\db\driver\driver_interface;
use phpbb\user;
use phpbb\auth\auth;
use phpbb\cache\driver\driver_interface as cache_interface;

class ajax_search
{
	protected $db;
	protected $request;
	protected $user;
	protected $auth;
	protected $cache;

	private const MIN_QUERY_LENGTH = 2;
	private const MAX_QUERY_LENGTH = 100;
	private const MAX_RESULTS = 20;
	private const ALLOWED_FORUMS_CACHE_DURATION = 60; // seconds
	private const ALLOWED_FORUMS_CACHE_PREFIX = 'mdaszuta_topicsearch_allowed_forums_user_';

	public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth, cache_interface $cache)
	{
		$this->db      = $db;
		$this->request = $request;
		$this->user    = $user;
		$this->auth    = $auth;
		$this->cache   = $cache;
	}

	/**
	 * Returns the normalization map used for both PHP and SQL normalization.
	 * If you update this map, ensure both normalize_search_string() and build_normalized_title_sql() stay in sync.
	 */
	private function get_normalization_map()
	{
		static $normalization_map = null;
		if ($normalization_map === null) {
			$normalization_map = require __DIR__ . '/../config/normalization_map.php';
		}
		return $normalization_map;
	}

	private function normalize_search_string(string $str): string
	{
		if (self::is_ascii($str)) {
			return utf8_strtolower($str); // ASCII → just lowercase
		}
		return strtr(utf8_strtolower($str), $this->get_normalization_map());
	}

	private function build_normalized_title_sql($column_title)
	{
		$map = $this->get_normalization_map();
		$sql = "LOWER($column_title)";
		foreach ($map as $map_from => $map_to) {
			$map_from_escaped = $this->db->sql_escape($map_from);
			$map_to_escaped = $this->db->sql_escape($map_to);
			$sql = "REPLACE($sql, '$map_from_escaped', '$map_to_escaped')";
		}
		//error_log("sql: {$sql}");
		return $sql;
	}

	/**
	 * Return true when the string contains only ASCII bytes (0x00‑0x7F).
	 * Fastest method: strspn() counts the initial segment that matches the
	 * allowed range; if that length equals strlen($s), every byte is ASCII.
	 */
	private static function is_ascii(string $s): bool
	{
		// Empty string is ASCII by definition
		return $s === '' || strspn($s, "\0-\x7F") === strlen($s);
	}

	private function get_allowed_forums(): array
	{
		$prefix = self::ALLOWED_FORUMS_CACHE_PREFIX;
		$user_id = (int) $this->user->data['user_id'];
		$cache_key = ($user_id === ANONYMOUS)
			? $prefix . 'guest'
			: sprintf('%s%d', $prefix, $user_id);

		$cached = $this->cache->get($cache_key);
		if ($cached !== false && is_array($cached)) {
			//error_log("[topicsearch] Cache HIT for {$cache_key}");
			return $cached;
		}
			//error_log("[topicsearch] Cache MISS for {$cache_key}");

		$allowed = array_keys($this->auth->acl_getf('f_read', true));
		$this->cache->put($cache_key, $allowed, self::ALLOWED_FORUMS_CACHE_DURATION);

		return $allowed;
	}

	private function flatten_forum_ids(array $ids): string {
    	return implode(',', array_map('intval', $ids));
	}

	public function handle()
	{
		if (!$this->request->is_ajax())
		{
			return new JsonResponse(['error' => 'Invalid request'], 400);
		}

		$query = trim((string) $this->request->variable('q', '', true));
		$query_len = utf8_strlen($query);
		if ($query_len < self::MIN_QUERY_LENGTH || $query_len > self::MAX_QUERY_LENGTH)
		{
			return new JsonResponse([], 204);
		}

		// ✅ Cached allowed forums with read access
		$allowed_forums = $this->get_allowed_forums();
		if (empty($allowed_forums))
		{
			return new JsonResponse([]);
		}

		$normalized_search = $this->normalize_search_string($query);
		// Escape user input for use in LIKE clause - neutralizes % and _ wildcards
		$escaped_search = addcslashes($this->db->sql_escape($normalized_search), '\\%_');

		$can_approve_forums = array_keys($this->auth->acl_getf('m_approve', true));
		// Forums where the user can't approve, we must enforce topic_visibility = 1
		$enforce_visibility_forums = array_diff($allowed_forums, $can_approve_forums);

		$allowed_forum_ids_sql = $this->flatten_forum_ids($allowed_forums);
		$visibility_filter_sql = !empty($enforce_visibility_forums)
			? ' AND (t.topic_visibility = 1 OR t.forum_id NOT IN (' . $this->flatten_forum_ids($enforce_visibility_forums) . '))'
			: '';

		$matched_topics = $this->get_topics($escaped_search, $allowed_forum_ids_sql, $visibility_filter_sql);
		if (empty($matched_topics))
		{
			return new JsonResponse([]);
		}

		$track_topics = ((int) $this->user->data['user_id'] !== ANONYMOUS);
		$forum_topics = [];

		if ($track_topics) {
			foreach ($matched_topics as $row) {
				$forum_id = (int) $row['forum_id'];
				$topic_id = (int) $row['topic_id'];
				$forum_topics[$forum_id][] = $topic_id;
			}
		}

		$topics = [];

		// 🚀 Skip tracking if there are no results
		$topic_tracking_info = [];
		if ($track_topics) {
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
				'title'					=> html_entity_decode($row['topic_title'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
				'topic_last_post_id'	=> (int) $row['topic_last_post_id'],
				'forum'					=> $row['forum_name'],
				'forum_id'				=> $forum_id,
				'unread'				=> $unread,
			];
		}

		return new JsonResponse($topics);
	}

	private function get_topics(string $escaped_search, string $allowed_forum_ids_sql, string $visibility_filter_sql): array
	{
		$sql = $this->build_search_query($escaped_search, $allowed_forum_ids_sql, $visibility_filter_sql);

		$result = $this->db->sql_query($sql);
		$topic_rows = $this->db->sql_fetchrowset($result);
		$this->db->sql_freeresult($result);

		return $topic_rows;
	}

	private function build_search_query(string $escaped_search, string $allowed_forum_ids_sql, string $visibility_filter_sql): string
	{
		// Prepare LIKE patterns
		$like_prefix = $escaped_search . '%';
		$like_anywhere = '%' . $escaped_search . '%';

		$normalized_expr = $this->build_normalized_title_sql('t.topic_title');

		return "
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
					$visibility_filter_sql
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
	}

}
