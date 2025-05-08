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

    public function __construct(driver_interface $db, request_interface $request, user $user, auth $auth)
    {
        $this->db      = $db;
        $this->request = $request;
        $this->user    = $user;
        $this->auth    = $auth;
    }

    private function normalization_map()
    {
        return [
            'ß' => 'ss', 'þ' => 'th', 'ƿ' => 'w', 'ð' => 'd', 'ø' => 'o', 'æ' => 'ae', 'œ' => 'oe', 'ł' => 'l', 'ı' => 'i', '§' => 's', 'µ' => 'u', '¡' => '!', '¿' => '?',
        ];
    }

    private function normalize_string($str)
    {
        return strtr($str, $this->normalization_map());
    }

    private function build_normalize_sql($column)
    {
        $map = $this->normalization_map();
        $sql = "LOWER($column)";
        foreach ($map as $from => $to) {
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
            return new JsonResponse([]);
        }
        $allowed_forums_list = implode(',', $allowed_forums);

        // Dynamically build normalization SQL
        $normalize_sql = $this->build_normalize_sql('t.topic_title');

        $sql_union = "
        (
          SELECT 
            t.topic_id, 
            t.topic_title, 
            t.topic_last_post_id, 
            t.topic_last_post_time, 
            f.forum_id, 
            f.forum_name,
            1 AS priority
          FROM " . TOPICS_TABLE . " t
          JOIN " . FORUMS_TABLE . " f ON t.forum_id = f.forum_id
          WHERE 
            $normalize_sql LIKE '" . $escaped . "%'
            AND t.topic_status <> " . ITEM_MOVED . "
            AND t.forum_id IN ($allowed_forums_list)
        )
        UNION ALL
        (
          SELECT 
            t.topic_id, 
            t.topic_title, 
            t.topic_last_post_id, 
            t.topic_last_post_time, 
            f.forum_id, 
            f.forum_name,
            2 AS priority
          FROM " . TOPICS_TABLE . " t
          JOIN " . FORUMS_TABLE . " f ON t.forum_id = f.forum_id
          WHERE 
            $normalize_sql NOT LIKE '" . $escaped . "%'
            AND $normalize_sql LIKE '%" . $escaped . "%'
            AND t.topic_status <> " . ITEM_MOVED . "
            AND t.forum_id IN ($allowed_forums_list)
        )
        ORDER BY priority ASC, topic_title ASC
        LIMIT 20
        ";

        $result = $this->db->sql_query($sql_union);

        // Gather topics and forums for tracking
        $topics_raw = [];
        $forum_topics = [];

        while ($row = $this->db->sql_fetchrow($result))
        {
            $topics_raw[] = $row;
            $forum_id = (int)$row['forum_id'];
            $topic_id = (int)$row['topic_id'];
            if (!isset($forum_topics[$forum_id])) {
                $forum_topics[$forum_id] = [];
            }
            $forum_topics[$forum_id][] = $topic_id;
        }
        $this->db->sql_freeresult($result);

        // Only get tracking info for registered users
        if ($this->user->data['user_id'] != ANONYMOUS) {
            $topic_tracking_info = [];
            foreach ($forum_topics as $forum_id => $topic_ids) {
                // get_complete_topic_tracking returns [topic_id => last_read_time]
                $topic_tracking_info += get_complete_topic_tracking($forum_id, $topic_ids);
            }
        } else {
            $topic_tracking_info = [];
        }

        $topics = [];
        foreach ($topics_raw as $row)
        {
            $topic_id = (int)$row['topic_id'];
            $forum_id = (int)$row['forum_id'];

            // For guests, always mark as read
            if ($this->user->data['user_id'] == ANONYMOUS) {
                $unread = false;
            } else {
				$last_post_time = (int)$row['topic_last_post_time'];
                $last_read = isset($topic_tracking_info[$topic_id]) ? (int)$topic_tracking_info[$topic_id] : 0;
                $unread = ($last_post_time > $last_read);
            }

            $topics[] = [
                'id'       => $topic_id,
                'title'    => $row['topic_title'],
                'topic_last_post_id' => (int) $row['topic_last_post_id'],
                'forum'    => $row['forum_name'],
                'forum_id' => $forum_id,
                'unread'   => $unread,
            ];
        }

        return new JsonResponse($topics);
    }
}
