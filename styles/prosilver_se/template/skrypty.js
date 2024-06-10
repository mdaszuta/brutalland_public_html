/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * forum_fn.js
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

/* global phpbb */

/**
* phpBB3 forum functions
*/

/**
* Find a member
*/
function find_username(url) {
	'use strict';

	popup(url, 760, 570, '_usersearch');
	return false;
}

/**
* Window popup
*/
function popup(url, width, height, name) {
	'use strict';

	if (!name) {
		name = '_popup';
	}

	window.open(url.replace(/&amp;/g, '&'), name, 'height=' + height + ',resizable=yes,scrollbars=yes, width=' + width);
	return false;
}

/**
* Jump to page
*/
function pageJump(item) {
	'use strict';

	var page = parseInt(item.val(), 10),
		perPage = item.attr('data-per-page'),
		baseUrl = item.attr('data-base-url'),
		startName = item.attr('data-start-name');

	if (page !== null && !isNaN(page) && page === Math.floor(page) && page > 0) {
		if (baseUrl.indexOf('?') === -1) {
			document.location.href = baseUrl + '?' + startName + '=' + ((page - 1) * perPage);
		} else {
			document.location.href = baseUrl.replace(/&amp;/g, '&') + '&' + startName + '=' + ((page - 1) * perPage);
		}
	}
}

/**
* Mark/unmark checklist
* id = ID of parent container, name = name prefix, state = state [true/false]
*/
function marklist(id, name, state) {
	'use strict';

	jQuery('#' + id + ' input[type=checkbox][name]').each(function() {
		var $this = jQuery(this);
		if ($this.attr('name').substr(0, name.length) === name) {
			$this.prop('checked', state);
		}
	});
}

/**
* Resize viewable area for attached image or topic review panel (possibly others to come)
* e = element
*/
function viewableArea(e, itself) {
	'use strict';

	if (!e) {
		return;
	}

	if (!itself) {
		e = e.parentNode;
	}

	if (!e.vaHeight) {
		// Store viewable area height before changing style to auto
		e.vaHeight = e.offsetHeight;
		e.vaMaxHeight = e.style.maxHeight;
		e.style.height = 'auto';
		e.style.maxHeight = 'none';
		e.style.overflow = 'visible';
	} else {
		// Restore viewable area height to the default
		e.style.height = e.vaHeight + 'px';
		e.style.overflow = 'auto';
		e.style.maxHeight = e.vaMaxHeight;
		e.vaHeight = false;
	}
}

/**
* Alternate display of subPanels
*/
jQuery(function($) {
	'use strict';

	$('.sub-panels').each(function() {

		var $childNodes = $('a[data-subpanel]', this),
			panels = $childNodes.map(function () {
				return this.getAttribute('data-subpanel');
			}),
			showPanel = this.getAttribute('data-show-panel');

		if (panels.length) {
			activateSubPanel(showPanel, panels);
			$childNodes.click(function () {
				activateSubPanel(this.getAttribute('data-subpanel'), panels);
				return false;
			});
		}
	});
});

/**
* Activate specific subPanel
*/
function activateSubPanel(p, panels) {
	'use strict';

	var i, showPanel;

	if (typeof p === 'string') {
		showPanel = p;
	}
	$('input[name="show_panel"]').val(showPanel);

	if (typeof panels === 'undefined') {
		panels = jQuery('.sub-panels a[data-subpanel]').map(function() {
			return this.getAttribute('data-subpanel');
		});
	}

	for (i = 0; i < panels.length; i++) {
		jQuery('#' + panels[i]).css('display', panels[i] === showPanel ? 'block' : 'none');
		jQuery('#' + panels[i] + '-tab').toggleClass('activetab', panels[i] === showPanel);
	}
}

function selectCode(a) {
	'use strict';

	// Get ID of code block
	var e = a.parentNode.parentNode.getElementsByTagName('CODE')[0];
	var s, r;

	// Not IE and IE9+
	if (window.getSelection) {
		s = window.getSelection();
		// Safari and Chrome
		if (s.setBaseAndExtent) {
			var l = (e.innerText.length > 1) ? e.innerText.length - 1 : 1;
			try {
				s.setBaseAndExtent(e, 0, e, l);
			} catch (error) {
				r = document.createRange();
				r.selectNodeContents(e);
				s.removeAllRanges();
				s.addRange(r);
			}
		}
		// Firefox and Opera
		else {
			// workaround for bug # 42885
			if (window.opera && e.innerHTML.substring(e.innerHTML.length - 4) === '<BR>') {
				e.innerHTML = e.innerHTML + '&nbsp;';
			}

			r = document.createRange();
			r.selectNodeContents(e);
			s.removeAllRanges();
			s.addRange(r);
		}
	}
	// Some older browsers
	else if (document.getSelection) {
		s = document.getSelection();
		r = document.createRange();
		r.selectNodeContents(e);
		s.removeAllRanges();
		s.addRange(r);
	}
	// IE
	else if (document.selection) {
		r = document.body.createTextRange();
		r.moveToElementText(e);
		r.select();
	}
}

/**
* Play quicktime file by determining it's width/height
* from the displayed rectangle area
*/
function play_qt_file(obj) {
	'use strict';

	var rectangle = obj.GetRectangle();
	var width, height;

	if (rectangle) {
		rectangle = rectangle.split(',');
		var x1 = parseInt(rectangle[0], 10);
		var x2 = parseInt(rectangle[2], 10);
		var y1 = parseInt(rectangle[1], 10);
		var y2 = parseInt(rectangle[3], 10);

		width = (x1 < 0) ? (x1 * -1) + x2 : x2 - x1;
		height = (y1 < 0) ? (y1 * -1) + y2 : y2 - y1;
	} else {
		width = 200;
		height = 0;
	}

	obj.width = width;
	obj.height = height + 16;

	obj.SetControllerVisible(true);
	obj.Play();
}

var inAutocomplete = false;
var lastKeyEntered = '';

/**
* Check event key
*/
function phpbbCheckKey(event) {
	'use strict';

	// Keycode is array down or up?
	if (event.keyCode && (event.keyCode === 40 || event.keyCode === 38)) {
		inAutocomplete = true;
	}

	// Make sure we are not within an "autocompletion" field
	if (inAutocomplete) {
		// If return pressed and key changed we reset the autocompletion
		if (!lastKeyEntered || lastKeyEntered === event.which) {
			inAutocomplete = false;
			return true;
		}
	}

	// Keycode is not return, then return. ;)
	if (event.which !== 13) {
		lastKeyEntered = event.which;
		return true;
	}

	return false;
}

/**
* Apply onkeypress event for forcing default submit button on ENTER key press
*/
jQuery(function($) {
	'use strict';

	$('form input[type=text], form input[type=password]').on('keypress', function (e) {
		var defaultButton = $(this).parents('form').find('input[type=submit].default-submit-action');

		if (!defaultButton || defaultButton.length <= 0) {
			return true;
		}

		if (phpbbCheckKey(e)) {
			return true;
		}

		if ((e.which && e.which === 13) || (e.keyCode && e.keyCode === 13)) {
			defaultButton.click();
			return false;
		}

		return true;
	});
});

/**
* Functions for user search popup
*/
function insertUser(formId, value) {
	'use strict';

	var $form = jQuery(formId),
		formName = $form.attr('data-form-name'),
		fieldName = $form.attr('data-field-name'),
		item = opener.document.forms[formName][fieldName];

	if (item.value.length && item.type === 'textarea') {
		value = item.value + '\n' + value;
	}

	item.value = value;
}

function insert_marked_users(formId, users) {
	'use strict';

	for (var i = 0; i < users.length; i++) {
		if (users[i].checked) {
			insertUser(formId, users[i].value);
		}
	}

	window.close();
}

function insert_single_user(formId, user) {
	'use strict';

	insertUser(formId, user);
	window.close();
}

/**
* Parse document block
*/
function parseDocument($container) {
	'use strict';

	var test = document.createElement('div'),
		oldBrowser = (typeof test.style.borderRadius === 'undefined'),
		$body = $('body');

	/**
	* Reset avatar dimensions when changing URL or EMAIL
	*/
	$container.find('input[data-reset-on-edit]').on('keyup', function() {
		$(this.getAttribute('data-reset-on-edit')).val('');
	});

	/**
	* Pagination
	*/
	$container.find('.pagination .page-jump-form :button').click(function() {
		var $input = $(this).siblings('input.inputbox');
		pageJump($input);
	});

	$container.find('.pagination .page-jump-form input.inputbox').on('keypress', function(event) {
		if (event.which === 13 || event.keyCode === 13) {
			event.preventDefault();
			pageJump($(this));
		}
	});

	$container.find('.pagination .dropdown-trigger').click(function() {
		var $dropdownContainer = $(this).parent();
		// Wait a little bit to make sure the dropdown has activated
		setTimeout(function() {
			if ($dropdownContainer.hasClass('dropdown-visible')) {
				$dropdownContainer.find('input.inputbox').focus();
			}
		}, 100);
	});

	/**
	* Adjust HTML code for IE8 and older versions
	*/
	if (oldBrowser) {
		// Fix .linklist.bulletin lists
		$container
			.find('ul.linklist.bulletin > li')
			.filter(':first-child, .rightside:last-child')
			.addClass('no-bulletin');
	}

	/**
	* Resize navigation (breadcrumbs) block to keep all links on same line
	*/
	$container.find('.navlinks').each(function() {
		var $this = $(this),
			$left = $this.children().not('.rightside'),
			$right = $this.children('.rightside');

		if ($left.length !== 1 || !$right.length) {
			return;
		}

		function resize() {
			var width = 0,
				diff = $left.outerWidth(true) - $left.width(),
				minWidth = Math.max($this.width() / 3, 240),
				maxWidth;

			$right.each(function() {
				var $this = $(this);
				if ($this.is(':visible')) {
					width += $this.outerWidth(true);
				}
			});

			maxWidth = $this.width() - width - diff;
			$left.css('max-width', Math.floor(Math.max(maxWidth, minWidth)) + 'px');
		}

		resize();
		$(window).resize(resize);
	});

	/**
	* Makes breadcrumbs responsive
	*/
	$container.find('.breadcrumbs:not([data-skip-responsive])').each(function() {
		var $this = $(this),
			$links = $this.find('.crumb'),
			length = $links.length,
			classes = ['wrapped-max', 'wrapped-wide', 'wrapped-medium', 'wrapped-small', 'wrapped-tiny'],
			classesLength = classes.length,
			maxHeight = 0,
			lastWidth = false,
			wrapped = false;

		// Set tooltips
		$this.find('a').each(function() {
			var $link = $(this);
			$link.attr('title', $link.text());
		});

		// Function that checks breadcrumbs
		function check() {
			var height = $this.height(),
				width;

			// Test max-width set in code for .navlinks above
			width = parseInt($this.css('max-width'), 10);
			if (!width) {
				width = $body.width();
			}

			maxHeight = parseInt($this.css('line-height'), 10);
			$links.each(function() {
				if ($(this).height() > 0) {
					maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
				}
			});

			if (height <= maxHeight) {
				if (!wrapped || lastWidth === false || lastWidth >= width) {
					return;
				}
			}
			lastWidth = width;

			if (wrapped) {
				$this.removeClass('wrapped').find('.crumb.wrapped').removeClass('wrapped ' + classes.join(' '));
				if ($this.height() <= maxHeight) {
					return;
				}
			}

			wrapped = true;
			$this.addClass('wrapped');
			if ($this.height() <= maxHeight) {
				return;
			}

			for (var i = 0; i < classesLength; i++) {
				for (var j = length - 1; j >= 0; j--) {
					$links.eq(j).addClass('wrapped ' + classes[i]);
					if ($this.height() <= maxHeight) {
						return;
					}
				}
			}
		}

		// Run function and set event
		check();
		$(window).resize(check);
	});

	/**
	* Responsive link lists
	*/
	var selector = '.linklist:not(.navlinks, [data-skip-responsive]),' +
		'.postbody .post-buttons:not([data-skip-responsive])';
	$container.find(selector).each(function() {
		var $this = $(this),
			filterSkip = '.breadcrumbs, [data-skip-responsive]',
			filterLast = '.edit-icon, .quote-icon, [data-last-responsive]',
			$linksAll = $this.children(),
			$linksNotSkip = $linksAll.not(filterSkip), // All items that can potentially be hidden
			$linksFirst = $linksNotSkip.not(filterLast), // The items that will be hidden first
			$linksLast = $linksNotSkip.filter(filterLast), // The items that will be hidden last
			persistent = $this.attr('id') === 'nav-main', // Does this list already have a menu (such as quick-links)?
			html = '<li class="responsive-menu hidden"><a href="javascript:void(0);" class="responsive-menu-link">&nbsp;</a><div class="dropdown hidden"><div class="pointer"><div class="pointer-inner" /></div><ul class="dropdown-contents" /></div></li>',
			slack = 3; // Vertical slack space (in pixels). Determines how sensitive the script is in determining whether a line-break has occured.

		// Add a hidden drop-down menu to each links list (except those that already have one)
		if (!persistent) {
			if ($linksNotSkip.is('.rightside')) {
				$linksNotSkip.filter('.rightside:first').before(html);
				$this.children('.responsive-menu').addClass('rightside');
			} else {
				$this.append(html);
			}
		}

		// Set some object references and initial states
		var $menu = $this.children('.responsive-menu'),
			$menuContents = $menu.find('.dropdown-contents'),
			persistentContent = $menuContents.find('li:not(.separator)').length,
			lastWidth = false,
			compact = false,
			responsive1 = false,
			responsive2 = false,
			copied1 = false,
			copied2 = false,
			maxHeight = 0;

		// Find the tallest element in the list (we assume that all elements are roughly the same height)
		$linksAll.each(function() {
			if (!$(this).height()) {
				return;
			}
			maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
		});
		if (maxHeight < 1) {
			return; // Shouldn't be possible, but just in case, abort
		} else {
			maxHeight = maxHeight + slack;
		}

		function check() {
			var width = $body.width();
			// We can't make it any smaller than this, so just skip
			if (responsive2 && compact && (width <= lastWidth)) {
				return;
			}
			lastWidth = width;

			// Reset responsive and compact layout
			if (responsive1 || responsive2) {
				$linksNotSkip.removeClass('hidden');
				$menuContents.children('.clone').addClass('hidden');
				responsive1 = responsive2 = false;
			}
			if (compact) {
				$this.removeClass('compact');
				compact = false;
			}

			// Unhide the quick-links menu if it has "persistent" content
			if (persistent && persistentContent) {
				$menu.removeClass('hidden');
			} else {
				$menu.addClass('hidden');
			}

			// Nothing to resize if block's height is not bigger than tallest element's height
			if ($this.height() <= maxHeight) {
				return;
			}

			// STEP 1: Compact
			if (!compact) {
				$this.addClass('compact');
				compact = true;
			}
			if ($this.height() <= maxHeight) {
				return;
			}

			// STEP 2: First responsive set - compact
			if (compact) {
				$this.removeClass('compact');
				compact = false;
			}
			// Copy the list items to the dropdown
			if (!copied1) {
				var $clones1 = $linksFirst.clone();
				$menuContents.prepend($clones1.addClass('clone clone-first').removeClass('leftside rightside'));

				if ($this.hasClass('post-buttons')) {
					$('.button', $menuContents).removeClass('button icon-button');
					$('.responsive-menu-link', $menu).addClass('button icon-button').prepend('<span></span>');
				}
				copied1 = true;
			}
			if (!responsive1) {
				$linksFirst.addClass('hidden');
				responsive1 = true;
				$menuContents.children('.clone-first').removeClass('hidden');
				$menu.removeClass('hidden');
			}
			if ($this.height() <= maxHeight) {
				return;
			}

			// STEP 3: First responsive set + compact
			if (!compact) {
				$this.addClass('compact');
				compact = true;
			}
			if ($this.height() <= maxHeight) {
				return;
			}

			// STEP 4: Last responsive set - compact
			if (!$linksLast.length) {
				return; // No other links to hide, can't do more
			}
			if (compact) {
				$this.removeClass('compact');
				compact = false;
			}
			// Copy the list items to the dropdown
			if (!copied2) {
				var $clones2 = $linksLast.clone();
				$menuContents.prepend($clones2.addClass('clone clone-last').removeClass('leftside rightside'));
				copied2 = true;
			}
			if (!responsive2) {
				$linksLast.addClass('hidden');
				responsive2 = true;
				$menuContents.children('.clone-last').removeClass('hidden');
			}
			if ($this.height() <= maxHeight) {
				return;
			}

			// STEP 5: Last responsive set + compact
			if (!compact) {
				$this.addClass('compact');
				compact = true;
			}
		}

		if (!persistent) {
			phpbb.registerDropdown($menu.find('a.responsive-menu-link'), $menu.find('.dropdown'), false);
		}

		// If there are any images in the links list, run the check again after they have loaded
		$linksAll.find('img').each(function() {
			$(this).load(function() {
				check();
			});
		});

		check();
		$(window).resize(check);
	});

	/**
	* Do not run functions below for old browsers
	*/
	if (oldBrowser) {
		return;
	}

	/**
	* Adjust topiclist lists with check boxes
	*/
	$container.find('ul.topiclist dd.mark').siblings('dt').children('.list-inner').addClass('with-mark');

	/**
	* Appends contents of all extra columns to first column in
	* .topiclist lists for mobile devices. Copies contents as is.
	*
	* To add that functionality to .topiclist list simply add
	* responsive-show-all to list of classes
	*/
	$container.find('.topiclist.responsive-show-all > li > dl').each(function() {
		var $this = $(this),
			$block = $this.find('dt .responsive-show:last-child'),
			first = true;

		// Create block that is visible only on mobile devices
		if (!$block.length) {
			$this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');
			$block = $this.find('dt .responsive-show:last-child');
		} else {
			first = ($.trim($block.text()).length === 0);
		}

		// Copy contents of each column
		$this.find('dd').not('.mark').each(function() {
			var column = $(this),
				$children = column.children(),
				html = column.html();

			if ($children.length === 1 && $children.text() === column.text()) {
				html = $children.html();
			}

			$block.append((first ? '' : '<br />') + html);

			first = false;
		});
	});

	/**
	* Same as above, but prepends text from header to each
	* column before contents of that column.
	*
	* To add that functionality to .topiclist list simply add
	* responsive-show-columns to list of classes
	*/
	$container.find('.topiclist.responsive-show-columns').each(function() {
		var $list = $(this),
			headers = [],
			headersLength = 0;

		// Find all headers, get contents
		$list.prev('.topiclist').find('li.header dd').not('.mark').each(function() {
			headers.push($(this).text());
			headersLength++;
		});

		if (!headersLength) {
			return;
		}

		// Parse each row
		$list.find('dl').each(function() {
			var $this = $(this),
				$block = $this.find('dt .responsive-show:last-child'),
				first = true;

			// Create block that is visible only on mobile devices
			if (!$block.length) {
				$this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');
				$block = $this.find('dt .responsive-show:last-child');
			} else {
				first = ($.trim($block.text()).length === 0);
			}

			// Copy contents of each column
			$this.find('dd').not('.mark').each(function(i) {
				var column = $(this),
					children = column.children(),
					html = column.html();

				if (children.length === 1 && children.text() === column.text()) {
					html = children.html();
				}

				// Prepend contents of matching header before contents of column
				if (i < headersLength) {
					html = headers[i] + ': <strong>' + html + '</strong>';
				}

				$block.append((first ? '' : '<br />') + html);

				first = false;
			});
		});
	});

	/**
	* Responsive tables
	*/
	$container.find('table.table1').not('.not-responsive').each(function() {
		var $this = $(this),
			$th = $this.find('thead > tr > th'),
			headers = [],
			totalHeaders = 0,
			i, headersLength;

		// Find each header
		$th.each(function(column) {
			var cell = $(this),
				colspan = parseInt(cell.attr('colspan'), 10),
				dfn = cell.attr('data-dfn'),
				text = dfn ? dfn : cell.text();

			colspan = isNaN(colspan) || colspan < 1 ? 1 : colspan;

			for (i = 0; i < colspan; i++) {
				headers.push(text);
			}
			totalHeaders++;

			if (dfn && !column) {
				$this.addClass('show-header');
			}
		});

		headersLength = headers.length;

		// Add header text to each cell as <dfn>
		$this.addClass('responsive');

		if (totalHeaders < 2) {
			$this.addClass('show-header');
			return;
		}

		$this.find('tbody > tr').each(function() {
			var row = $(this),
				cells = row.children('td'),
				column = 0;

			if (cells.length === 1) {
				row.addClass('big-column');
				return;
			}

			cells.each(function() {
				var cell = $(this),
					colspan = parseInt(cell.attr('colspan'), 10),
					text = $.trim(cell.text());

				if (headersLength <= column) {
					return;
				}

				if ((text.length && text !== '-') || cell.children().length) {
					cell.prepend('<dfn style="display: none;">' + headers[column] + '</dfn>');
				} else {
					cell.addClass('empty');
				}

				colspan = isNaN(colspan) || colspan < 1 ? 1 : colspan;
				column += colspan;
			});
		});
	});

	/**
	* Hide empty responsive tables
	*/
	$container.find('table.responsive > tbody').not('.responsive-skip-empty').each(function() {
		var $items = $(this).children('tr');
		if (!$items.length) {
			$(this).parent('table:first').addClass('responsive-hide');
		}
	});

	/**
	* Responsive tabs
	*/
	$container.find('#tabs, #minitabs').not('[data-skip-responsive]').each(function() {
		var $this = $(this),
			$ul = $this.children(),
			$tabs = $ul.children().not('[data-skip-responsive]'),
			$links = $tabs.children('a'),
			$item = $ul.append('<li class="tab responsive-tab" style="display:none;"><a href="javascript:void(0);" class="responsive-tab-link">&nbsp;</a><div class="dropdown tab-dropdown" style="display: none;"><div class="pointer"><div class="pointer-inner" /></div><ul class="dropdown-contents" /></div></li>').find('li.responsive-tab'),
			$menu = $item.find('.dropdown-contents'),
			maxHeight = 0,
			lastWidth = false,
			responsive = false;

		$links.each(function() {
			var $this = $(this);
			maxHeight = Math.max(maxHeight, Math.max($this.outerHeight(true), $this.parent().outerHeight(true)));
		});

		function check() {
			var width = $body.width(),
				height = $this.height();

			if (!arguments.length && (!responsive || width <= lastWidth) && height <= maxHeight) {
				return;
			}

			$tabs.show();
			$item.hide();

			lastWidth = width;
			height = $this.height();
			if (height <= maxHeight) {
				if ($item.hasClass('dropdown-visible')) {
					phpbb.toggleDropdown.call($item.find('a.responsive-tab-link').get(0));
				}
				return;
			}

			responsive = true;
			$item.show();
			$menu.html('');

			var $availableTabs = $tabs.filter(':not(.activetab, .responsive-tab)'),
				total = $availableTabs.length,
				i, $tab;

			for (i = total - 1; i >= 0; i--) {
				$tab = $availableTabs.eq(i);
				$menu.prepend($tab.clone(true).removeClass('tab'));
				$tab.hide();
				if ($this.height() <= maxHeight) {
					$menu.find('a').click(function() {
						check(true);
					});
					return;
				}
			}
			$menu.find('a').click(function() {
				check(true);
			});
		}

		var $tabLink = $item.find('a.responsive-tab-link');
		phpbb.registerDropdown($tabLink, $item.find('.dropdown'), {
			visibleClass: 'activetab'
		});

		check(true);
		$(window).resize(check);
	});

	/**
	 * Hide UCP/MCP navigation if there is only 1 item
	 */
	$container.find('#navigation').each(function() {
		var $items = $(this).children('ol, ul').children('li');
		if ($items.length === 1) {
			$(this).addClass('responsive-hide');
		}
	});

	/**
	* Replace responsive text
	*/
	$container.find('[data-responsive-text]').each(function() {
		var $this = $(this),
			fullText = $this.text(),
			responsiveText = $this.attr('data-responsive-text'),
			responsive = false;

		function check() {
			if ($(window).width() > 700) {
				if (!responsive) {
					return;
				}
				$this.text(fullText);
				responsive = false;
				return;
			}
			if (responsive) {
				return;
			}
			$this.text(responsiveText);
			responsive = true;
		}

		check();
		$(window).resize(check);
	});
}

/**
* Run onload functions
*/
jQuery(function($) {
	'use strict';

	// Swap .nojs and .hasjs
	$('#phpbb.nojs').toggleClass('nojs hasjs');
	$('#phpbb').toggleClass('hastouch', phpbb.isTouch);
	$('#phpbb.hastouch').removeClass('notouch');

	// Focus forms
	$('form[data-focus]:first').each(function() {
		$('#' + this.getAttribute('data-focus')).focus();
	});

	parseDocument($('body'));
});

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * KONIEC forum_fn.js
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ajax.js
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

/* global phpbb */

(function($) {  // Avoid conflicts with other libraries

	'use strict';
	
	// This callback will mark all forum icons read
	phpbb.addAjaxCallback('mark_forums_read', function(res) {
		var readTitle = res.NO_UNREAD_POSTS;
		var unreadTitle = res.UNREAD_POSTS;
		var iconsArray = {
			forum_unread: 'forum_read',
			forum_unread_subforum: 'forum_read_subforum',
			forum_unread_locked: 'forum_read_locked'
		};
	
		$('li.row').find('dl[class*="forum_unread"]').each(function() {
			var $this = $(this);
	
			$.each(iconsArray, function(unreadClass, readClass) {
				if ($this.hasClass(unreadClass)) {
					$this.removeClass(unreadClass).addClass(readClass);
				}
			});
			$this.children('dt[title="' + unreadTitle + '"]').attr('title', readTitle);
		});
	
		// Mark subforums read
		$('a.subforum[class*="unread"]').removeClass('unread').addClass('read');
	
		// Mark topics read if we are watching a category and showing active topics
		if ($('#active_topics').length) {
			phpbb.ajaxCallbacks.mark_topics_read.call(this, res, false);
		}
	
		// Update mark forums read links
		$('[data-ajax="mark_forums_read"]').attr('href', res.U_MARK_FORUMS);
	
		phpbb.closeDarkenWrapper(3000);
	});
	
	/**
	* This callback will mark all topic icons read
	*
	* @param {bool} [update_topic_links=true] Whether "Mark topics read" links
	* 	should be updated. Defaults to true.
	*/
	phpbb.addAjaxCallback('mark_topics_read', function(res, updateTopicLinks) {
		var readTitle = res.NO_UNREAD_POSTS;
		var unreadTitle = res.UNREAD_POSTS;
		var iconsArray = {
			global_unread: 'global_read',
			announce_unread: 'announce_read',
			sticky_unread: 'sticky_read',
			topic_unread: 'topic_read'
		};
		var iconsState = ['', '_hot', '_hot_mine', '_locked', '_locked_mine', '_mine'];
		var unreadClassSelectors;
		var classMap = {};
		var classNames = [];
	
		if (typeof updateTopicLinks === 'undefined') {
			updateTopicLinks = true;
		}
	
		$.each(iconsArray, function(unreadClass, readClass) {
			$.each(iconsState, function(key, value) {
				// Only topics can be hot
				if ((value === '_hot' || value === '_hot_mine') && unreadClass !== 'topic_unread') {
					return true;
				}
				classMap[unreadClass + value] = readClass + value;
				classNames.push(unreadClass + value);
			});
		});
	
		unreadClassSelectors = '.' + classNames.join(',.');
	
		$('li.row').find(unreadClassSelectors).each(function() {
			var $this = $(this);
			$.each(classMap, function(unreadClass, readClass) {
				if ($this.hasClass(unreadClass)) {
					$this.removeClass(unreadClass).addClass(readClass);
				}
			});
			$this.children('dt[title="' + unreadTitle + '"]').attr('title', readTitle);
		});
	
		// Remove link to first unread post
		$('a').has('span.icon_topic_newest').remove();
	
		// Update mark topics read links
		if (updateTopicLinks) {
			$('[data-ajax="mark_topics_read"]').attr('href', res.U_MARK_TOPICS);
		}
	
		phpbb.closeDarkenWrapper(3000);
	});
	
	// This callback will mark all notifications read
	phpbb.addAjaxCallback('notification.mark_all_read', function(res) {
		if (typeof res.success !== 'undefined') {
			phpbb.markNotifications($('#notification_list li.bg2'), 0);
			phpbb.closeDarkenWrapper(3000);
		}
	});
	
	// This callback will mark a notification read
	phpbb.addAjaxCallback('notification.mark_read', function(res) {
		if (typeof res.success !== 'undefined') {
			var unreadCount = Number($('#notification_list_button strong').html()) - 1;
			phpbb.markNotifications($(this).parent('li.bg2'), unreadCount);
		}
	});
	
	/**
	 * Mark notification popup rows as read.
	 *
	 * @param {jQuery} $popup jQuery object(s) to mark read.
	 * @param {int} unreadCount The new unread notifications count.
	 */
	phpbb.markNotifications = function($popup, unreadCount) {
		// Remove the unread status.
		$popup.removeClass('bg2');
		$popup.find('a.mark_read').remove();
	
		// Update the notification link to the real URL.
		$popup.each(function() {
			var link = $(this).find('a');
			link.attr('href', link.attr('data-real-url'));
		});
	
		// Update the unread count.
		$('strong', '#notification_list_button').html(unreadCount);
		// Remove the Mark all read link if there are no unread notifications.
		if (!unreadCount) {
			$('#mark_all_notifications').remove();
		}
	
		// Update page title
		var $title = $('title');
		var originalTitle = $title.text().replace(/(\((\d+)\))/, '');
		$title.text((unreadCount ? '(' + unreadCount + ')' : '') + originalTitle);
	};
	
	// This callback finds the post from the delete link, and removes it.
	phpbb.addAjaxCallback('post_delete', function() {
		var $this = $(this),
			postId;
	
		if ($this.attr('data-refresh') === undefined) {
			postId = $this[0].href.split('&p=')[1];
			var post = $this.parents('#p' + postId).css('pointer-events', 'none');
			if (post.hasClass('bg1') || post.hasClass('bg2')) {
				var posts1 = post.nextAll('.bg1');
				post.nextAll('.bg2').removeClass('bg2').addClass('bg1');
				posts1.removeClass('bg1').addClass('bg2');
			}
			post.fadeOut(function() {
				$(this).remove();
			});
		}
	});
	
	// This callback removes the approve / disapprove div or link.
	phpbb.addAjaxCallback('post_visibility', function(res) {
		var remove = (res.visible) ? $(this) : $(this).parents('.post');
		$(remove).css('pointer-events', 'none').fadeOut(function() {
			$(this).remove();
		});
	
		if (res.visible) {
			// Remove the "Deleted by" message from the post on restoring.
			remove.parents('.post').find('.post_deleted_msg').css('pointer-events', 'none').fadeOut(function() {
				$(this).remove();
			});
		}
	});
	
	// This removes the parent row of the link or form that fired the callback.
	phpbb.addAjaxCallback('row_delete', function() {
		$(this).parents('tr').remove();
	});
	
	// This handles friend / foe additions removals.
	phpbb.addAjaxCallback('zebra', function(res) {
		var zebra;
	
		if (res.success) {
			zebra = $('.zebra');
			zebra.first().html(res.MESSAGE_TEXT);
			zebra.not(':first').html('&nbsp;').prev().html('&nbsp;');
		}
	});
	
	/**
	 * This callback updates the poll results after voting.
	 */
	phpbb.addAjaxCallback('vote_poll', function(res) {
		if (typeof res.success !== 'undefined') {
			var poll = $('.topic_poll');
			var panel = poll.find('.panel');
			var resultsVisible = poll.find('dl:first-child .resultbar').is(':visible');
			var mostVotes = 0;
	
			// Set min-height to prevent the page from jumping when the content changes
			var updatePanelHeight = function (height) {
				height = (typeof height === 'undefined') ? panel.find('.inner').outerHeight() : height;
				panel.css('min-height', height);
			};
			updatePanelHeight();
	
			// Remove the View results link
			if (!resultsVisible) {
				poll.find('.poll_view_results').hide(500);
			}
	
			if (!res.can_vote) {
				poll.find('.polls, .poll_max_votes, .poll_vote, .poll_option_select').fadeOut(500, function () {
					poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show();
				});
			} else {
				// If the user can still vote, simply slide down the results
				poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);
			}
	
			// Get the votes count of the highest poll option
			poll.find('[data-poll-option-id]').each(function() {
				var option = $(this);
				var optionId = option.attr('data-poll-option-id');
				mostVotes = (res.vote_counts[optionId] >= mostVotes) ? res.vote_counts[optionId] : mostVotes;
			});
	
			// Update the total votes count
			poll.find('.poll_total_vote_cnt').html(res.total_votes);
	
			// Update each option
			poll.find('[data-poll-option-id]').each(function() {
				var $this = $(this);
				var optionId = $this.attr('data-poll-option-id');
				var voted = (typeof res.user_votes[optionId] !== 'undefined');
				var mostVoted = (res.vote_counts[optionId] === mostVotes);
				var percent = (!res.total_votes) ? 0 : Math.round((res.vote_counts[optionId] / res.total_votes) * 100);
				var percentRel = (mostVotes === 0) ? 0 : Math.round((res.vote_counts[optionId] / mostVotes) * 100);
				var altText;
	
				altText = $this.attr('data-alt-text');
				if (voted) {
					$this.attr('title', $.trim(altText));
				} else {
					$this.attr('title', '');
				};
				$this.toggleClass('voted', voted);
				$this.toggleClass('most-votes', mostVoted);
	
				// Update the bars
				var bar = $this.find('.resultbar div');
				var barTimeLapse = (res.can_vote) ? 500 : 1500;
				var newBarClass = (percent === 100) ? 'pollbar5' : 'pollbar' + (Math.floor(percent / 20) + 1);
	
				setTimeout(function () {
					bar.animate({ width: percentRel + '%' }, 500)
						.removeClass('pollbar1 pollbar2 pollbar3 pollbar4 pollbar5')
						.addClass(newBarClass)
						.html(res.vote_counts[optionId]);
	
					var percentText = percent ? percent + '%' : res.NO_VOTES;
					$this.find('.poll_option_percent').html(percentText);
				}, barTimeLapse);
			});
	
			if (!res.can_vote) {
				poll.find('.polls').delay(400).fadeIn(500);
			}
	
			// Display "Your vote has been cast." message. Disappears after 5 seconds.
			var confirmationDelay = (res.can_vote) ? 300 : 900;
			poll.find('.vote-submitted').delay(confirmationDelay).slideDown(200, function() {
				if (resultsVisible) {
					updatePanelHeight();
				}
	
				$(this).delay(5000).fadeOut(500, function() {
					resizePanel(300);
				});
			});
	
			// Remove the gap resulting from removing options
			setTimeout(function() {
				resizePanel(500);
			}, 1500);
	
			var resizePanel = function (time) {
				var panelHeight = panel.height();
				var innerHeight = panel.find('.inner').outerHeight();
	
				if (panelHeight !== innerHeight) {
					panel.css({ minHeight: '', height: panelHeight })
						.animate({ height: innerHeight }, time, function () {
							panel.css({ minHeight: innerHeight, height: '' });
						});
				}
			};
		}
	});
	
	/**
	 * Show poll results when clicking View results link.
	 */
	$('.poll_view_results a').click(function(e) {
		// Do not follow the link
		e.preventDefault();
	
		var $poll = $(this).parents('.topic_poll');
	
		$poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);
		$poll.find('.poll_view_results').hide(500);
	});
	
	$('[data-ajax]').each(function() {
		var $this = $(this);
		var ajax = $this.attr('data-ajax');
		var filter = $this.attr('data-filter');
	
		if (ajax !== 'false') {
			var fn = (ajax !== 'true') ? ajax : null;
			filter = (filter !== undefined) ? phpbb.getFunctionByName(filter) : null;
	
			phpbb.ajaxify({
				selector: this,
				refresh: $this.attr('data-refresh') !== undefined,
				filter: filter,
				callback: fn
			});
		}
	});
	
	
	/**
	 * This simply appends #preview to the action of the
	 * QR action when you click the Full Editor & Preview button
	 */
	$('#qr_full_editor').click(function() {
		$('#qr_postform').attr('action', function(i, val) {
			return val + '#preview';
		});
	});
	
	
	/**
	 * Make the display post links to use JS
	 */
	$('.display_post').click(function(e) {
		// Do not follow the link
		e.preventDefault();
	
		var postId = $(this).attr('data-post-id');
		$('#post_content' + postId).show();
		$('#profile' + postId).show();
		$('#post_hidden' + postId).hide();
	});
	
	/**
	* Toggle the member search panel in memberlist.php.
	*
	* If user returns to search page after viewing results the search panel is automatically displayed.
	* In any case the link will toggle the display status of the search panel and link text will be
	* appropriately changed based on the status of the search panel.
	*/
	$('#member_search').click(function () {
		var $memberlistSearch = $('#memberlist_search');
	
		$memberlistSearch.slideToggle('fast');
		phpbb.ajaxCallbacks.alt_text.call(this);
	
		// Focus on the username textbox if it's available and displayed
		if ($memberlistSearch.is(':visible')) {
			$('#username').focus();
		}
		return false;
	});
	
	/**
	* Automatically resize textarea
	*/
	$(function() {
		var $textarea = $('textarea:not(#message-box textarea, .no-auto-resize)');
		phpbb.resizeTextArea($textarea, { minHeight: 75, maxHeight: 250 });
		phpbb.resizeTextArea($('textarea', '#message-box'));
	});
	})(jQuery); // Avoid conflicts with other libraries

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * KONIEC ajax.js
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

/**
 * 
 * 
 * ext\phpbb\collapsiblecategories\styles\all\template\js\collapsiblecategories.js
 * 
 * 
 */

/**
 * $(document).ready(function() { 
 */

/**
 * });
*/

/**
 * 
 * 
 * ext\volksdevil\activitybuttons\styles\all\template\js\hidequicklinks.js
 * 
 * 
 */

/**
 * 
 * 
 * ext\kasimi\markpostunread\styles\all\template\js\markpostunread.js
 * 
 * 
 */

/**
 * 
 * 
 * ext\vse\abbc3\styles\all\template\js\abbc3.min.js
 * 
 * 
 */

/**
 * 
 * 
 * ext\vse\lightbox\styles\all\template\js\resizer.js
 * 
 * 
 */

/**
 * 
 * 
 * ext\vse\lightbox\styles\all\template\lightbox\js\lightbox.min.js
 * 
 * 
 */

/*!
 * Lightbox v2.9.0
 * by Lokesh Dhakar
 *
 * More info:
 * http://lokeshdhakar.com/projects/lightbox2/
 *
 * Copyright 2007, 2015 Lokesh Dhakar
 * Released under the MIT license
 * https://github.com/lokesh/lightbox2/blob/master/LICENSE
 */
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):"object"==typeof exports?module.exports=b(require("jquery")):a.lightbox=b(a.jQuery)}(this,function(a){function b(b){this.album=[],this.currentImageIndex=void 0,this.init(),this.options=a.extend({},this.constructor.defaults),this.option(b)}return b.defaults={albumLabel:"Image %1 of %2",alwaysShowNavOnTouchDevices:!1,fadeDuration:600,fitImagesInViewport:!0,imageFadeDuration:600,positionFromTop:50,resizeDuration:700,showImageNumberLabel:!0,wrapAround:!1,disableScrolling:!1,sanitizeTitle:!1},b.prototype.option=function(b){a.extend(this.options,b)},b.prototype.imageCountLabel=function(a,b){return this.options.albumLabel.replace(/%1/g,a).replace(/%2/g,b)},b.prototype.init=function(){var b=this;a(document).ready(function(){b.enable(),b.build()})},b.prototype.enable=function(){var b=this;a("body").on("click","a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]",function(c){return b.start(a(c.currentTarget)),!1})},b.prototype.build=function(){var b=this;a('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>').appendTo(a("body")),this.$lightbox=a("#lightbox"),this.$overlay=a("#lightboxOverlay"),this.$outerContainer=this.$lightbox.find(".lb-outerContainer"),this.$container=this.$lightbox.find(".lb-container"),this.$image=this.$lightbox.find(".lb-image"),this.$nav=this.$lightbox.find(".lb-nav"),this.containerPadding={top:parseInt(this.$container.css("padding-top"),10),right:parseInt(this.$container.css("padding-right"),10),bottom:parseInt(this.$container.css("padding-bottom"),10),left:parseInt(this.$container.css("padding-left"),10)},this.imageBorderWidth={top:parseInt(this.$image.css("border-top-width"),10),right:parseInt(this.$image.css("border-right-width"),10),bottom:parseInt(this.$image.css("border-bottom-width"),10),left:parseInt(this.$image.css("border-left-width"),10)},this.$overlay.hide().on("click",function(){return b.end(),!1}),this.$lightbox.hide().on("click",function(c){return"lightbox"===a(c.target).attr("id")&&b.end(),!1}),this.$outerContainer.on("click",function(c){return"lightbox"===a(c.target).attr("id")&&b.end(),!1}),this.$lightbox.find(".lb-prev").on("click",function(){return 0===b.currentImageIndex?b.changeImage(b.album.length-1):b.changeImage(b.currentImageIndex-1),!1}),this.$lightbox.find(".lb-next").on("click",function(){return b.currentImageIndex===b.album.length-1?b.changeImage(0):b.changeImage(b.currentImageIndex+1),!1}),this.$nav.on("mousedown",function(a){3===a.which&&(b.$nav.css("pointer-events","none"),b.$lightbox.one("contextmenu",function(){setTimeout(function(){this.$nav.css("pointer-events","auto")}.bind(b),0)}))}),this.$lightbox.find(".lb-loader, .lb-close").on("click",function(){return b.end(),!1})},b.prototype.start=function(b){function c(a){d.album.push({link:a.attr("href"),title:a.attr("data-title")||a.attr("title")})}var d=this,e=a(window);e.on("resize",a.proxy(this.sizeOverlay,this)),a("select, object, embed").css({visibility:"hidden"}),this.sizeOverlay(),this.album=[];var f,g=0,h=b.attr("data-lightbox");if(h){f=a(b.prop("tagName")+'[data-lightbox="'+h+'"]');for(var i=0;i<f.length;i=++i)c(a(f[i])),f[i]===b[0]&&(g=i)}else if("lightbox"===b.attr("rel"))c(b);else{f=a(b.prop("tagName")+'[rel="'+b.attr("rel")+'"]');for(var j=0;j<f.length;j=++j)c(a(f[j])),f[j]===b[0]&&(g=j)}var k=e.scrollTop()+this.options.positionFromTop,l=e.scrollLeft();this.$lightbox.css({top:k+"px",left:l+"px"}).fadeIn(this.options.fadeDuration),this.options.disableScrolling&&a("body").addClass("lb-disable-scrolling"),this.changeImage(g)},b.prototype.changeImage=function(b){var c=this;this.disableKeyboardNav();var d=this.$lightbox.find(".lb-image");this.$overlay.fadeIn(this.options.fadeDuration),a(".lb-loader").fadeIn("slow"),this.$lightbox.find(".lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption").hide(),this.$outerContainer.addClass("animating");var e=new Image;e.onload=function(){var f,g,h,i,j,k,l;d.attr("src",c.album[b].link),f=a(e),d.width(e.width),d.height(e.height),c.options.fitImagesInViewport&&(l=a(window).width(),k=a(window).height(),j=l-c.containerPadding.left-c.containerPadding.right-c.imageBorderWidth.left-c.imageBorderWidth.right-20,i=k-c.containerPadding.top-c.containerPadding.bottom-c.imageBorderWidth.top-c.imageBorderWidth.bottom-120,c.options.maxWidth&&c.options.maxWidth<j&&(j=c.options.maxWidth),c.options.maxHeight&&c.options.maxHeight<j&&(i=c.options.maxHeight),(e.width>j||e.height>i)&&(e.width/j>e.height/i?(h=j,g=parseInt(e.height/(e.width/h),10),d.width(h),d.height(g)):(g=i,h=parseInt(e.width/(e.height/g),10),d.width(h),d.height(g)))),c.sizeContainer(d.width(),d.height())},e.src=this.album[b].link,this.currentImageIndex=b},b.prototype.sizeOverlay=function(){this.$overlay.width(a(document).width()).height(a(document).height())},b.prototype.sizeContainer=function(a,b){function c(){d.$lightbox.find(".lb-dataContainer").width(g),d.$lightbox.find(".lb-prevLink").height(h),d.$lightbox.find(".lb-nextLink").height(h),d.showImage()}var d=this,e=this.$outerContainer.outerWidth(),f=this.$outerContainer.outerHeight(),g=a+this.containerPadding.left+this.containerPadding.right+this.imageBorderWidth.left+this.imageBorderWidth.right,h=b+this.containerPadding.top+this.containerPadding.bottom+this.imageBorderWidth.top+this.imageBorderWidth.bottom;e!==g||f!==h?this.$outerContainer.animate({width:g,height:h},this.options.resizeDuration,"swing",function(){c()}):c()},b.prototype.showImage=function(){this.$lightbox.find(".lb-loader").stop(!0).hide(),this.$lightbox.find(".lb-image").fadeIn(this.options.imageFadeDuration),this.updateNav(),this.updateDetails(),this.preloadNeighboringImages(),this.enableKeyboardNav()},b.prototype.updateNav=function(){var a=!1;try{document.createEvent("TouchEvent"),a=this.options.alwaysShowNavOnTouchDevices?!0:!1}catch(b){}this.$lightbox.find(".lb-nav").show(),this.album.length>1&&(this.options.wrapAround?(a&&this.$lightbox.find(".lb-prev, .lb-next").css("opacity","1"),this.$lightbox.find(".lb-prev, .lb-next").show()):(this.currentImageIndex>0&&(this.$lightbox.find(".lb-prev").show(),a&&this.$lightbox.find(".lb-prev").css("opacity","1")),this.currentImageIndex<this.album.length-1&&(this.$lightbox.find(".lb-next").show(),a&&this.$lightbox.find(".lb-next").css("opacity","1"))))},b.prototype.updateDetails=function(){var b=this;if("undefined"!=typeof this.album[this.currentImageIndex].title&&""!==this.album[this.currentImageIndex].title){var c=this.$lightbox.find(".lb-caption");this.options.sanitizeTitle?c.text(this.album[this.currentImageIndex].title):c.html(this.album[this.currentImageIndex].title),c.fadeIn("fast").find("a").on("click",function(b){void 0!==a(this).attr("target")?window.open(a(this).attr("href"),a(this).attr("target")):location.href=a(this).attr("href")})}if(this.album.length>1&&this.options.showImageNumberLabel){var d=this.imageCountLabel(this.currentImageIndex+1,this.album.length);this.$lightbox.find(".lb-number").text(d).fadeIn("fast")}else this.$lightbox.find(".lb-number").hide();this.$outerContainer.removeClass("animating"),this.$lightbox.find(".lb-dataContainer").fadeIn(this.options.resizeDuration,function(){return b.sizeOverlay()})},b.prototype.preloadNeighboringImages=function(){if(this.album.length>this.currentImageIndex+1){var a=new Image;a.src=this.album[this.currentImageIndex+1].link}if(this.currentImageIndex>0){var b=new Image;b.src=this.album[this.currentImageIndex-1].link}},b.prototype.enableKeyboardNav=function(){a(document).on("keyup.keyboard",a.proxy(this.keyboardAction,this))},b.prototype.disableKeyboardNav=function(){a(document).off(".keyboard")},b.prototype.keyboardAction=function(a){var b=27,c=37,d=39,e=a.keyCode,f=String.fromCharCode(e).toLowerCase();e===b||f.match(/x|o|c/)?this.end():"p"===f||e===c?0!==this.currentImageIndex?this.changeImage(this.currentImageIndex-1):this.options.wrapAround&&this.album.length>1&&this.changeImage(this.album.length-1):("n"===f||e===d)&&(this.currentImageIndex!==this.album.length-1?this.changeImage(this.currentImageIndex+1):this.options.wrapAround&&this.album.length>1&&this.changeImage(0))},b.prototype.end=function(){this.disableKeyboardNav(),a(window).off("resize",this.sizeOverlay),this.$lightbox.fadeOut(this.options.fadeDuration),this.$overlay.fadeOut(this.options.fadeDuration),a("select, object, embed").css({visibility:"visible"}),this.options.disableScrolling&&a("body").removeClass("lb-disable-scrolling")},new b});
//# sourceMappingURL=lightbox.min.map

/**
 * 
 * 
 * ext\vse\topicpreview\styles\all\template\topicpreview.js
 * 
 * 
 */



/**
 * 
 * 
 * 
 * 
 * 
 * 
 * DALSZA CZĘŚĆ NIE BYŁA NIGDY MINIFIED
 * 
 * 
 * 
 * 
 * 
 */

(function(document, history, location) {
  var HISTORY_SUPPORT = !!(history && history.pushState);

  var TOPSITE_HEIGHT_PX = $('#top-site-menu').height();
  
  var anchorScrolls = {
    ANCHOR_REGEX: /^#[^ ]+$/,
    OFFSET_HEIGHT_PX: TOPSITE_HEIGHT_PX,

    /**
     * Establish events, and fix initial scroll position if a hash is provided.
     */
    init: function() {
      this.scrollToCurrent();
      $(window).on('hashchange', $.proxy(this, 'scrollToCurrent'));
      $('body').on('click', 'a', $.proxy(this, 'delegateAnchors'));
    },

    /**
     * Return the offset amount to deduct from the normal scroll position.
     * Modify as appropriate to allow for dynamic calculations
     */
    getFixedOffset: function() {
      return this.OFFSET_HEIGHT_PX;
    },

    /**
     * If the provided href is an anchor which resolves to an element on the
     * page, scroll to it.
     * @param  {String} href
     * @return {Boolean} - Was the href an anchor.
     */
    scrollIfAnchor: function(href, pushToHistory) {
      var match, anchorOffset;

      if(!this.ANCHOR_REGEX.test(href)) {
        return false;
      }

      match = document.getElementById(href.slice(1));

      if(match) {
        anchorOffset = $(match).offset().top - this.getFixedOffset();
        $('html, body').animate({ scrollTop: anchorOffset});

        // Add the state to history as-per normal anchor links
        if(HISTORY_SUPPORT && pushToHistory) {
          history.pushState({}, document.title, location.pathname + href);
        }
      }

      return !!match;
    },
    
    /**
     * Attempt to scroll to the current location's hash.
     */
    scrollToCurrent: function(e) { 
      if(this.scrollIfAnchor(window.location.hash) && e) {
      	e.preventDefault();
      }
    },

    /**
     * If the click event's target was an anchor, fix the scroll position.
     */
    delegateAnchors: function(e) {
      var elem = e.target;

      if(this.scrollIfAnchor(elem.getAttribute('href'), true)) {
        e.preventDefault();
      }
    }
  };

	$(document).ready($.proxy(anchorScrolls, 'init'));
})(window.document, window.history, window.location);

/**
* Nazwa wpisywanego tematu real time
*/
	
function show_name_post_real_time(event) {
  var x = event.key;
  document.getElementById("titleID").innerHTML = document.getElementById("subject").value;
}

$(document).ready(function(){

	/**
	* Pokazywanie Menu
	*/
	
	var timeoutMenu = 0;
		
	$(".menu-devil").on('mouseenter', function() {
		var bottomMenu = $(this).next(".menu-all");
		timeoutMenu = setTimeout( function() {
			if ( bottomMenu.css("display") == "none" ){ bottomMenu.fadeIn(150).css("display","flex"); }
		}, 150);
	}).on('mouseleave mouseup', function() {
		clearTimeout(timeoutMenu);
	});

	$(".menu-devil").on('click', function(){
		var bottomMenu = $(this).next(".menu-all");
		if ( bottomMenu.css("display") == "none" ){ bottomMenu.fadeIn(150).css("display","flex"); }
		else { bottomMenu.fadeOut(0); }
	});

	$(".menu-toggle").on('mouseleave', function(){
		var bottomMenu = $(this).children(".menu-all");
		if ( bottomMenu.css("display") == "flex" ){ bottomMenu.fadeOut(0); }
	});
	
	/**
	* Last Post Feed Mobile
	*/

	if(  $('#phpbb').hasClass('hastouch') ){
		$("#m-feed-topics, .search-box").on('click', function( event ){
			var clicks = $(this).data('clicks');
			if ( clicks ) {
				console.log('odd number of clicks');
			} else {
				event.preventDefault();
				console.log('even number of clicks');
			}
			$(this).data("clicks", !clicks);
		});
	}
	
	/**
	* Search box width show and hide
	*/
	
	var timeoutSearchBox = 0;
	$(".search-box").on('mouseenter', function() {
		var search_inputbox = $(this).find(".inputbox");
		var search_box_hide = $(this).find(".search-box-hide");
		timeoutSearchBox = setTimeout( function() {
			search_inputbox.focus().animate({ width: "175px" }, 500 );
			search_box_hide.fadeIn(500).css("display","flex");
		}, 300);
	}).on('mouseleave mouseup', function() {
		clearTimeout(timeoutSearchBox);
	});
	
	$(".search-box-hide").on('click', function() {
		var search_inputbox = $(this).next(".inputbox");
		var search_box_hide = $(this);
		search_inputbox.animate({ width: "0px" }, 500 );
		search_box_hide.fadeOut(500);
	});
	
	/**
	* Switcheroo switch
	*/
	
	var timeoutSwitcheroo = 0;
	$(".switcheroo-menu").on('mouseenter click', function() {
		var switcheroo_devil = $(this).children(".switcheroo-menu-devil");
		var switcheroo_all = $(this).children(".switcheroo-menu-all");
		timeoutSwitcheroo = setTimeout( function() {
			switcheroo_devil.fadeOut(0);
			switcheroo_all.fadeIn(200).css("display","flex");
		} , 150);
	}).on('mouseleave', function() {
		var switcheroo_devil = $(this).children(".switcheroo-menu-devil");
		var switcheroo_all = $(this).children(".switcheroo-menu-all");
		switcheroo_all.fadeOut(0);
		switcheroo_devil.fadeIn(0).css("display","flex");
		clearTimeout(timeoutSwitcheroo);
	});
	
});

/**
* Wklejanie dyskografii i składu pół-automat
*/

function bandInfo() {
	var bandInfoInput = document.getElementById('bandInfoInput');
	var bandInfoOutput = document.getElementById('message');
	  
	var str = bandInfoInput.value;
	console.log(str);
	
	var ifMAcopy = 'DiscographyMembersReviewsSimilar ArtistsRelated Links';
	var ifMAcopy2 = 'DiscographyMembersSimilar ArtistsRelated Links';
	
	var dyskoOutStart ='Name\tType\tYear\tReviews\n';

	if (str.search(dyskoOutStart)!=-1) {

		str = str.slice(str.search(dyskoOutStart) + dyskoOutStart.length,str.length);
		var dyskoOutEnd ='\nAdded by: ';
		str = str.slice(0,str.search(dyskoOutEnd));
		console.log(str);
		
		var wydawnictwo = str.split("\n");
		var txt = "";

		var walbum =/\[full\-length\]/gmi;
		var wdemo =/\[demo\]/gmi;
		var wother_live_album =/\[live album\]/gmi;
		var wother_split =/\[split\]/gmi;
		var wother_video =/\[video\]/gmi;
		var wother_split_video =/\[split video\]/gmi;
		var wother_compilation =/\[compilation\]/gmi;
		var wother_single =/\[single\]/gmi;
		var wother_boxed_set =/\[boxed set\]/gmi;
		
		for(var i=0;i<wydawnictwo.length;i++){
			var wydawnictwoTmp = "";
			wydawnictwoTmp = wydawnictwo[i].split('\t');
			wydawnictwo[i] = wydawnictwoTmp[2] + ' - ' + wydawnictwoTmp[0] + ' [' + wydawnictwoTmp[1].toLowerCase() + ']';
			
			if(wydawnictwo[i].search(walbum)!=-1){
				wydawnictwo[i] = '[w-album]' + wydawnictwo[i] + '[/w-album]';
			}
			else if( (wydawnictwo[i].search(wdemo)!=-1) ){
				console.log("1: " + wydawnictwo[i]);
				wydawnictwo[i] = '[w-demo]' + wydawnictwo[i] + '[/w-demo]';
				console.log("2: " + wydawnictwo[i]);
			}
			else if( (wydawnictwo[i].search(wother_live_album)!=-1) || (wydawnictwo[i].search(wother_split)!=-1) || (wydawnictwo[i].search(wother_video)!=-1) || (wydawnictwo[i].search(wother_split_video)!=-1) || (wydawnictwo[i].search(wother_compilation)!=-1) || (wydawnictwo[i].search(wother_single)!=-1) || (wydawnictwo[i].search(wother_boxed_set)!=-1)){
				wydawnictwo[i] = '[w-other]' + wydawnictwo[i] + '[/w-other]';
			}
			else{
				wydawnictwo[i] = '[w-norm]' + wydawnictwo[i] + '[/w-norm]';
			}
			txt = txt + wydawnictwo[i] + '\n';
		}

		var regex1 =/ \[full\-length\]/gmi;
		var regex1New = '';
		var regex2 =/ \[compilation\]/gmi;
		var regex2New = ' \[kompilacja\]';
		var regex3 =/ \[live album\]/gmi;
		var regex3New = ' \[live\]';
		var regex4 =/ \[collaboration\]/gmi;
		var regex4New = ' \[kolaboracja\]';
		var regex5 =/ \[ep\]/gmi;
		var regex5New = ' \[EP\]';
		txt = txt.replace(regex1,regex1New).replace(regex2,regex2New).replace(regex3,regex3New).replace(regex4,regex4New).replace(regex5,regex5New);

		bandInfoOutput.value += '\n\n[t]Dyskografia:[/t]\n' + txt;
		bandInfoInput.value = '';

	}
	else if ( str.search(ifMAcopy)!=-1 || str.search(ifMAcopy2)!=-1){

		//wycinanie skladu - początek
		var skladOutStart1 ='\nCurrent lineup\n';
		var skladOutStart2 ='\nCurrent\n';
		var skladOutStart3 ='\nLast known lineup\n';
		var skladOutStart4 ='\nLast known\n';
		
		if (str.search(skladOutStart1) != -1 ) {
			str = str.slice(str.search(skladOutStart1) + skladOutStart1.length,str.length);
		}
		else if (str.search(skladOutStart2) != -1 ) {
			str = str.slice(str.search(skladOutStart2) + skladOutStart2.length,str.length);
		}
		else if (str.search(skladOutStart3) != -1 ) {
			str = str.slice(str.search(skladOutStart3) + skladOutStart3.length,str.length);
		}
		else if (str.search(skladOutStart4) != -1 ) {
			str = str.slice(str.search(skladOutStart4) + skladOutStart4.length,str.length);
		}
		var skladOutEnd ='\nAdded by: ';
		str = str.slice(0,str.search(skladOutEnd));
		console.log(str);
		//wycinanie skladu - koniec
		
		str = str.replace(/^\(RIP/gm,' (R.I.P.').replace(/^\(R.I.P/gm,' (R.I.P');
		
		var currentLive = /Current \(Live\)\n/gmi;
		var pastLive = /Past \(Live\)\n/gmi;
		var lastKnownLive = /Last known \(Live\)\n/gmi;
		var past = /^Past\n/gmi;
		
		console.log('past (live): ' + str);
		
		var muzyk = str.split("\n");
		var str = "";

		for(var i=0;i<muzyk.length;i++){

			if ( muzyk[i].search("See also: ") != -1 ) {
				muzyk[i] = muzyk[i].replace("See also: ",' [l]') + "[/l]";
			}
			else if ( muzyk[i].search("\t") != -1 ) {
				muzyk[i] = "\n" + muzyk[i];
			}
			if (muzyk[i] == 'Past') {
				muzyk[i] = "\n" + muzyk[i];
			}
			console.log('muzyk i: ' + muzyk[i]);
			str = str + muzyk[i];
		}
		
		var muzycy_aktualny_sklad, muzycy_byli = "";
		if(str.search(past)!= -1){
			muzycy_aktualny_sklad = str.slice(0,str.search(past));
			if(str.search(currentLive)!=-1){muzycy_byli = str.slice(str.search(past),str.search(currentLive));}
			else if(str.search(lastKnownLive)!=-1){muzycy_byli = str.slice(str.search(past),str.search(lastKnownLive));}
			else if(str.search(pastLive)!=-1){muzycy_byli = str.slice(str.search(past),str.search(pastLive));}
			else{muzycy_byli = str.slice(str.search(past),str.length);}
		}
		else if(str.search(currentLive)!= -1) {
			muzycy_aktualny_sklad = str.slice(0,str.search(currentLive));
		}
		else if(str.search(lastKnownLive)!= -1) {
			muzycy_aktualny_sklad = str.slice(0,str.search(lastKnownLive));
		}
		else if(str.search(pastLive)!= -1) {
			muzycy_aktualny_sklad = str.slice(0,str.search(pastLive));
		}
		else{
			muzycy_aktualny_sklad = str.slice(0,str.length);
		}
		//console.log('txt '+str);
		
		var muzycy_koncertowi_aktualni="";
		if(str.search(currentLive)!=-1){
			if(str.search(lastKnownLive)!=-1){muzycy_koncertowi_aktualni = str.slice(str.search(currentLive),str.search(lastKnownLive));}
			else if(str.search(pastLive)!=-1){muzycy_koncertowi_aktualni = str.slice(str.search(currentLive),str.search(pastLive));}
			else{muzycy_koncertowi_aktualni = str.slice(str.search(currentLive),str.length);}
		}
			
		var muzycy_koncertowi_byli="";
		if(str.search(lastKnownLive)!=-1){
			muzycy_koncertowi_byli = str.slice(str.search(lastKnownLive),str.length);
		}
		else if(str.search(pastLive)!=-1){
			muzycy_koncertowi_byli = str.slice(str.search(pastLive),str.length);
		}

		if( muzycy_byli!=""){
			muzycy_byli='[muzycy-byli]' + muzycy_byli + '[/muzycy-byli]';
		}

		var muzycy_koncertowi = "";
		if( muzycy_koncertowi_aktualni!="" | muzycy_koncertowi_byli!="" ){
			
			if( muzycy_byli!=""){
				muzycy_koncertowi='\r\n\r\n[muzycy-live]' + muzycy_koncertowi_aktualni;
			}
			else{
				muzycy_koncertowi='\r\n\r\n[muzycy-live]' + muzycy_koncertowi_aktualni;
			}
			
			if( muzycy_koncertowi_aktualni!='' && muzycy_koncertowi_byli!='' ){
				muzycy_koncertowi = muzycy_koncertowi + '\r\n\r\n';
			}
			
			muzycy_koncertowi = muzycy_koncertowi + muzycy_koncertowi_byli + '[/muzycy-live]'
		}

		console.log(muzycy_aktualny_sklad);
		console.log(muzycy_byli);
		console.log(muzycy_koncertowi_aktualni);
		console.log(muzycy_koncertowi_byli);

		str = muzycy_aktualny_sklad + muzycy_byli + muzycy_koncertowi;

		str = str.replace(/Current \(Live\)\n/gmi,'').replace(/Past \(Live\)\n/gmi,'').replace(/Last known \(Live\)\n/gmi,'').replace(/\[muzycy\-byli\]Past\n/gmi,'\n[muzycy-byli]').replace(/\n\[\/muzycy\-byli\]/gmi,'\[\/muzycy\-byli\]');
		
		//ZAMIANA TABOW
		str = str.replace(/\t/gm,' - ');
		
		hehe = str.search(/\(R.I.P/gm);
		console.log("PRZED RIP1: " + hehe);
		console.log("PRZED RIP2: " + str);
		
		
		//ZAMIANA TABOW PO R.I.P.
		str = str.replace(/\ -  \[l\]/gm,'\ [l\]');
		
		if(str != ""){
			bandInfoOutput.value += '\n[t]Skład:[/t]' + str;
			bandInfoInput.value = '';
		}
	}
	
	else {
		bandInfoInput.value = '';
	}

}

/**
* KONIEC - Wklejanie dyskografii i składu pół-automat - KONIEC
*/