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
	  	/*console.log('e: ' + JSON.stringify(e));
		console.log('target: ' + e.target);
		console.log("elem.getAttribute('href') " + elem.getAttribute('href'));*/
        e.preventDefault();
      }
    }
  };

	$(document).ready($.proxy(anchorScrolls, 'init'));
})(window.document, window.history, window.location);

/**
 * Nazwa wpisywanego tematu real time, wczytuje do tytułu menu wpisywaną wartość String
 */

function showTopicNameInRealTime() {
	"use strict";

	document.getElementById("titleID").innerText = document.getElementById("subject").value;

}

/* jQuery section */

$(document).ready(function(){
	"use strict";

	/** Function calculateMenuAllWidthOrMarginLeft calculates and sets values of .menu-all:
	 * width: if chosen menu is a .contact-box
	 * margin-left: if chosen menu is not a top menu item (.main-menu-item), quick topic tools (.quickmod-box) or tags in viewtopic_body (.tag-box)
	 */

	function calculateMenuAllWidthOrMarginLeft(top, bottom) {

		if ( bottom.hasClass("contact-box-all") ) {
			/* for .contact-box, width of .menu-all is based on .postprofile width */
			bottom.css("width", bottom.closest(".postprofile").width());
		}

		if ( !bottom.hasClass("main-menu-bottom") && !bottom.hasClass("quickmod-box-all") && !bottom.hasClass("tag-box-all") ) {
			/* center the bottom part of a menu based on width of it and the width of it's top icon */
			let marginValue = -((parseFloat(bottom.css("width")) - parseFloat(top.css("width")))/2);
			bottom.css("margin-left", marginValue);
		}

	}

	/**
	 * Show / Hide menus
	 */

	let timeoutMenu = 0;

	/* Display menu on: mouse enter (delay the display by set Timeout)
	 * Hide menu on: mouse leave or mouse up
	 */

	$(".menu-root").on("mouseenter", function() {

		let topMenu = $(this);
		let bottomMenu = topMenu.next(".menu-all");

		timeoutMenu = setTimeout( function() {
			if ( bottomMenu.css("display") == "none" ) {
				bottomMenu.fadeIn(150).css("display","flex");
				calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
			}
		}, 150);

	}).on("mouseleave mouseup", function() {

		clearTimeout(timeoutMenu);

	});

	/* Toggle display / hide menu on: click */

	$(".menu-root").on("click", function() {

		let topMenu = $(this);
		let bottomMenu = topMenu.next(".menu-all");

		if ( bottomMenu.css("display") == "none" ) {
			bottomMenu.fadeIn(150).css("display","flex");
			calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
		}
		else if ( topMenu.attr("id") != "mm-search-root" ) {
			bottomMenu.fadeOut(0);
		}

	});

	/* Hide menu on: mouse leave */

	$(".menu-toggle").on("mouseleave", function() {

		let bottomMenu = $(this).children(".menu-all");

		if ( bottomMenu.css("display") == "flex" ) {
			bottomMenu.fadeOut(0);
		}

	});
	
	/**
	 * Unread or Active topics feeds & Displaying search input on Mobile
	 */
	
	$("#mm-topics, #search-box-icon").on("click", function(event) {
		if( $("#phpbb").hasClass("hastouch") ) {
			let clickedIcon = $(this);
			let clicks = clickedIcon.data("clicks");

			if ( clicks ) {
				/*console.log("if " + clicks);*/
			}
			else {
				event.preventDefault();
				/*console.log("else if " + clicks);*/
			}

			clickedIcon.data("clicks", !clicks);
			/*console.log("clicks: " + clicks);*/
		}
	});
	
	$("#search-box-hide").on("click", function() {
		if( $("#phpbb").hasClass("hastouch") ) {
			$("#search-box-icon").data("clicks", false);
			/*console.log("clicks searchboxa: " + $("#search-box-icon").data("clicks"));*/
		}
	});

	/**
	 * Search box width show and hide
	 */

	let windowWidth = parseFloat(window.innerWidth);
	const desktopSearchInputboxWidth = "200px";
	const searchBreakpoint = 860;

	/* if viewport resized, do */

	$(window).on("resize", function() {

		let searchInputbox = $("#search-box-keywords");

		windowWidth = parseFloat(window.innerWidth);

		/** if search input is expanded and viewport was resized, resize it too if needed
		 * if vw <= 860px - calculate input width based on viewport width
		 * if vw > 860px - width defined as desktopSearchInputboxWidth variable
		 */
		if( searchInputbox.outerWidth() != 0 ) {
			if( windowWidth <= searchBreakpoint ) {
				let tmpSearchInputboxWidth = $("#mm-search").outerWidth() - parseFloat(searchInputbox.css("margin-left"));
				searchInputbox.css("width", tmpSearchInputboxWidth + "px");
			}
			else {
				searchInputbox.css("width", desktopSearchInputboxWidth);
			}
		}
	});
	
	let timeoutSearchBox = 0;

	$("#search-box-icon").on("mouseenter click", function() {

		let searchButtonTop = $(this);
		let searchInputbox = searchButtonTop.siblings(".inputbox");
		let searchBoxHideIcon = searchButtonTop.siblings("#search-box-hide").children(".fa");
		let searchForm = searchButtonTop.closest("#mm-search");

		timeoutSearchBox = setTimeout( function() {

			searchForm.css("width", "100%");
			searchInputbox.css("padding","0px 5px");

			/* if vw <= 860, then input + margin-left = whole width of main menu */
			if ( windowWidth <= searchBreakpoint ) {
				let tmpSearchInputboxWidth = searchForm.width() - parseFloat(searchInputbox.css("margin-left"));
				searchInputbox.focus().animate({ width: tmpSearchInputboxWidth + "px" }, 500 );
			}
			else {
				searchInputbox.focus().animate({ width: desktopSearchInputboxWidth }, 500 );
			}

			searchBoxHideIcon.fadeIn(500).css("display","flex");

		}, 300);

	}).on("mouseleave mouseup", function() {
		clearTimeout(timeoutSearchBox);
	});
	
	$("#search-box-hide").on("click", function() {

		let searchBoxHide = $(this);
		let searchBoxHideIcon = searchBoxHide.children(".fa");
		let searchInputbox = searchBoxHide.siblings(".inputbox");
		let searchForm = searchBoxHide.closest("#mm-search");

		if ( windowWidth <= searchBreakpoint ) {
			/* animation queue */
			searchInputbox.animate({ width: "0px" }, 500 );
			searchInputbox.animate({ padding: "0" }, 500 );
		}
		else {
			searchInputbox.animate({ width: "0px", padding: "0" }, 500 );
		}

		searchBoxHideIcon.fadeOut(500);

		setTimeout( function() {
			searchForm.css("width", "auto");
			searchInputbox.val("");
		}, 500);

	});
	
	/**
	 * Switcheroo switch
	 */
	
	let timeoutSwitcheroo = 0;

	$(".switcheroo-menu").on("mouseenter click", function() {

		let switcherooRoot = $(this).children(".switcheroo-menu-root");
		let switcherooAll = $(this).children(".switcheroo-menu-all");

		timeoutSwitcheroo = setTimeout( function() {

			switcherooRoot.fadeOut(0);
			switcherooAll.fadeIn(200).css("display","flex");

		} , 150);

	}).on("mouseleave", function() {

		let switcherooRoot = $(this).children(".switcheroo-menu-root");
		let switcherooAll = $(this).children(".switcheroo-menu-all");

		switcherooAll.fadeOut(0);
		switcherooRoot.fadeIn(0).css("display","flex");

		clearTimeout(timeoutSwitcheroo);

	});

	/**
	 * Refresh icon finishes a full spin after mouseleave
	 */

	$("#refresh-band-info-icon").on("mouseenter", function() {
	
		let spinningIcon = $(this);
		spinningIcon.addClass("fa-spin-hover").addClass("mouse-has-entered");
	
		let spinStopDelay = setInterval( function() {
			if ( !spinningIcon.hasClass("mouse-has-entered") ) {
				spinningIcon.removeClass("fa-spin-hover");
				clearTimeout(spinStopDelay);
			}
		}, 1000); // Make sure this 1 second delay is the same with one in the .fa-spin-hover css
	
	}).on("mouseleave", function() {

		$(this).removeClass("mouse-has-entered");
	
	});
	
});

/** PROGRESS CURSOR HANDLING
 * Adds or removes a CSS class to signal that a function is in progress by changing mouse cursor.
 */

function showProgressCursor() {
	document.body.classList.add('function-in-progress');
}
  
function hideProgressCursor() {
	document.body.classList.remove('function-in-progress');
}