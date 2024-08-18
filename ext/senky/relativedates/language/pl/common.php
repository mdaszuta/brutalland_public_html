<?php
/**
*
* Relative dates extension for the phpBB Forum Software package.
*
* @copyright (c) 2016 Jakub Senko <jakubsenko@gmail.com>
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
	'RELATIVE_DATES'			=> 'Pokazuj daty względne',
	'RELATIVE_DATES_MAX'		=> 'Maksymalny wiek dat względnych',
	'RELATIVE_DATES_MAX_DESC'	=> 'Każda data starsza niż określona tutaj wyświetlana będzie w formacie bezwzględnym. Ustaw 0 by wyłączyć.',
	'R_DAYS'					=> 'dni',
	'R_MONTHS'					=> 'miesięcy',
	'R_YEARS'					=> 'lat',

	'R_EDITED_TIMES_TOTAL'	=> array(
		1	=> 'Ostatnio edytowany przez %2$s %3$s, edytowany łącznie %1$d raz.',
		2	=> 'Ostatnio edytowany przez %2$s %3$s, edytowany łącznie %1$d razy.',
	),
	'R_BUMPED_MESSAGE'	=> 'Ostatnio podbity przez %1$s %2$s.',

	'R_NOW'			=> 'chwilę',
	'R_AGO'			=> '%s temu',
	'R_FROM_NOW'	=> '%s od teraz',
	'R_AFTER'		=> '%s później',
	'R_BEFORE'		=> '%s wcześniej',
	'R_YEAR'		=> array(
		1	=> 'rok',
		2	=> '%d lata',
		3	=> '%d lat',
	),
	'R_MONTH'		=> array(
		1	=> 'miesiąc',
		2	=> '%d mies.',
		3	=> '%d mies.',
	),
	'R_WEEK'		=> array(
		1	=> 'tydzień',
		2	=> '%d tyg.',
		3	=> '%d tyg.',
	),
	'R_DAY'			=> array(
		1	=> 'dzień',
		2	=> '%d dni',
		3	=> '%d dni',
	),
	'R_HOUR'		=> array(
		1	=> 'godzinę',
		2	=> '%d godz.',
		3	=> '%d godz.',
	),
	'R_MINUTE'		=> array(
		1	=> 'minutę',
		2	=> '%d min.',
		3	=> '%d min.',
	),
	'R_SECOND'		=> array(
		1	=> 'sekundę',
		2	=> '%d sek.',
		3	=> '%d sek.',
	),

	'R_JANUARY'		=> 'styczeń',
	'R_FEBRUARY'	=> 'luty',
	'R_MARCH'		=> 'marzec',
	'R_APRIL'		=> 'kwiecień',
	'R_MAY'			=> 'maj',
	'R_JUNE'		=> 'czerwiec',
	'R_JULY'		=> 'lipiec',
	'R_AUGUST'		=> 'sierpień',
	'R_SEPTEMBER'	=> 'wrzesień',
	'R_OCTOBER'		=> 'październik',
	'R_NOVEMBER'	=> 'listopad',
	'R_DECEMBER'	=> 'grudzień',

	'R_MONDAY'		=> 'poniedziałek',
	'R_TUESDAY'		=> 'wtorek',
	'R_WEDNESDAY'	=> 'środa',
	'R_THURSDAY'	=> 'czwartek',
	'R_FRIDAY'		=> 'piątek',
	'R_SATURDAY'	=> 'sobota',
	'R_SUNDAY'		=> 'niedziela',
));
