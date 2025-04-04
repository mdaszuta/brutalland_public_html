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

document.addEventListener("DOMContentLoaded", () => {

	"use strict";

	const addBandInfo = document.getElementById("add-band-info");
	const messageElement = document.getElementById("message");
	if ( !addBandInfo || !messageElement ) return;

	console.log("message READY!!!");

	const messageValue = messageElement.value ?? "";
	const match = messageValue.match(/^MA: (https:\/\/www\.metal-archives\.com\/bands\/[^/]+\/\d+)/m);
	if ( !match ) return;

	const matchValue = match[1];
	console.log(matchValue);
	addBandInfo.setAttribute("value", matchValue);

});

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

async function fetchPage(url) {

	"use strict";

    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
    if ( !response.ok ) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
	return new DOMParser().parseFromString(text, "text/html");

}

/* LINEUP */

async function addLineup(url, output) {

	"use strict";

	try {
		/* Fetch the page content using CORS proxy and find the lineup table */
		const docLineup = await fetchPage(url);
		const lineupTable = docLineup.querySelector("#band_members table.lineupTable");

		if ( !lineupTable ) {
			console.log("Lineup table not found.");
			return;
		}

			const lineupTableString = lineupTable.outerHTML;
			/*console.log(lineupTableString);*/

			let completeLineup = [];
			let lineupRows = lineupTable.querySelectorAll("tr");

			/** Check Members list for Current, Last known, Past, Current (live) and Past (live) members, where:
			* i=0 -> Current | Current lineup
			* i=1 -> Last known | Last known lineup
			* i=2 -> Past
			* i=3 -> Current (Live)
			* i=4 -> Past (Live) | Last known (Live)
			*/

			const pattern = [];
			let regexTest = [];

			pattern[0] = /(<td colspan="2" align="right">\s*Current\s*<\/td>|<td colspan="2" align="right">\s*Current lineup\s*<\/td>)/;
			pattern[1] = /(<td colspan="2" align="right">\s*Last known\s*<\/td>|<td colspan="2" align="right">\s*Last known lineup\s*<\/td>)/;
			pattern[2] = /<td colspan="2" align="right">\s*Past\s*<\/td>/;
			pattern[3] = /<td colspan="2" align="right">\s*Current\s*\(Live\)\s*<\/td>/;
			pattern[4] = /(<td colspan="2" align="right">\s*Past\s*\(Live\)\s*<\/td>)|(<td colspan="2" align="right">\s*Last known\s*\(Live\)\s*<\/td>)/;

			for (let i=0; i<pattern.length; i++) {
				regexTest[i] = pattern[i].test(lineupTableString);
			}

			console.log("regexTest: " + regexTest.toString());

			//completeLineup.push("[lineup]");

			if ( !regexTest[0] && !regexTest[1] ) { /* If no lineupHeaders */
				if ( docLineup.querySelector("#band_stats .split_up") || docLineup.querySelector("#band_stats .changed_name") ) {
					completeLineup.push("[t]Ostatni skład:[/t]");
				} else {
					completeLineup.push("[t]Skład:[/t]");
				}
			}

			const seeAlsoPattern = /^See also:\s+/;
			const ripPattern = /(^\(R\.I\.P\. \d*\)\s+)|(^\(R\.I\.P\.\)\s+)|(\s+\(R\.I\.P\. \d*\)\s*)|(\s+\(R\.I\.P\.\)\s*)/;

			lineupRows.forEach(lineupRow => {

				if ( lineupRow.classList.contains("lineupHeaders") ) {

					if ( regexTest[0] ) { /* Current */
					lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[0], "<td>[t]Skład:[/t]</td>");
					} else if ( regexTest[1] ) { /* Last known */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[1], "<td>[t]Ostatni skład:[/t]</td>");
					}

					if ( regexTest[2] ) { /* Past */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[2], "<td>[muzycy-byli]</td>");
					}

					if ( regexTest[2] && regexTest[3] ) { /* Past & Current (Live) */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[3], "<td>[/muzycy-byli]\n\n[muzycy-live]</td>");
					} else if ( regexTest[3] ) { /* Current (Live) */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[3], "<td>[muzycy-live]</td>");
					}

					if ( regexTest[3] && regexTest[4] ) { /* Current (Live) & Past (Live) */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[4], "<td></td>");
					} else if ( regexTest[2] && regexTest[4] ) { /* Past & Past (Live) */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[4], "<td>[/muzycy-byli]\n\n[muzycy-live]</td>");
					} else if ( regexTest[4] ) { /* Past (Live)) */
						lineupRow.innerHTML = lineupRow.innerHTML.replace(pattern[4], "<td>[muzycy-live]</td>");
					}

				}

				lineupRow.innerHTML = lineupRow.innerHTML.trim(); /* Trim spaces around row */
				let lineupCells = Array.from(lineupRow.querySelectorAll("td")).map(td => td.textContent.trim()); /* Trim spaces in <td> */
				let ripInfo = "";
				/* console.log(lineupCells); */

				if ( ripPattern.test(lineupCells[0]) ) {
					let ripDate  = lineupCells[0].match(/\d+/);
					if ( ripDate ) {
						ripInfo = " (R.I.P. " + ripDate[0] + ")";
					} else {
						ripInfo = " (R.I.P.)";
					}
					lineupCells[0] = lineupCells[0].replace(ripPattern, "");
					//console.log("THE PAST IS ALIVE!!! " + ripDate);
				}

				if ( lineupRow.classList.contains("lineupRow") ) {
					let musician = lineupCells.join(" - ");
					completeLineup.push(musician + ripInfo);
				} else if ( lineupRow.classList.contains("lineupBandsRow") ) {
					lineupCells = lineupCells.map(lineupCell => " [l]" + lineupCell.replace(seeAlsoPattern, "") + "[/l]");
					completeLineup.push(completeLineup.pop() + ripInfo + lineupCells.join());
				} else {
					completeLineup.push(lineupCells.join());
				}

			});

			if ( regexTest[3] || regexTest[4] ) { /* If Lineup - (Live) */
				completeLineup.push(completeLineup.pop() + "\n[/muzycy-live]");
			} else if ( regexTest[2] ) { /* If Lineup - Past */
				completeLineup.push(completeLineup.pop() + "\n[/muzycy-byli]");
			}

			//completeLineup.push("[/lineup]");

			let completeLineupString = "\n\n" + completeLineup.join("\n");
			output.value += completeLineupString;
			completeLineupString = completeLineupString.replaceAll("\xa0"," ").replace(/\t+/g, "").replace("[muzycy-byli]", "\n[muzycy-byli]").replace(/\n*\[muzycy-live\]/, "\n\n[muzycy-live]");

			console.log(completeLineupString);

	} catch (error) {
		console.error("Error fetching the page:", error);
	}
}

/* DISCOGRAPHY */

async function addDiscography(url, output) {

	"use strict";

	try {
		/* Create a link to band discography table */
		let urlDiscography = url.replace(/\/bands\/.*\//, "/band/discography/id/") + "/tab/all/";
		console.log(urlDiscography);

		/* Fetch the page content using CORS proxy and find the discography table */
		const docDiscography = await fetchPage(urlDiscography);
		const discographyTable = docDiscography.querySelector(".discog");

		if ( !discographyTable ) {
			console.log("Discography table not found.");
			return;
		} else if ( discographyTable.querySelectorAll("tbody td").length == 1 ) {
			console.log("No discography found.");
			return;
		}

			let completeDiscography = [];
			let discographyRows = discographyTable.querySelectorAll("tbody tr");

			//completeDiscography.push("[discography]");
			completeDiscography.push("[t]Dyskografia:[/t]");

			discographyRows.forEach(discographyRow => {

				discographyRow.innerHTML = discographyRow.innerHTML.trim(); /* Trim spaces around row */
				let discographyCells = Array.from(discographyRow.querySelectorAll("td")).map(td => td.textContent.trim()); /* Trim spaces in <td> */
				let release = "";

				if ( discographyCells[1] == "Full-length" ) {
					release = "[w-album]" + discographyCells[2] + " - " + discographyCells[0] + "[/w-album]";
				} else if ( discographyCells[1] == "Demo" ) {
					release = "[w-demo]" + discographyCells[2] + " - " + discographyCells[0] + " [" + discographyCells[1].toLowerCase() + "]" + "[/w-demo]";
				} else if ( discographyCells[1] == "EP" || discographyCells[1] == "Collaboration" ) {
					release = "[w-norm]" + discographyCells[2] + " - " + discographyCells[0] + " [" + discographyCells[1] + "]" + "[/w-norm]";
				} else {
					release = "[w-other]" + discographyCells[2] + " - " + discographyCells[0] + " [" + discographyCells[1].toLowerCase() + "]" + "[/w-other]";
				}

				completeDiscography.push(release);

			});

			//completeDiscography.push("[/discography]");

			let completeDiscographyString = "\n\n" + completeDiscography.join("\n");
			completeDiscographyString = completeDiscographyString.replaceAll("[live album]", "[live]").replaceAll("[Collaboration]", "[kolaboracja]").replaceAll("[compilation]", "[kompilacja]");
			output.value += completeDiscographyString;
			console.log(completeDiscographyString);

	} catch (error) {
		console.error("Error fetching the page:", error);
	}
}

function addLinkToMA(url, output) {

	"use strict";

	if ( !output.value.match("MA: " + url) ) {
		output.value += "\n\nMA: " + url;
	} else {
		console.log("Link to MA is already in the topic.");
		/*output.value = output.value.replace("\n\nMA: " + url, "");*/
	}

}

async function addBandInfo() {

	"use strict";

	const addBandInfo = document.getElementById("add-band-info");
	let url = addBandInfo.value;
	const output = document.getElementById("message");

	const metallumPattern = /^https:\/\/www\.metal-archives\.com\/bands\/[^/]+\/\d+/;
	if ( metallumPattern.test(url) ) {

		/* Check for hash in url and if there is one, trim it */
		const hashPattern = /#.*$/;
		if ( hashPattern.test(url) ) {
			console.log("Link has hash and is being trimmed.");
			url = url.replace(hashPattern, "");
			addBandInfo.value = url;
		}

		/* Call automatic adding of lineup, discography and link to MA in correct sequence */
		/*addLineup(url, output).then(() => addDiscography(url, output).then(() => addLinkToMA(url, output)));*/
		try {
			await addLineup(url, output);
			await addDiscography(url, output);
			addLinkToMA(url, output);
		} catch (error) {
			console.error("Error adding band info:", error);
		}
		
		addBandInfo.blur();

	} else {
		console.log("Incorrect link.");
	}

}