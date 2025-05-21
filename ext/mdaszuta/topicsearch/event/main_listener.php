<?php
declare(strict_types=1);

namespace mdaszuta\topicsearch\event;

use phpbb\event\data as event_data;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class main_listener implements EventSubscriberInterface
{
    protected $template;
    protected $phpbb_root_path;
    protected $controller_helper;
    protected $config;

    public function __construct(\phpbb\template\template $template, $phpbb_root_path, \phpbb\controller\helper $controller_helper, \phpbb\config\config $config)
    {
        $this->template         = $template;
        $this->phpbb_root_path  = $phpbb_root_path;
        $this->controller_helper = $controller_helper;
        $this->config           = $config;
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

        // Add the script file (assuming you placed it under /ext/mdaszuta/topicsearch/styles/all/template/topicsearch.js)
        $asset_file = 'ext/mdaszuta/topicsearch/styles/all/template/topicsearch.js';
        $assets_version = (int) $this->config['assets_version'];
        $js_url = $this->phpbb_root_path . $asset_file . '?assets_version=' . $assets_version;

        $this->template->assign_var('S_TOPICSEARCH_JS', '<script src="' . $js_url . '"></script>');

        // Load normalization map from config
        $normalization_map = require __DIR__ . '/../config/normalization_map.php';
        $this->template->assign_var('NORMALIZATION_MAP', json_encode($normalization_map, JSON_UNESCAPED_UNICODE));
    }
}
