<?php

/**
 *
 * @package phpBB Extension - Mark Post Unread
 * @copyright (c) 2015 kasimi - https://kasimi.net
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
	// Viewtopic
	'MARKPOSTUNREAD_MARK_UNREAD'			=> 'Oznacz post jako nieprzeczytany',
	'MARKPOSTUNREAD_MARKED_UNREAD'			=> '<p class="info-paragraph">Post oznaczony jako nieprzeczytany<p>',

	/*
	 * %1$s => success message
	 * %2$s => link for returning to the last visited forum
	 * %3$s => link for returning to the index page
	 */
	'MARKPOSTUNREAD_REDIRECT_FORMAT'		=> '%1$s<br /><br />%2$s<br /><br />%3$s',

	// Navbar
	'MARKPOSTUNREAD_UNREAD_NUM_MAX'			=> 'Nowe posty w ponad %1$d tematach',
	'MARKPOSTUNREAD_UNREAD_NUM'				=> array(
		0 => 'Brak nowych postów',
		1 => 'Nowe posty w %1$d temacie',
		2 => 'Nowe posty w %1$d tematach',
	),
));
