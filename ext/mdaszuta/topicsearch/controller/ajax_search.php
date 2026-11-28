<?php
declare(strict_types=1);

namespace mdaszuta\topicsearch\controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use phpbb\request\request_interface;
use phpbb\db\driver\driver_interface;
use phpbb\user;
use phpbb\auth\auth;
use phpbb\config\config;
use phpbb\content_visibility;

class ajax_search
{
	protected $db;
	protected $request;
	protected $user;
	protected $auth;
	protected $config;
	protected $content_visibility;

	private const MIN_QUERY_LENGTH = 2;
	private const MAX_QUERY_LENGTH = 100;
	private const MAX_RESULTS = 20;

	/**
	 * Constructor for the ajax_search class.
	 * Initializes the database driver, request handler, user object, auth system, configuration object, and content visibility handler.
	 * @param driver_interface $db Database driver instance
	 * @param request_interface $request Request handler instance
	 * @param user $user User object
	 * @param auth $auth Authentication system
	 * @param config $config Configuration object
	 * @param content_visibility $content_visibility Content visibility service for handling topic visibility based on user permissions
	 */
	public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth, config $config, content_visibility $content_visibility)
	{
		$this->db      = $db;
		$this->request = $request;
		$this->user    = $user;
		$this->auth    = $auth;
		$this->config  = $config;
		$this->content_visibility = $content_visibility;
	}

	/**
	 * Get the normalization map for special character replacements.
	 * This map is used to ensure that both PHP and SQL use the same normalization rules
	 * for case-insensitive and special character-insensitive comparisons.
	 * The map is loaded from a configuration file.
	 * @return array<string, string> The normalization map
	 */
	private function get_normalization_map(): array
	{
		static $normalization_map = null;
		if ($normalization_map === null) {
			$normalization_map = require __DIR__ . '/../config/normalization_map.php';
		}
		return $normalization_map;
	}

	/**
	 * Normalize the search string for case-insensitive and special character-insensitive comparison.
	 * This function converts the string to lowercase and replaces special characters
	 * according to the normalization map defined in config/normalization_map.php.
	 * It ensures that both PHP and SQL use the same normalization rules.
	 * @param string $str The input search string
	 * @return string The normalized search string
	 */
	private function normalize_search_string(string $str): string
	{
		if (self::is_ascii($str)) {
			return utf8_strtolower($str); // ASCII → just lowercase
		}
		return strtr(utf8_strtolower($str), $this->get_normalization_map());
	}

	/**
	 * Build a SQL expression that normalizes the topic title for case-insensitive
	 * and special character-insensitive comparison.
	 * This is used in the SQL WHERE clause to match the normalized search string.
	 * @param string $column_title The name of the column containing the topic title
	 * @return string The SQL expression for normalized title comparison
	 */
	private function build_normalized_title_sql(string $column_title): string
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
	 * Return true when the string contains only ASCII bytes (0x00-0x7F).
	 * This is used to determine if the string can be normalized using simple lowercase conversion
	 * or if it requires special character normalization.
	 * @param string $str The input string
	 * @return bool True if the string is ASCII (empty string is considered ASCII), false otherwise
	 */
	private static function is_ascii(string $str): bool
	{
		return mb_check_encoding($str, 'ASCII');
	}

	/**
	 * Get the list of allowed forums for the current user.
	 * It retrieves the allowed forums from the auth system and returns the list.
	 * @return array<int> List of forum IDs that the user can read
	 */
	private function get_allowed_forums(): array
	{
		$allowed = array_keys($this->auth->acl_getf('f_read', true));
		$passworded = $this->user->get_passworded_forums();

        if (!empty($passworded)) {
            $allowed = array_diff($allowed, $passworded);
        }

        return array_values(array_map('intval', $allowed));
	}

	/**
	 * Handle the AJAX search request.
	 * This method processes the search query, retrieves allowed forums,
	 * normalizes the search string, and fetches matching topics from the database.
	 * It returns a JSON response with the list of matching topics.
	 * @return JsonResponse JSON response containing the search results
	 */
	public function handle(): JsonResponse
	{
		if (!$this->request->is_ajax()) {
			return new JsonResponse(['error' => 'Invalid request'], 400);
		}

		// Check if search is enabled, user has permission, and not a bot
		if (!$this->config['load_search'] || !$this->auth->acl_get('u_search') || !empty($this->user->data['is_bot'])) {
            return new JsonResponse(['error' => 'Search unavailable'], 403);
        }

		$query = trim((string) $this->request->variable('q', '', true));
		$query_len = utf8_strlen($query);
		if ($query_len < self::MIN_QUERY_LENGTH || $query_len > self::MAX_QUERY_LENGTH) {
			return new JsonResponse([]);
		}

		// Get list of allowed forums for current user
		$allowed_forums = $this->get_allowed_forums();
		if (empty($allowed_forums)) {
			return new JsonResponse([]);
		}

		$normalized_search = $this->normalize_search_string($query);
		// Escape user input for use in LIKE clause - neutralizes % and _ wildcards
		$escaped_search = $this->db->sql_escape(addcslashes($normalized_search, '\\%_'));

		// Build complete forum + topic visibility SQL (handles approved, unapproved, soft-deleted, and reapprove states)
		$visibility_sql = $this->content_visibility->get_forums_visibility_sql('topic', $allowed_forums, 't.');

		$matched_topics = $this->get_topics($escaped_search, $visibility_sql);
		if (empty($matched_topics)) {
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
				'forum'					=> html_entity_decode($row['forum_name'], ENT_QUOTES | ENT_HTML5, 'UTF-8'),
				'forum_id'				=> $forum_id,
				'unread'				=> $unread,
			];
		}

		return new JsonResponse($topics);
	}

	/**
	 * Retrieve topics matching the search query from the database.
	 * This method constructs and executes the SQL query to find topics
	 * that match the normalized search string, within allowed forums.
	 * It returns an array of topic rows with relevant information.
	 * @param string $escaped_search The normalized and escaped search string
	 * @param string $visibility_sql Complete SQL condition for allowed forums and topic visibility
	 * @return array Array of topic rows matching the search criteria
	 */
	private function get_topics(string $escaped_search, string $visibility_sql): array
	{
		$sql = $this->build_search_query($escaped_search, $visibility_sql);

		$result = $this->db->sql_query($sql);
		$topic_rows = $this->db->sql_fetchrowset($result);
		$this->db->sql_freeresult($result);

		return $topic_rows;
	}

	/**
	 * Build the SQL query to search for topics matching the normalized search string.
	 * This method constructs a SQL query that searches for topics whose titles
	 * match the normalized search string, within the allowed forums.
	 * It uses LIKE patterns to find matches at the beginning or anywhere in the title.
	 * @param string $escaped_search The normalized and escaped search string
	 * @param string $visibility_sql Complete SQL condition for allowed forums and topic visibility
	 * @return string The SQL query string
	 */
	private function build_search_query(string $escaped_search, string $visibility_sql): string
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
					AND ({$visibility_sql})
			) sub
			WHERE sub.normalized_title LIKE '$like_anywhere'
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
