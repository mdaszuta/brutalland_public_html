<?php
/**
*
* Hide Bots extension for the phpBB Forum Software package.
*
* @copyright 2016 Rich McGirr (RMcGirr83)
* @license GNU General Public License, version 2 (GPL-2.0)
*
*/
namespace rmcgirr83\hidebots\event;

/**
* @ignore
*/
use phpbb\auth\auth;
use phpbb\config\config;
use phpbb\language\language;
use phpbb\template\template;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
* Event listener
*/
class listener implements EventSubscriberInterface
{
	/** @var \phpbb\auth\auth */
	protected $auth;

	/* @var \phpbb\config\config */
	protected $config;

	/** @var \phpbb\language\language */
	protected $language;

	/** @var \phpbb\template\template */
	protected $template;

	/**
	* Constructor
	*
	*/
	public function __construct (
			auth $auth,
			config $config,
			language $language,
			template $template)
	{
		$this->auth = $auth;
		$this->config = $config;
		$this->language = $language;
		$this->template = $template;
	}

	static public function getSubscribedEvents ()
	{
		return array(
			'core.acp_extensions_run_action_after'	=>	'acp_extensions_run_action_after',
			'core.obtain_users_online_string_modify'	=> 'change_online_string',
			'core.viewonline_modify_sql'				=> 'change_sql_array',
			// activity 24 hours extension
			'rmcgirr83.activity24hours.modify_active_users'	=> 'activity24hours_modify'
		);
	}

	/* Display additional metdate in extension details
	*
	* @param $event			event object
	* @param return null
	* @access public
	*/
	public function acp_extensions_run_action_after($event)
	{
		if ($event['ext_name'] == 'rmcgirr83/hidebots' && $event['action'] == 'details')
		{
			$this->language->add_lang('common', $event['ext_name']);
			$this->template->assign_var('S_BUY_ME_A_BEER_HIDEBOTS', true);
		}
	}

	public function change_online_string ($event)
	{
		// only run for non admins
		// most of code from phpBB Extension - tas2580 Hide Bots
		//* @copyright (c) 2015 tas2580 (https://tas2580.net)
		//if (!$this->auth->acl_get('a_'))
		//{
			$online_users = $event['online_users'];
			$user_online_link = $event['user_online_link'];
			foreach ($event['rowset'] as $row)
			{
				if ($row['user_type'] == USER_IGNORE && $row['user_allow_viewonline'])
				{
					unset($online_users['online_users'][$row['user_id']]);
					unset($user_online_link[$row['user_id']]);
					$online_users['hidden_online']++;
					$online_users['visible_online']--;
				}
			}
			$visible_online = $this->language->lang('REG_USERS_TOTAL', (int) $online_users['visible_online']);
			$hidden_online = $this->language->lang('HIDDEN_USERS_TOTAL', (int) $online_users['hidden_online']);
			if ($this->config['load_online_guests'])
			{
				$guests_online = $this->language->lang('GUEST_USERS_TOTAL', (int) $online_users['guests_online']);
				$l_online_users = $this->language->lang('ONLINE_USERS_TOTAL_GUESTS', (int) $online_users['total_online'], $visible_online, $hidden_online, $guests_online);
			}
			else
			{
				$l_online_users = $this->language->lang('ONLINE_USERS_TOTAL', (int) $online_users['total_online'], $visible_online, $hidden_online);
			}
			$online_userlist = implode(', ', $user_online_link);
			if (!$online_userlist)
			{
				$online_userlist = $this->language->lang('NO_ONLINE_USERS');
			}
			$item_caps = strtoupper($event['item']);
			if ($event['item_id'] === 0)
			{
				$online_userlist = $this->language->lang('REGISTERED_USERS') . ' ' . $online_userlist;
			}
			else if ($this->config['load_online_guests'])
			{
				$online_userlist = $this->language->lang('BROWSING_' . $item_caps . '_GUESTS', $online_users['guests_online'], $online_userlist);
			}
			else
			{
				$online_userlist = sprintf($this->language->lang('BROWSING_' . $item_caps), $online_userlist);
			}
			$event['l_online_users'] = $l_online_users;
			$event['online_userlist'] = $online_userlist;
		//}
	}

	public function change_sql_array ($event)
	{
		// only run for non admins
		if (!$this->auth->acl_get('a_'))
		{
			$sql_ary = $event['sql_ary'];
			$sql_ary['WHERE'] .= ' AND u.user_type <> ' . USER_IGNORE;
			$event['sql_ary'] = $sql_ary;
		}
	}

	public function activity24hours_modify ($event)
	{
		// only run for non admins
		if (!$this->auth->acl_get('a_'))
		{
			$active_users = $event['active_users'];

			$active_users_cleaned = $active_users ? $this->clean_array($active_users, 'user_type', USER_IGNORE) : array();

			$event['active_users'] = $active_users_cleaned;
		}
	}

	private function clean_array ($array, $key, $value)
	{
		foreach ($array as $subkey => $subarray)
		{
			if ($subarray[$key] == $value)
			{
				unset($array[$subkey]);
			}
		}
		return $array;
	}
}
