<?php
/**
*
* @package Autologin
* @copyright (c) 2016 LavIgor
* @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
*
*/

namespace lavigor\autologin\event;

/**
* @ignore
*/
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
* Event listener
*/
class listener implements EventSubscriberInterface
{
	/** @var \phpbb\user */
	protected $user;

	public function __construct(\phpbb\user $user)
	{
		$this->user = $user;
	}

	static public function getSubscribedEvents()
	{
		return array(
			'core.user_add_after'	=> 'user_add_after',
			'core.ucp_activate_after'	=> 'ucp_activate_after',
		);
	}

	public function user_add_after($event)
	{
		// Ensure that we do it only when the user registers themselves.
		if (check_form_key('ucp_register', -1))
		{
			$this->user->session_create($event['user_id'], false, true, true);
		}
	}

	public function ucp_activate_after($event)
	{
		// Ensure that we do it only when the user activates themselves.
		if (in_array($event['message'], array('ACCOUNT_ACTIVE_PROFILE', 'ACCOUNT_ACTIVE')))
		{
			$this->user->session_create($event['user_row']['user_id'], false, true, true);
		}
	}
}
