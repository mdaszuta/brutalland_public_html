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
	'RELATIVE_DATES'	=> 'Pokazuj relatywne daty',

	'R_AGO'			=> '%s temu',
	'R_FROM_NOW'	=> '%s od teraz',
	'R_AFTER'		=> '%s później',
	'R_BEFORE'		=> '%s wcześniej',
	'R_YEAR'		=> array(
		1	=> 'rok',
		2	=> '%d lata',
		5	=> '%d lat',
	),
	'R_MONTH'		=> array(
		1	=> 'miesiąc',
		2	=> '%d mies.',
		5	=> '%d mies.',
	),
	'R_WEEK'		=> array(
		1	=> 'tydzień',
		2	=> '%d tyg.',
		5	=> '%d tyg.',
	),
	'R_DAY'			=> array(
		1	=> 'dzień',
		2	=> '%d dni',
	),
	'R_HOUR'		=> array(
		1	=> 'godzinę',
		2	=> '%d godz.',
		5	=> '%d godz.',
	),
	'R_MINUTE'		=> array(
		1	=> 'minutę',
		2	=> '%d min.',
		5	=> '%d min.',
	),
	'R_SECOND'		=> array(
		1	=> 'sekundę',
		2	=> '%d sek.',
		5	=> '%d sek.',
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
