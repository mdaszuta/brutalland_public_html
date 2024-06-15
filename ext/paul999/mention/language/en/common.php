<?php
/**
 *
 * phpBB mentions. An extension for the phpBB Forum Software package.
 *
 * @copyright (c) 2016, paul999, https://www.phpbbextensions.io
 * @license GNU General Public License, version 2 (GPL-2.0)
 *
 */

if (!defined('IN_PHPBB'))
{
	exit;
}

if (empty($lang) || !is_array($lang))
{
	$lang = array();
}

/**
 * As there is no proper way of including this file just when the notification is
 * loaded we need to include it on all pages. Make sure to only include important
 * language items (That are directly needed by the notification system) in this file.
 */

$notification_mention_string = '<div class="notifications_reference">%2$s</div>Mentioned by %1$s';

$lang = array_merge($lang, array(
	'MENTION_MENTION_NOTIFICATION'	=> $notification_mention_string,
	'NOTIFICATION_TYPE_MENTION'     => 'Someone mentioned me'
));
