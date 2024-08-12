<?php
/**
*
* @package phpBB Extension - RH Topic Tags
* @copyright (c) 2014 Robet Heim
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
	'RH_TOPICTAGS'						=> 'Tagi',

	'RH_TOPICTAGS_TAGCLOUD'				=> 'Chmura tagów',

	'RH_TOPICTAGS_ALLOWED_TAGS'			=> 'Dozwolone tagi:',
	'RH_TOPICTAGS_WHITELIST_EXP'		=> 'Jedynie następujące tagi są dozwolone:',

	'RH_TOPICTAGS_SEARCH_HEADER_OR'		=> 'Szukaj tematów z dowolnym z tagów: %s',
	'RH_TOPICTAGS_SEARCH_HEADER_AND'	=> '%s',
	'RH_TOPICTAGS_SEARCH_IGNORED_TAGS'	=> 'Nieprawidłowe tagi: %s',

	'RH_TOPICTAGS_NO_TOPICS_FOR_NO_TAG'		=> 'Wskaż przynajmniej jeden tag, aby pokazać tematy.',
	'RH_TOPICTAGS_NO_TOPICS_FOR_TAG_OR'		=> 'Brak tematów: %s',
	'RH_TOPICTAGS_NO_TOPICS_FOR_TAG_AND'	=> 'Brak tematów z oznaczonych wszystkimi tagami: %s',

	'RH_TOPICTAGS_TAGS_INVALID'			=> 'Nieprawidłowe tagi: %s',

	'RH_TOPICTAGS_DISPLAYING_TOTAL_ALL'	=> 'Pokazuje wszystkie tagi.',

	'RH_TOPICTAGS_DISPLAYING_TOTAL'	=> array(
		0 => 'Nie ma jeszcze żadnych tagów',
		1 => 'Pokazuje najczęstszy %d tag.',
		2 => '&nbsp; &raquo; &nbsp;%d',
	),

	'RH_TOPICTAGS_TAG_SEARCH' => 'Szukaj tagów.',

	'RH_TOPICTAGS_TAG_SUGGEST_TAG_ROUTE_ERROR' => 'Brak ścieżki dla: “%s”',
));
