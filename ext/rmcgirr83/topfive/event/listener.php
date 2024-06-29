<?php
/**
*
* @package phpBB Extension - Top Five
* @copyright (c) 2014 Rich McGirr
* @license http://opensource.org/licenses/gpl-2.0.php GNU General Public License v2
*
*/

namespace rmcgirr83\topfive\event;

/**
* @ignore
*/
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
* Event listener
*/
class listener implements EventSubscriberInterface
{
	/* @var \rmcgirr83\topfive\core\topfive */
	protected $topfive;

	/** @var \phpbb\config\config */
	protected $config;

	/** @var \phpbb\template\template */
	protected $template;

	/** @var \phpbb\user */
	protected $user;

	/** @var \phpbb\controller\helper */
	protected $helper;

	public function __construct(
		\rmcgirr83\topfive\core\topfive $topfive,
		\phpbb\config\config $config,
		\phpbb\template\template $template,
		\phpbb\user $user,
		\phpbb\controller\helper $helper,
		\phpbb\collapsiblecategories\operator\operator $operator = null)
	{
		$this->topfive = $topfive;
		$this->config = $config;
		$this->template = $template;
		$this->user = $user;
		$this->helper = $helper;
		$this->operator = $operator;
	}

	static public function getSubscribedEvents()
	{

		return array(
			'core.user_setup'	=> 'main',
		);
	}

	public function main($event)
	{
		if (!$this->config['top_five_active'])
		{
			return;
		}

		// add lang file
		$this->user->add_lang_ext('rmcgirr83/topfive', 'topfive');

		$this->topfive->toptopics();
		if ($this->operator !== null)
		{
			$fid = 'topfive'; // can be any unique string to identify your extension's collapsible element
			$this->template->assign_vars(array(
				'S_TOPFIVE_HIDDEN' => in_array($fid, $this->operator->get_user_categories()),
				'U_TOPFIVE_COLLAPSE_URL' => $this->helper->route('phpbb_collapsiblecategories_main_controller', array(
					'forum_id' => $fid,
					'hash' => generate_link_hash("collapsible_$fid")))
			));
			$asid = 'ajax_shoutbox';
			$this->template->assign_vars(array(
				'S_AJAX_SHOUTBOX_HIDDEN' => in_array($asid, $this->operator->get_user_categories()),
				'U_AJAX_SHOUTBOX_COLLAPSE_URL' => $this->helper->route('phpbb_collapsiblecategories_main_controller', array(
					'forum_id' => $asid,
					'hash' => generate_link_hash("collapsible_$asid")))
			));
			$statyid = 'staty';
			$this->template->assign_vars(array(
				'S_STATY_HIDDEN' => in_array($statyid, $this->operator->get_user_categories()),
				'U_STATY_COLLAPSE_URL' => $this->helper->route('phpbb_collapsiblecategories_main_controller', array(
					'forum_id' => $statyid,
					'hash' => generate_link_hash("collapsible_$statyid")))
			));
		}
		$this->template->assign_vars(array(
			'S_TOPFIVE'	=>	$this->config['top_five_active'],
			'S_TOPFIVE_LOCATION'	=> $this->config['top_five_location'],
		));
	}
}
