<?php
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

	/** @var string The SQL expression that normalizes t.topic_title */
	private $normalizedTitleSql;

	private const MIN_QUERY_LENGTH = 2;
	private const MAX_QUERY_LENGTH = 100;
	private const MAX_RESULTS = 20;
	private const ALLOWED_FORUMS_CACHE_DURATION = 60; // seconds

	/**
	 * Character normalization map used for both PHP and SQL string comparisons.
	 * Keep this consistent with frontend normalization in highlightMatch().
	 */
	private const NORMALIZATION_MAP = [
		'ß' => 'ss', 'þ' => 'th', 'ƿ' => 'w', 'ð' => 'd', 'ø' => 'o',
		'æ' => 'ae', 'œ' => 'oe', 'ł' => 'l', 'ı' => 'i', '§' => 's',
		'µ' => 'u', '¡' => '!', '¿' => '?',
	];

	public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth, cache_interface $cache)
	{
		$this->db      = $db;
		$this->request = $request;
		$this->user    = $user;
		$this->auth    = $auth;
		$this->cache   = $cache;

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

	private function get_allowed_forums(): array
	{
		$is_guest = ($this->user->data['user_id'] == ANONYMOUS);
		$cache_key = $is_guest
			? 'topicsearch_allowed_forums_guest'
			: 'topicsearch_allowed_forums_' . (int) $this->user->data['user_id'];

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

	public function handle()
	{
		$q = trim((string) $this->request->variable('q', '', true));
		$q_len = utf8_strlen($q);
		if ($q_len < self::MIN_QUERY_LENGTH || $q_len > self::MAX_QUERY_LENGTH)
		{
			return new JsonResponse([], 204);
		}
		$lowercase_search = utf8_strtolower($q);
		$normalized_search = $this->normalize_search_string($lowercase_search);
		// Escape user input for use in LIKE clause - neutralizes % and _ wildcards
		$escaped_search = addcslashes($this->db->sql_escape($normalized_search), '%_');

		// ✅ Cached allowed forums with read access
		$allowed_forums = $this->get_allowed_forums();
		$can_approve_forums = array_keys($this->auth->acl_getf('m_approve', true));

		// Forums where the user can't approve, we must enforce topic_visibility = 1
		$enforce_visibility_forums = array_diff($allowed_forums, $can_approve_forums);

		if (empty($allowed_forums))
		{
			return new JsonResponse([]);
		}
		$allowed_forum_ids_sql = implode(',', array_map('intval', $allowed_forums));
		$visibility_filter_sql = !empty($enforce_visibility_forums)
			? ' AND (t.topic_visibility = 1 OR t.forum_id NOT IN (' . implode(',', array_map('intval', $enforce_visibility_forums)) . '))'
			: '';

		// Prepare LIKE patterns
		$like_prefix = $escaped_search . '%';
		$like_anywhere = '%' . $escaped_search . '%';

		// Main SQL: normalize in a subquery, then apply prefix/substring logic
		$matched_topics = $this->get_topics($escaped_search, $like_prefix, $like_anywhere, $allowed_forum_ids_sql, $visibility_filter_sql);

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

	private function get_topics(string $escaped_search, string $like_prefix, string $like_anywhere, string $allowed_forum_ids_sql, string $visibility_filter_sql): array
	{
		$sql = $this->build_search_query($escaped_search, $like_prefix, $like_anywhere, $allowed_forum_ids_sql, $visibility_filter_sql);

		$result = $this->db->sql_query($sql);

		$topic_rows = [];
		while ($row = $this->db->sql_fetchrow($result))
		{
			$topic_rows[] = $row;
		}
		$this->db->sql_freeresult($result);

		return $topic_rows;
	}

	private function build_search_query(string $escaped_search, string $like_prefix, string $like_anywhere, string $allowed_forum_ids_sql, string $visibility_filter_sql): string
	{
		$normalized_expr = $this->normalizedTitleSql;

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
