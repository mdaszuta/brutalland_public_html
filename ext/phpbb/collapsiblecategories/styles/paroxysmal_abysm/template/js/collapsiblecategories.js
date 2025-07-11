(function($) { // Avoid conflicts with other libraries

	'use strict';

	// Get the collapsible element (has class .topiclist.forums OR .collapsible)
	$.fn.getCollapsible = function() {
		return this.closest('.forabg').find('.topiclist.forums, .collapsible').eq(0);
	};

	$('a.collapse-btn').each(function() {
		var $this = $(this),
			hidden = $this.attr('data-hidden'),
			$content = $this.getCollapsible();

		// Return if no collapsible content could be found
		if (!$content.length) {
			return;
		}

		// Unhide the collapse buttons (makes them JS dependent)
		$this.show();

		// Hide hidden forums on load
		if (hidden) {
			$content.hide();
		}
	});

	phpbb.addAjaxCallback('phpbb_collapse', function(res) {
		if (res.success) {
			var oldTitle = $(this).attr('title'),
				newTitle = $(this).attr('data-title-alt');
			$(this)
				.attr({
					'title': newTitle,
					'data-title-alt': oldTitle
				})
				.find('i')
				.toggleClass('fa-plus fa-minus')
				.end()
				.getCollapsible()
				.stop(true, true)
				.slideToggle('fast')
			;
		}
	});

})(jQuery); // Avoid conflicts with other libraries
