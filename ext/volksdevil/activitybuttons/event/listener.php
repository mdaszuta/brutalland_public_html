<?php
/**
*
* @package phpBB Extension - Activity Buttons
* @copyright (c) 2016 Neil "Volksdevil" Riley (http://www.CorradoG60.com)
* @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
*
*/

namespace volksdevil\activitybuttons\event;

/**
* @ignore
*/
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
* Event listener
*/
class listener implements EventSubscriberInterface
{
	/** @var \phpbb\auth\auth */
	protected $auth;

	/** @var \phpbb\config\config */
	protected $config;

	/** @var \phpbb\template\template */
	protected $template;

	/* @var \phpbb\request\request */
	protected $request;

	/* @var \phpbb\user */
	protected $user;

	/* @var \phpbb\path_helper */
	protected $helper;


	/**
		* Constructor
		*
		* @param \phpbb\auth\auth			auth			Authentication object
		* @param \phpbb\config\config		$config			Config Object
		* @param \phpbb\template\template	$template		Template object
		* @param \phpbb\request\request		$request		Request object
		* @param \phpbb\user				$user			User Object
		* @param \phpbb\path_helper			$path_helper	Controller helper object
		* @access public
		*/
	public function __construct(\phpbb\auth\auth $auth, \phpbb\config\config $config, \phpbb\template\template $template, $db,  \phpbb\request\request $request, \phpbb\user $user, \phpbb\path_helper $path_helper)
	{
			$this->auth = $auth;
			$this->config = $config;
			$this->template = $template;
			$this->db = $db;
			$this->request = $request;
			$this->user = $user;
			$this->path_helper = $path_helper;
	}

	static public function getSubscribedEvents()
	{
		return array(
			'core.page_header_after'		=> 'display_count',
			'core.user_setup'	=> 'add_lang',
		);
	}

	public function display_count($event)
	{
		if ($this->user->data['is_registered'])
		{
			$ex_fid_ary = array_unique(array_merge(array_keys($this->auth->acl_getf('!f_read', true)), array_keys($this->auth->acl_getf('!f_search', true))));

			if ($this->auth->acl_get('m_approve'))
			{
				$m_approve_fid_sql = '';
			}
			else if ($this->auth->acl_getf_global('m_approve'))
			{
				$m_approve_fid_ary = array_diff(array_keys($this->auth->acl_getf('!m_approve', true)), $ex_fid_ary);
				$m_approve_fid_sql = ' AND (p.post_visibility = 1' . ((sizeof($m_approve_fid_ary)) ? ' OR ' . $this->db->sql_in_set('p.forum_id', $m_approve_fid_ary, true) : '') . ')';
			}
			else
			{
				$m_approve_fid_sql = ' AND p.post_visibility = 1';
			}

	// Count Unread Posts
	$not_readable = array_keys($this->auth->acl_getf('!f_read', true));
	$unread_topics = get_unread_topics($this->user->data['user_id'], ((sizeof($not_readable)) ? ' AND ' . $this->db->sql_in_set('t.forum_id', $not_readable, true) : ''));
	$unread_cnt = count($unread_topics);
	$unread_posts = 0;
	$sql_where = '';
	$i = 0;
	if ($unread_cnt)
	{
			foreach ($unread_topics as $topic_id => $mark_time)
		{
			if ($i > 0)
			{
			$sql_where .=  'OR ';
			}
			$sql_where .= '(topic_id = ' . $topic_id . ' AND post_time > ' . $mark_time . ' AND post_visibility = 1) ';
			$i++;
		}
			$sql = 'SELECT COUNT(post_id) AS posts FROM ' . POSTS_TABLE . "
			WHERE $sql_where";
			$result = $this->db->sql_query($sql);

			if($row = $this->db->sql_fetchrow($result))
			{
			$unread_posts = $row['posts'];
			}
			$this->db->sql_freeresult($result);
	}
	// Count Unread Posts

			$this->template->assign_vars(array(
			'L_AB_UNREAD'=> $this->user->lang['AB_UNREAD'] . '' . $unread_posts,
			));
		}
	}
	

	/**
	* Add Activity Buttons language
	*
	* @param object		$event		Event object
	* @return null
	* @access public
	*/
	public function add_lang($event)
	{
		$lang_set_ext = $event['lang_set_ext'];
		$lang_set_ext[] = array(
			'ext_name' => 'volksdevil/activitybuttons',
			'lang_set' => 'common',
		);
		$event['lang_set_ext'] = $lang_set_ext;
	}

}