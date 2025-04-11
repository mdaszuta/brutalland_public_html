<?php
namespace yourvendor\topicsearch\event;

use phpbb\event\data as event_data;

class main_listener
{
    protected $template;
    protected $phpbb_root_path;
    protected $assets_version;
    protected $controller_helper;

    public function __construct(\phpbb\template\template $template, $phpbb_root_path, $assets_version, \phpbb\controller\helper $controller_helper)
    {
        $this->template         = $template;
        $this->phpbb_root_path  = $phpbb_root_path;
        $this->assets_version   = $assets_version;
        $this->controller_helper = $controller_helper;
    }

    static public function getSubscribedEvents()
    {
        return [
            // This event happens after breadcrumbs; you can choose another if desired.
            'core.page_header' => 'add_topicsearch_assets',
        ];
    }

    public function add_topicsearch_assets(event_data $event)
    {
        // Add a container for the autocomplete (if needed)
        $this->template->assign_vars([
            'S_TOPICSEARCH_CONTAINER' => '<div id="autocomplete" class="autocomplete"></div>'
        ]);

        // Append our JavaScript to the overall header.
        // You can either add the JS inline or attach an external file.
        // Here, we set a template variable with the URL to our AJAX route.
        // Use the controller_helper to generate a proper route; alternatively, hardcode if desired.
        $ajax_url = $this->controller_helper->route('topicsearch_ajax');
        $this->template->assign_vars([
            'U_TOPICSEARCH_AJAX' => $ajax_url,
        ]);

        // Add the script file (assuming you placed it under /ext/yourvendor/topicsearch/styles/all/template/topicsearch.js)
        $asset_file = 'ext/yourvendor/topicsearch/styles/all/template/topicsearch.js';
        $this->template->assign_vars([
            'S_TOPICSEARCH_JS' => '<script src="' . $this->phpbb_root_path . $asset_file . '?assets_version=' . $this->assets_version . '"></script>'
        ]);
    }
}
