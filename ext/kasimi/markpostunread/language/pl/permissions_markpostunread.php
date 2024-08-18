<?php

/**
 *
 * @package phpBB Extension - Mark Post Unread
 * @copyright (c) 2016 kasimi - https://kasimi.net
 * @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
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

$lang = array_merge($lang, array(
	// Permission
	'ACL_U_MARKPOSTUNREAD_USE' => 'Can mark posts unread',
));
