<?php
namespace yourvendor\topicsearch\controller;

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

    public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth)
    {
        $this->db      = $db;
        $this->request = $request;
        $this->user    = $user;
        $this->auth    = $auth;
    }

    public function handle()
    {
        // Start session and basic setup, if needed.
        // (Usually, phpBB has already initiated these in the front controller.)

        // header('Content-Type: application/json');

        // Retrieve and normalize search term.
        $q = trim((string) $this->request->variable('q', '', true));
        if (utf8_strlen($q) < 2)
        {
            return new JsonResponse([]);
        }
        $search_term = utf8_strtolower($q);

        // Get allowed forum IDs based on user permissions.
        $allowed_forums = [];
        $sql = 'SELECT forum_id FROM ' . FORUMS_TABLE;
        $result = $this->db->sql_query($sql);
        while ($row = $this->db->sql_fetchrow($result))
        {
            if ($this->auth->acl_get('f_list', $row['forum_id']))
            {
                $allowed_forums[] = (int) $row['forum_id'];
            }
        }
        $this->db->sql_freeresult($result);

        if (empty($allowed_forums))
        {
            // No access to any forums.
            return new JsonResponse([]);
        }
        $allowed_forums_list = implode(',', $allowed_forums);

        // Build UNION query with priorities.
        $escaped = $this->db->sql_escape($search_term);
        $sql_union = "
        (
          SELECT 
            t.topic_id, 
            t.topic_title, 
            f.forum_id, 
            f.forum_name,
            1 AS priority
          FROM " . TOPICS_TABLE . " t
          JOIN " . FORUMS_TABLE . " f ON t.forum_id = f.forum_id
          WHERE 
            LOWER(t.topic_title) LIKE '" . $escaped . "%'
            AND t.topic_status <> " . ITEM_MOVED . "
            AND t.forum_id IN ($allowed_forums_list)
        )
        UNION ALL
        (
          SELECT 
            t.topic_id, 
            t.topic_title, 
            f.forum_id, 
            f.forum_name,
            2 AS priority
          FROM " . TOPICS_TABLE . " t
          JOIN " . FORUMS_TABLE . " f ON t.forum_id = f.forum_id
          WHERE 
            LOWER(t.topic_title) NOT LIKE '" . $escaped . "%'
            AND LOWER(t.topic_title) LIKE '%" . $escaped . "%'
            AND t.topic_status <> " . ITEM_MOVED . "
            AND t.forum_id IN ($allowed_forums_list)
        )
        ORDER BY priority ASC, topic_title ASC
        LIMIT 20
        ";

        $result = $this->db->sql_query($sql_union);
        $topics = [];
        while ($row = $this->db->sql_fetchrow($result))
        {
            $topics[] = [
                'id'       => (int) $row['topic_id'],
                'title'    => $row['topic_title'],
                'forum'    => $row['forum_name'],
                'forum_id' => (int) $row['forum_id']
            ];
        }
        $this->db->sql_freeresult($result);

        return new JsonResponse($topics);
    }
}
