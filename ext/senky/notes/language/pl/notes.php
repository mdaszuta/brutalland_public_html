<?php
/**
*
* Notes extension for the phpBB Forum Software package.
*
* @copyright (c) 2016 Senky <https://github.com/Senky>
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

$lang = array_merge($lang, array(
	'NOTES'				=> 'Notatnik',
	'NOTES_DESCRIPTION'	=> 'Twoje notatki:',
	'SAVE_NOTES'		=> 'Zapisz',
	'NOTES_SAVED'		=> 'Zapisano zmiany.<br /><br /> <a href="%s">Wróć do Notatnika</a>',
));
