<?php

/**
 *
 * @package phpBB Extension - Post Numbers
 * @copyright (c) 2016 kasimi - https://kasimi.net
 * @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
 * Russian translation by SouthKlad (http://southklad.ru/)
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

$lang = array_merge($lang, [
	'POSTNUMBERS_ENABLED_VIEWTOPIC'			=> 'Показать количество сообщений при просмотре темы',
	'POSTNUMBERS_ENABLED_REVIEW_REPLY'		=> 'Показать количество сообщений при написании ответа',
	'POSTNUMBERS_ENABLED_REVIEW_MCP'		=> 'Показать количество сообщений в MCP',
	'POSTNUMBERS_SKIP_NONAPPROVED'			=> 'Игнорировать неодобренные сообщения',
	'POSTNUMBERS_SKIP_NONAPPROVED_EXP'		=> 'Игнорировать количество сообщений для неодобренных или удаленных сообщений',
	'POSTNUMBERS_DISPLAY_IDS'				=> 'Показывать сквозной ID сообщения вместо номера внутри темы',
	'POSTNUMBERS_DISPLAY_IDS_EXP'			=> 'Если включено, то <span style="font-style: italic;">Пропускать сообщения, которые не были одобрены</span> выше будут проигнорированы',
	'POSTNUMBERS_LOCATION'					=> 'Местоположение номера сообщения',
	'POSTNUMBERS_LOCATION_AUTHOR'			=> 'Перед изображением сообщения и именем автора',
	'POSTNUMBERS_LOCATION_BEFORE_SUBJECT'	=> 'В заголовке сообщения',
	'POSTNUMBERS_LOCATION_SUBJECT'			=> 'Replace post subject',
	'POSTNUMBERS_CLIPBOARD'					=> 'Копировать ссылку на сообщение в буфер обмена при нажатии на номер сообщения',
	'POSTNUMBERS_CLIPBOARD_EXP'				=> 'Только если номера сообщений отображаются между изображением и после имени автора сообщения. Работает только в современных браузерах, не менее: Chrome 43, Firefox 41, IE 9, Opera 29, Safari 10. Неподдерживаемые браузеры отображают подсказку, содержащую ссылку на сообщению вместо этого.',
	'POSTNUMBERS_BOLD'						=> 'Сделайть номер сообщения / IDs выделенными жирным шрифтом',
	'POSTNUMBERS_BOLD_EXP'					=> 'Только если номера сообщений отображаются между изображением и после имени автора сообщения',
]);
