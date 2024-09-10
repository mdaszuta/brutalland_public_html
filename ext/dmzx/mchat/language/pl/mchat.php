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
	'MCHAT_ADD'						=> 'Wyślij',
	'MCHAT_ARCHIVE'					=> 'ARGHiwum',
	'MCHAT_ARCHIVE_PAGE'			=> 'Archiwum',
	'MCHAT_CUSTOM_PAGE'				=> 'mChat',
	'MCHAT_BBCODES'					=> 'BBCodes',
	'MCHAT_CUSTOM_BBCODES'			=> 'Custom BBCodes',
	'MCHAT_DELCONFIRM'				=> 'Czy na pewno chcesz usunąć tę wiadomość?',
	'MCHAT_EDIT'					=> 'Edytuj',
	'MCHAT_EDITINFO'				=> 'Edytuj poniższą wiadomość.',
	'MCHAT_NEW_CHAT'				=> 'Nowa wiadomość na czacie!',
	'MCHAT_SEND_PM'					=> 'Wyślij prywatną wiadomość',
	'MCHAT_LIKE'					=> 'Polub wiadomość',
	'MCHAT_LIKES'					=> 'polubił wiadomość:',
	'MCHAT_FLOOD'					=> 'Nie możesz opublikować kolejnej wiadomości tak szybko po poprzedniej.',
	'MCHAT_FOE'						=> 'Ta wiadomość została napisana przez ignorowanego użytkownika - <strong>%1$s</strong>.',
	'MCHAT_RULES'					=> 'Zasady',
	'MCHAT_WHOIS_USER'				=> 'IP whois - %1$s',
	'MCHAT_MESS_LONG'				=> 'Wiadomość zbyt długa. Skróć ją do %1$d znaków',
	'MCHAT_NO_CUSTOM_PAGE'			=> 'Strona mChat nie jest w tej chwili aktywna.',
	'MCHAT_NO_RULES'				=> 'Strona z zasadami mChat nie jest w tej chwili aktywna.',
	'MCHAT_NOACCESS_ARCHIVE'		=> 'Nie masz uprawnień do czytania archiwum.',
	'MCHAT_NOJAVASCRIPT'			=> 'Włącz JavaScript aby używać mChat.',
	'MCHAT_NOMESSAGE'				=> 'Brak wiadomości',
	'MCHAT_NOMESSAGEINPUT'			=> 'Nie wprowadziłeś żadnej wiadomości',
	'MCHAT_MESSAGE_DELETED'			=> 'Wiadomość została usunięta.',
	'MCHAT_OK'						=> 'OK',
	'MCHAT_PAUSE'					=> 'Zatrzymano',
	'MCHAT_PERMISSIONS'				=> 'Zmień uprawnienia użytkownika',
	'MCHAT_REFRESHING'				=> 'Odświeżanie...',
	'MCHAT_RESPOND'					=> 'Odpowiedz użytkownikowi',
	'MCHAT_SMILES'					=> 'Emotikony',
	'MCHAT_TOTALMESSAGES'			=> 'Wiadomości: <strong>%1$d</strong>',
	'MCHAT_USESOUND'				=> 'Odtwarzaj dźwięki',
	'MCHAT_SOUND_ON'				=> 'Dźwięk włączony',
	'MCHAT_SOUND_OFF'				=> 'Dźwięk wyłączony',
	'MCHAT_ENTER'					=> 'Użyj Ctrl/Cmd + Enter do alternatywnej czynności',
	'MCHAT_ENTER_SUBMIT'			=> 'Enter wysyła wiadomość',
	'MCHAT_ENTER_LINEBREAK'			=> 'Enter dodaje nową linię',
	'MCHAT_COLLAPSE_TITLE'			=> 'Pokaż/ukryj mChat',
	'MCHAT_WHO_IS_REFRESH_EXPLAIN'	=> 'Odświeżane co <strong>%1$d</strong> sekund',
	'MCHAT_MINUTES_AGO'				=> [
		0 => 'przed chwilą',
		1 => '%1$d minutę temu',
		2 => '%1$d minuty temu',
		3 => '%1$d minut temu',
	],

	// These messages are formatted with JavaScript, hence {} and no %d
	'MCHAT_CHARACTER_COUNT'			=> '<strong>{current}</strong> znaków',
	'MCHAT_CHARACTER_COUNT_LIMIT'	=> '<strong>{current}</strong> z {max} znaków',
	'MCHAT_MENTION'					=> ' @{username} ',
]);
