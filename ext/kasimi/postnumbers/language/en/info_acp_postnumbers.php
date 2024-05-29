<?php

/**
 *
 * @package phpBB Extension - Post Numbers
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
	'POSTNUMBERS_TITLE'						=> 'Post Numbers',
	'POSTNUMBERS_CONFIG'					=> 'Configuration',
	'POSTNUMBERS_CONFIG_UPDATED'			=> '<strong>Post Numbers </strong>Extension<br />» Configuration updated',
));
