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
	'NOTES'				=> 'Notes',
	'NOTES_DESCRIPTION'	=> 'Your notes:',
	'SAVE_NOTES'		=> 'Save',
	'NOTES_SAVED'		=> 'Changes saved.<br /><br /> <a href="%s">Return to Notes</a>',
));
