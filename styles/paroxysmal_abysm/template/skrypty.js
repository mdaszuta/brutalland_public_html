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
			if ( bottomMenu.css("display") == "none" ){
				bottomMenu.fadeIn(150).css("display","flex");
				calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
			}
		}, 150);

	}).on("mouseleave mouseup", function() {

		clearTimeout(timeoutMenu);

	});

	/* Toggle display / hide menu on: click */

	$(".menu-root").on("click", function(){

		let topMenu = $(this);
		let bottomMenu = topMenu.next(".menu-all");

		if ( bottomMenu.css("display") == "none" ) {
			bottomMenu.fadeIn(150).css("display","flex");
			calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
		}
		else {
			bottomMenu.fadeOut(0);
		}

	});

	/* Hide menu on: mouse leave */

	$(".menu-toggle").on("mouseleave", function(){

		let bottomMenu = $(this).children(".menu-all");

		if ( bottomMenu.css("display") == "flex" ) {
			bottomMenu.fadeOut(0);
		}

	});
	
	/**
	* Unread or Active topics feeds & Displaying search input on Mobile
	*/
	
	$("#mm-topics, #search-box-icon").on("click", function(event){
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
	
	$("#search-box-hide").on("click", function(){
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
		let searchBoxHide = searchButtonTop.siblings("#search-box-hide");
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

			searchBoxHide.fadeIn(500).css("display","flex");

		}, 300);

	}).on("mouseleave mouseup", function() {
		clearTimeout(timeoutSearchBox);
	});
	
	$("#search-box-hide").on("click", function() {

		let searchBoxHide = $(this);
		let searchInputbox = searchBoxHide.next(".inputbox");
		let searchForm = searchBoxHide.closest("#mm-search");

		if ( windowWidth <= searchBreakpoint ) {
			/* animation queue */
			searchInputbox.animate({ width: "0px" }, 500 );
			searchInputbox.animate({ padding: "0" }, 500 );
		}
		else {
			searchInputbox.animate({ width: "0px", padding: "0" }, 500 );
		}

		searchBoxHide.fadeOut(500);

		setTimeout( function() {
			searchForm.css("width", "auto");
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

/**
* Wklejanie dyskografii i składu pół-automat
*/

function bandInfo() {

	let bandInfoInput = document.getElementById('band-info-input');
	let bandInfoOutput = document.getElementById('message');
	  
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
		
		for(let i=0;i<wydawnictwo.length;i++){
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
		str = "";

		for(let i=0;i<muzyk.length;i++){

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
			
			muzycy_koncertowi = muzycy_koncertowi + muzycy_koncertowi_byli + '[/muzycy-live]';
		}

		console.log(muzycy_aktualny_sklad);
		console.log(muzycy_byli);
		console.log(muzycy_koncertowi_aktualni);
		console.log(muzycy_koncertowi_byli);

		str = muzycy_aktualny_sklad + muzycy_byli + muzycy_koncertowi;

		str = str.replace(/Current \(Live\)\n/gmi,'').replace(/Past \(Live\)\n/gmi,'').replace(/Last known \(Live\)\n/gmi,'').replace(/\[muzycy\-byli\]Past\n/gmi,'\n[muzycy-byli]').replace(/\n\[\/muzycy\-byli\]/gmi,'\[\/muzycy\-byli\]');
		
		//ZAMIANA TABOW
		str = str.replace(/\t/gm,' - ');
		
		var strrip = str.search(/\(R.I.P/gm);
		console.log("PRZED RIP1: " + strrip);
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

/* PROGRESS CURSOR HANDLING
* Adds or removes a CSS class to signal that a function is in progress.
*/

function showProgressCursor() {
	/* Add a CSS class to change the cursor or display a loading animation */
	document.body.classList.add('function-in-progress');
}
  
function hideProgressCursor() {
	/* Remove the CSS class to return to the normal cursor */
	document.body.classList.remove('function-in-progress');
}

/* CHECK FOR MA URL IN MESSAGE TEXTAREA
* On DOMContentLoaded, this script looks for a Metal Archives URL within the message textarea and, if found, pre-fills the input field with that URL.
*/

document.addEventListener("DOMContentLoaded", () => {
	"use strict";

	/* Get DOM elements for the band info input and the message textarea */
	const addBandInfoInput = document.getElementById("add-band-info");
	const messageElement = document.getElementById("message");
	if ( !addBandInfoInput || !messageElement ) return;

	/* Retrieve the current message and look for a MA URL pattern */
	const messageValue = messageElement.value ?? "";
	const match = messageValue.match(/^MA: (https:\/\/www\.metal-archives\.com\/bands\/[^/]+\/\d+)/m);
	if ( !match ) return;

	/* Extract the matched URL and set it in the input field */
	const matchValue = match[1];
	console.log("MA: " + matchValue);
	addBandInfoInput.value = matchValue;
	addBandInfoInput.classList.add("has-band-info-link");

});

/* FETCH PAGE VIA CORS PROXY
* Fetches an HTML document using a CORS proxy and parses it into a DOM.
*/

async function fetchPage(url) {
	"use strict";

	/* Request the URL via a CORS proxy. */
	const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
	if ( !response.ok ) {
		/* Throw an error if the response is not OK. */
		throw new Error(`HTTP error! Status: ${response.status}`);
	}
	const text = await response.text();
	/* Parse the HTML text into a document. */
	return new DOMParser().parseFromString(text, "text/html");

}

/* UTILITY: GET TRIMMED CELL VALUES
* Returns an array of trimmed text content from all <td> elements in a given row.
*/

function getTrimmedCellValues(row) {
	/* Use Array.from to convert NodeList of <td> elements to array and map each <td>'s text. */
	return Array.from(row.querySelectorAll("td")).map(td => td.textContent.trim());
}

/* ADD LINEUP
* Fetches and formats band lineup table. Handles both current and past member lists.
*/

let fetchLineup = 0;

async function addLineup(url, output, update) {
	"use strict";

	try {
		/* Record the start time before fetching the lineup page */
		const fetchStart = performance.now();

		/* Fetch the band page content using the CORS proxy */
		const docLineup = await fetchPage(url);

		/* Record the end time and compute the fetch duration */
		const fetchEnd = performance.now();
		fetchLineup = fetchEnd - fetchStart;
		console.log(`Fetch lineup execution time: ${fetchEnd - fetchStart} ms`);

		/* Locate the lineup table within the document */
		const lineupTable = docLineup.querySelector("#band_members table.lineupTable");
		if ( !lineupTable ) {
			console.log("Lineup table not found.");
			return;
		}

		/* Convert the table's HTML to a string for regex processing */
		const lineupTableString = lineupTable.outerHTML;
		const completeLineup = [];
		const lineupRows = lineupTable.querySelectorAll("tr");

		/* Definition of regex patterns for detecting header types and special cases */
		const patterns = {
			current: /<td colspan="2" align="right">\s*Current(?: lineup)?\s*<\/td>/,
			lastKnown: /<td colspan="2" align="right">\s*Last known(?: lineup)?\s*<\/td>/,
			past: /<td colspan="2" align="right">\s*Past\s*<\/td>/,
			currentLive: /<td colspan="2" align="right">\s*Current\s*\(Live\)\s*<\/td>/,
			pastLive: /<td colspan="2" align="right">\s*(?:Past|Last known)\s*\(Live\)\s*<\/td>/,
			seeAlso: /^See also:\s+/,
			rip: /(^\(R\.I\.P\. \d*\)\s+)|(^\(R\.I\.P\.\)\s+)|(\s+\(R\.I\.P\. \d*\)\s*)|(\s+\(R\.I\.P\.\)\s*)/
		};
	
		/* Check which header patterns exist in the lineup table */
		const headerPatternExists = {
			current: patterns.current.test(lineupTableString),
			lastKnown: patterns.lastKnown.test(lineupTableString),
			past: patterns.past.test(lineupTableString),
			currentLive: patterns.currentLive.test(lineupTableString),
			pastLive: patterns.pastLive.test(lineupTableString)
		};

		console.log("Header pattern existence check:", headerPatternExists);

		/* If no "current" or "last known" headers exist, add a default header based on band status */
		if ( !headerPatternExists.current && !headerPatternExists.lastKnown ) {
			if ( docLineup.querySelector("#band_stats .split_up") || docLineup.querySelector("#band_stats .changed_name") ) {
				completeLineup.push("[t]Ostatni skład:[/t]");
			} else {
				completeLineup.push("[t]Skład:[/t]");
			}
		}

		/* Process each row in the lineup table */
		lineupRows.forEach(lineupRow => {

			/* If the row is a header row, update its content based on the detected header type */
			if ( lineupRow.classList.contains("lineupHeaders") ) {

				if ( headerPatternExists.current ) {
				lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.current, "<td>[t]Skład:[/t]</td>");
				} else if ( headerPatternExists.lastKnown ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.lastKnown, "<td>[t]Ostatni skład:[/t]</td>");
				}

				if ( headerPatternExists.past ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.past, "<td>[muzycy-byli]</td>");
				}

				if ( headerPatternExists.past && headerPatternExists.currentLive ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.currentLive, "<td>[/muzycy-byli][muzycy-live]</td>");
				} else if ( headerPatternExists.currentLive ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.currentLive, "<td>[muzycy-live]</td>");
				}

				if ( headerPatternExists.currentLive && headerPatternExists.pastLive ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.pastLive, "<td></td>");
				} else if ( headerPatternExists.past && headerPatternExists.pastLive ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.pastLive, "<td>[/muzycy-byli][muzycy-live]</td>");
				} else if ( headerPatternExists.pastLive ) {
					lineupRow.innerHTML = lineupRow.innerHTML.replace(patterns.pastLive, "<td>[muzycy-live]</td>");
				}

			}

			/* Trim any leading/trailing whitespace from the row's HTML */
			lineupRow.innerHTML = lineupRow.innerHTML.trim();
			/* Extract trimmed text from each cell in the row */
			const lineupCells = getTrimmedCellValues(lineupRow);
			let ripInfo = "";
			/* console.log(lineupCells); */

			/* If the first cell contains R.I.P. information, extract and format it */
			if ( patterns.rip.test(lineupCells[0]) ) {
				const ripDate  = lineupCells[0].match(/\d+/);
				ripInfo = ripDate ? " (R.I.P. " + ripDate[0] + ")" : " (R.I.P.)";
				/* Remove the R.I.P. segment from the cell text */
				lineupCells[0] = lineupCells[0].replace(patterns.rip, "");
				/*console.log("THE PAST IS ALIVE!!! " + ripDate);*/
			}

			/* Format the row based on its type and add it to the complete lineup */
			if ( lineupRow.classList.contains("lineupRow") ) {
				/* Basic lineup row: musician - instrument (start date - end date) (R.I.P. year) */
				completeLineup.push(lineupCells.join(" - ") + ripInfo);
			} else if ( lineupRow.classList.contains("lineupBandsRow") ) {
				/* Additional bands row: append extra information (e.g., [l]past bands[/l]) */
				const otherBands = lineupCells.map(lineupCell => " [l]" + lineupCell.replace(patterns.seeAlso, "") + "[/l]");
				completeLineup.push(completeLineup.pop() + ripInfo + otherBands.join());
			} else {
				/* Fallback: join all cells with default formatting */
				completeLineup.push(lineupCells.join());
			}

		});

		/* Append closing tags for live or past member sections if applicable */
		if ( headerPatternExists.currentLive || headerPatternExists.pastLive ) {
			completeLineup.push(completeLineup.pop() + "\n[/muzycy-live]");
		} else if ( headerPatternExists.past ) {
			completeLineup.push(completeLineup.pop() + "\n[/muzycy-byli]");
		}

		/* Combine all lineup rows into a single formatted string and clean up spacing */
		const completeLineupString = completeLineup.join("\n").replaceAll("\xa0"," ").replace(/\t+/g, "").replace("[muzycy-byli]", "\n[muzycy-byli]").replace(/\n*\[muzycy-live\]/, "\n\n[muzycy-live]");

		/* Regex to detect an existing lineup block in the output message */
		const lineupPatternToUpdate = /\[t\](?:Skład:|Ostatni skład:)\[\/t\](?:(?:[\s\S]*?\[\/muzycy-live\]\n\n)|(?:[\s\S]*?\[\/muzycy-byli\]\n\n)|(?:[\s\S]*?\n\n))/;

		/* If update mode is enabled and an existing lineup block is found, replace it; otherwise, append the new lineup */
		if ( update && output.value.match(lineupPatternToUpdate) ) {
			console.log("Updating lineup...");
			console.log(output.value.match(lineupPatternToUpdate)[0]);
			output.value = output.value.replace(lineupPatternToUpdate, completeLineupString + "\n\n");
		} else {
			output.value += "\n\n" + completeLineupString;
		}

		console.log(completeLineupString);

	} catch (error) {
		/* Log any errors that occur during fetching or processing */
		console.error("Error fetching the page:", error);
	}
}

/* ADD DISCOGRAPHY
* Fetches and formats the band's discography table and updates the output message.
*/

let fetchDiscography = 0;

async function addDiscography(url, output, update) {
	"use strict";

	try {
		/* Build the discography table URL by modifying the base band URL */
		const urlDiscography = url.replace(/\/bands\/.*\//, "/band/discography/id/") + "/tab/all/";
		console.log("Discography URL:", urlDiscography);

		/* Record the start time for fetching the discography */
		const fetchStart = performance.now();

		/* Fetch the discography page via the CORS proxy */
		const docDiscography = await fetchPage(urlDiscography);

		/* Compute and log the fetch duration */
		const fetchEnd = performance.now();
		fetchDiscography = fetchEnd - fetchStart;
		console.log(`Fetch discography execution time: ${fetchEnd - fetchStart} ms`);

		/* Locate the discography table in the document */
		const discographyTable = docDiscography.querySelector(".discog");
		if ( !discographyTable ) {
			console.log("Discography table not found.");
			return;
		} else if ( discographyTable.querySelectorAll("tbody td").length === 1 ) {
			console.log("No discography found.");
			return;
		}

		const completeDiscography = [];
		const discographyRows = discographyTable.querySelectorAll("tbody tr");

		/* Mapping for release types to corresponding BBCode tags */
		const releaseTypeBBCode = {
			"Full-length": "w-album",
			"Demo": "w-demo",
			"EP": "w-norm",
			"Collaboration": "w-norm"
		};

		/* Replacements to clean up specific text patterns in the output */
		const replacements = {
			"[ep]": "[EP]",
			"[live album]": "[live]",
			"[collaboration]": "[kolaboracja]",
			"[compilation]": "[kompilacja]"
		};

		/* Add a header for the discography section */
		completeDiscography.push("[t]Dyskografia:[/t]");

		/* Process each row in the discography table */
		discographyRows.forEach(discographyRow => {

			discographyRow.innerHTML = discographyRow.innerHTML.trim();
			const discographyCells = getTrimmedCellValues(discographyRow);

			/* Extract release details: year, title and type */
			const releaseYear = discographyCells[2];
			const releaseTitle = discographyCells[0];
			const releaseType = discographyCells[1];

			/* Determine the appropriate BBCode tag for the release type */
			const bbcode = releaseTypeBBCode[releaseType] || "w-other";
			/* If not a full-length album, add the release type in lowercase */
			const type = ( bbcode === "w-album" ) ? "" : ` [${releaseType.toLowerCase()}]`

			/* Construct the formatted release string */
			const release = `[${bbcode}]${releaseYear} - ${releaseTitle}${type}[/${bbcode}]`;

			completeDiscography.push(release);

		});

		/* Combine all release strings into a single discography string */
		let completeDiscographyString = completeDiscography.join("\n");
		/* Apply replacements for any legacy formatting issues */
		for ( const [search, replace] of Object.entries(replacements) ) {
			completeDiscographyString = completeDiscographyString.replaceAll(search, replace);
		}

		/* Regex to detect an existing discography block in the output message (*? - so it looks for shortest string match instead of longest) */
		const discographyPatternToUpdate = /\[t\]Dyskografia:\[\/t\][\s\S]*?\n\n/;

		/* If update mode is enabled and a discography block exists, replace it; otherwise, append the new discography */
		if ( update && discographyPatternToUpdate.test(output.value) ) {
			console.log("Updating discography...");
			console.log(output.value.match(discographyPatternToUpdate)[0]);
			output.value = output.value.replace(discographyPatternToUpdate, completeDiscographyString + "\n\n");
		} else {
			output.value += "\n\n" + completeDiscographyString;
		}

		console.log(completeDiscographyString);

	} catch (error) {
		/* Log errors encountered during fetching or processing */
		console.error("Error fetching the page:", error);
	}
}

/* ADD LINK TO METAL ARCHIVES
* Appends a "MA: <url>" line to the message if it's not already present.
*/

function addLinkToMA(url, output) {
	"use strict";

	/* Check if the output already includes this exact MA link; if not, add it */
	if ( !output.value.match("MA: " + url) ) {
		output.value += "\n\nMA: " + url;
	} else {
		console.log("Link to MA is already in the topic.");
	}

}

/* CHECK FOR BANDCAMP LINKS
* Finds Bandcamp album links in the message, converts them to general /music links, and appends them to the message if not already present.
*/

function checkForBandcampLinks(output) {
	"use strict";

	// Get the current message value
	let messageValue = output.value ?? "";
	// Define a regex to capture Bandcamp album links
	const bandcampPattern = /(https:\/\/[^/]+\.bandcamp\.com)\/album\/[^/\s]+/g;

	// Find all Bandcamp album links in the message
	const matches = messageValue.match(bandcampPattern);
	if (!matches) return;

	console.log("BC:", matches);

	// Process each found link
	matches.forEach(match => {
		// Extract the base Bandcamp URL (without /album/...), then form the desired version of the link (/music instead of /album/...), lastly add "BC: " prefix
		const baseUrl = match.replace(bandcampPattern, "$1");
		const finalUrl = baseUrl + "/music";
		const bandcampPage = "BC: " + finalUrl;

		// Regex to find partial versions: e.g., "BC: https://band.bandcamp.com" or with trailing slash
		// Pattern starts (^) with "BC: ", then replace slash with escaped slash for regex, escaped \/? for optional trailing slash at the end of the line ($), "m" flag for ^ and $ in multiline string
		const partialPattern = `^BC: ${baseUrl.replace(/\//g, "\\/")}\\/?$`;
		const partialRegex = new RegExp(partialPattern, "m");

		if ( partialRegex.test(messageValue) ) {
			// If there's a partial version, replace it with the full version
			messageValue = messageValue.replace(partialRegex, bandcampPage);
		} else if ( !messageValue.includes(bandcampPage) ) {
			// Otherwise, if it's not already added, append the new /music link
			messageValue += "\n" + bandcampPage;
		}
	});

	// Write the final updated message back to the output
	output.value = messageValue;
}

/* ADD BAND INFO
* Orchestrates the fetching and updating of band lineup, discography, MA link, and Bandcamp links. Handles URL cleanup, error logging, progress indication, and performance measurement.
*/

async function addBandInfo(update) {
	"use strict";

	/* Record the starting time for performance logging */
	const stoperStart = performance.now();

	/* Get the input field and output message elements */
	const addBandInfoInput = document.getElementById("add-band-info");
	let url = addBandInfoInput.value;
	const output = document.getElementById("message");
	if ( !output ) return;

	/* Validate that the URL matches the expected Metal Archives band URL pattern */
	const metallumPattern = /^https:\/\/www\.metal-archives\.com\/bands\/[^/]+\/\d+/;
	if ( !metallumPattern.test(url) ) {
		console.log("Incorrect link.");
		return;
	}

	/* Check for hash in url (like #tabs) and if there is one, trim it */
	const hashPattern = /#.*$/;
	if ( hashPattern.test(url) ) {
		console.log("Link has hash and is being trimmed.");
		url = url.replace(hashPattern, "");
		addBandInfoInput.value = url;
	}

	/* Show the progress cursor while processing */
	showProgressCursor();

	try {
		/* Call sub-functions to fetch and add or update lineup and discography, and add MA and Bandcamp links then shows refresh button - in correct sequence */
		await addLineup(url, output, update);
		await addDiscography(url, output, update);
		addLinkToMA(url, output);
		checkForBandcampLinks(output);
		addBandInfoInput.classList.add("has-band-info-link");
	} catch (error) {
		/* Log any errors encountered during processing */
		console.error("Error adding band info:", error);
	} finally {
		/* Hide the progress cursor regardless of success or failure */
		hideProgressCursor();
	}

	/* Remove focus from the input field */
	addBandInfoInput.blur();

	/* Record and log the total execution time with and without fetching pages */
	const stoperEnd = performance.now();
	console.log(`Execution time: ${stoperEnd - stoperStart} ms`);
	console.log(`Execution time without fetch times: ${stoperEnd - stoperStart - fetchLineup - fetchDiscography} ms`);

}