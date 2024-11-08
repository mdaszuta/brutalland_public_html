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
	  	console.log('e: ' + JSON.stringify(e));
		console.log('target: ' + e.target);
		console.log("elem.getAttribute('href') " + elem.getAttribute('href'));
        e.preventDefault();
      }
    }
  };

	$(document).ready($.proxy(anchorScrolls, 'init'));
})(window.document, window.history, window.location);

/**
* Nazwa wpisywanego tematu real time, wczytuje do tytułu menu wpisywaną wartość String
*/
	
function show_name_post_real_time(event) {

	var x = event.key;

	document.getElementById("titleID").innerText = document.getElementById("subject").value;

}

$(document).ready(function(){

	"use strict";

	/**
	* Show / Hide menus
	*/

	var timeoutMenu = 0;

	/** Function calculateMenuAllWidthOrMarginLeft calculates and sets values of .menu-all:
	* width: if chosen menu is a .contact-box
	* margin-left: if chosen menu is not a top menu item (.main-menu-item), quick topic tools (.quickmod-box) or tags in viewtopic_body (.tag-box)
	*/

	function calculateMenuAllWidthOrMarginLeft(top, bottom) {

		var marginValue = 0;

		if ( bottom.hasClass("contact-box-all") ) {
			/* for .contact-box, width of .menu-all is based on .postprofile width */
			bottom.css("width", bottom.closest(".postprofile").width());
		}

		if ( !bottom.hasClass("main-menu-bottom") && !bottom.hasClass("quickmod-box-all") && !bottom.hasClass("tag-box-all") ) {
			/* center the bottom part of a menu based on width of it and the width of it's top icon */
			marginValue = -((parseFloat(bottom.css("width")) - parseFloat(top.css("width")))/2);
			bottom.css("margin-left", marginValue);
		}

	}

	/* Display menu on: mouse enter (delay the display by set Timeout)
	* Hide menu on: mouse leave or mouse up
	*/

	$(".menu-devil").on('mouseenter', function() {

		var topMenu = $(this);
		var bottomMenu = topMenu.next(".menu-all");

		timeoutMenu = setTimeout( function() {
			if ( bottomMenu.css("display") == "none" ){
				bottomMenu.fadeIn(150).css("display","flex");
				calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
			}
		}, 150);

	}).on('mouseleave mouseup', function() {

		clearTimeout(timeoutMenu);

	});

	/* Toggle display / hide menu on: click */

	$(".menu-devil").on('click', function(){

		var topMenu = $(this);
		var bottomMenu = topMenu.next(".menu-all");

		if ( bottomMenu.css("display") == "none" ){
			bottomMenu.fadeIn(150).css("display","flex");
			calculateMenuAllWidthOrMarginLeft(topMenu, bottomMenu);
		}
		else {
			bottomMenu.fadeOut(0);
		}

	});

	/* Hide menu on: mouse leave */

	$(".menu-toggle").on('mouseleave', function(){

		var bottomMenu = $(this).children(".menu-all");

		if ( bottomMenu.css("display") == "flex" ){
			bottomMenu.fadeOut(0);
		}

	});
	
	/**
	* Last Post Feed Mobile
	*/
	
	$("#mm-topics, .search-box").on('click', function( event ){

		console.log('hastouch class: ' + $('#phpbb').hasClass('hastouch'));

		var clicks = $(this).data('clicks');

		if ( clicks ) {
			console.log('number of clicks (if) ' + clicks);
		}
		else if(  $('#phpbb').hasClass('hastouch') ) {
			event.preventDefault();
			console.log('number of clicks (else if) ' + clicks);
		}

		$(this).data("clicks", !clicks);

		console.log('clicks: ' + clicks);

	});
	
	/**
	* Search box width show and hide
	*/

	var windowWidth = parseFloat(window.innerWidth);
	var desktopSearchInputboxWidth = "200px";

	/* if viewport resized, do */

	$(window).on( "resize", function() {

		var searchInputbox = $("#search-box-keywords");

		windowWidth = parseFloat(window.innerWidth);

		/** if search input is expanded and viewport was resized, resize it too if needed
		* if vw <= 860px - calculate input width based on viewport width
		* if vw > 860px - width defined as desktopSearchInputboxWidth variable
		*/
		if( searchInputbox.outerWidth() != 0 ) {
			if( windowWidth <= 860 ) {
				var tmpSearchInputboxWidth = $("#mm-search").outerWidth() - parseFloat(searchInputbox.css("margin-left"));
				searchInputbox.css("width", tmpSearchInputboxWidth + "px");
			}
			else {
				searchInputbox.css("width", desktopSearchInputboxWidth);
			}
		}
	} );
	
	var timeoutSearchBox = 0;

	$("#search-box-icon").on('mouseenter click', function() {

		var searchButtonTop = $(this);
		var searchInputbox = searchButtonTop.siblings(".inputbox");
		var searchBoxHide = searchButtonTop.siblings("#search-box-hide");
		var searchForm = searchButtonTop.closest("#mm-search");

		timeoutSearchBox = setTimeout( function() {

			searchForm.css("width", "100%");
			searchInputbox.css("padding","0px 5px");

			/* if vw <= 860, then input + margin-left = whole width of main menu */
			if ( windowWidth <= 860 ) {
				var tmpSearchInputboxWidth = searchForm.width() - parseFloat(searchInputbox.css("margin-left"));
				searchInputbox.focus().animate({ width: tmpSearchInputboxWidth + "px" }, 500 );
			}
			else {
				searchInputbox.focus().animate({ width: desktopSearchInputboxWidth }, 500 );
			}

			searchBoxHide.fadeIn(500).css("display","flex");

		}, 300);

	}).on('mouseleave mouseup', function() {
		clearTimeout(timeoutSearchBox);
	});
	
	$("#search-box-hide").on('click', function() {

		var searchBoxHide = $(this);
		var searchInputbox = searchBoxHide.next(".inputbox");
		var searchForm = searchBoxHide.closest("#mm-search");

		if ( windowWidth <= 860 ) {
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
	
	var timeoutSwitcheroo = 0;

	$(".switcheroo-menu").on('mouseenter click', function() {

		var switcherooDevil = $(this).children(".switcheroo-menu-devil");
		var switcherooAll = $(this).children(".switcheroo-menu-all");

		timeoutSwitcheroo = setTimeout( function() {

			switcherooDevil.fadeOut(0);
			switcherooAll.fadeIn(200).css("display","flex");

		} , 150);

	}).on('mouseleave', function() {

		var switcherooDevil = $(this).children(".switcheroo-menu-devil");
		var switcherooAll = $(this).children(".switcheroo-menu-all");

		switcherooAll.fadeOut(0);
		switcherooDevil.fadeIn(0).css("display","flex");

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