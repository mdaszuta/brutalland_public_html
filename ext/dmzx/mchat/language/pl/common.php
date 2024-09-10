<?php

/**
 *
 * @package phpBB Extension - mChat
 * @copyright (c) 2016 dmzx - http://www.dmzx-web.net
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
	$lang = [];
}

// DEVELOPERS PLEASE NOTE
//
// All language files should use UTF-8 as their encoding and the files must not contain a BOM.
//
// Placeholders can now contain order information, e.g. instead of
// 'Page %s of %s' you can (and should) write 'Page %1$s of %2$s', this allows
// translators to re-order the output of data while ensuring it remains correct
//
// You do not need this where single placeholders are used, e.g. 'Message %d' is fine
// equally where a string contains only two placeholders which are used to wrap text
// in a url you again do not need to specify an order e.g., 'Click %sHERE%s' is fine
//
// Some characters for use
// ’ » “ ” …

$lang = array_merge($lang, [
	'MCHAT_TITLE'					=> 'UGH',
	'MCHAT_TITLE_COUNT'				=> [
		0 => 'mChat',
		1 => 'mChat [<strong>%1$d</strong>]',
	],
	'MCHAT_NAVBAR_CUSTOM_PAGE'		=> 'Strona mChat',
	'MCHAT_NAVBAR_ARCHIVE'			=> 'ARGHiwum',
	'MCHAT_NAVBAR_RULES'			=> 'Zasady',

	// Who is chatting
	'MCHAT_WHO_IS_CHATTING'			=> 'Na czacie:',
	'MCHAT_ONLINE_USERS_TOTAL'		=> [
		0 => 'Nikt nie czatuje',
		1 => 'Na czacie: <strong>%1$d</strong> użytkownik',
		2 => 'Na czacie: <strong>%1$d</strong> użytkownicy',
		3 => 'Na czacie: <strong>%1$d</strong> użytkowników',
	],
	'MCHAT_ONLINE_EXPLAIN'			=> 'według danych z ostatnich %1$s',
	'MCHAT_HOURS'					=> [
		1 => '%1$d godziny',
		2 => '%1$d godzin',
	],
	'MCHAT_MINUTES'					=> [
		1 => '%1$d minuty',
		2 => '%1$d minut',
	],
	'MCHAT_SECONDS'					=> [
		1 => '%1$d sekundy',
		2 => '%1$d sekund',
	],

	// Custom translations for administrators
	'MCHAT_RULES_MESSAGE'			=> '',
	'MCHAT_STATIC_MESSAGE'			=> '',

	// Post notification messages (%1$s is replaced with a link to the new/edited post, %2$s is replaced with a link to the forum)
	'MCHAT_NEW_POST'				=> 'posted a new topic: %1$s in %2$s',
	'MCHAT_NEW_POST_DELETED'		=> 'posted a new topic that was deleted',
	'MCHAT_NEW_REPLY'				=> 'posted a reply: %1$s in %2$s',
	'MCHAT_NEW_REPLY_DELETED'		=> 'posted a reply that was deleted',
	'MCHAT_NEW_QUOTE'				=> 'replied with a quote: %1$s in %2$s',
	'MCHAT_NEW_QUOTE_DELETED'		=> 'posted a reply that was deleted',
	'MCHAT_NEW_EDIT'				=> 'edited a post: %1$s in %2$s',
	'MCHAT_NEW_EDIT_DELETED'		=> 'edited a post that was deleted',
	'MCHAT_NEW_LOGIN'				=> 'just logged in',
]);
