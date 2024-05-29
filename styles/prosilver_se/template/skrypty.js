function find_username(url){'use strict';popup(url,760,570,'_usersearch');return false;}function popup(url,width,height,name){'use strict';if(!name){name='_popup';}window.open(url.replace(/&amp;/g,'&'),name,'height='+height+',resizable=yes,scrollbars=yes, width='+width);return false;}function pageJump(item){'use strict';var page=parseInt(item.val(),10),perPage=item.attr('data-per-page'),baseUrl=item.attr('data-base-url'),startName=item.attr('data-start-name');if(page!==null&&!isNaN(page)&&page===Math.floor(page)&&page>0){if(baseUrl.indexOf('?')===-1){document.location.href=baseUrl+'?'+startName+'='+((page-1)*perPage);}else{document.location.href=baseUrl.replace(/&amp;/g,'&')+'&'+startName+'='+((page-1)*perPage);}}}function marklist(id,name,state){'use strict';jQuery('#'+id+' input[type=checkbox][name]').each(function(){var $this=jQuery(this);if($this.attr('name').substr(0,name.length)===name){$this.prop('checked',state);}});}function viewableArea(e,itself){'use strict';if(!e){return;}if(!itself){e=e.parentNode;}if(!e.vaHeight){e.vaHeight=e.offsetHeight;e.vaMaxHeight=e.style.maxHeight;e.style.height='auto';e.style.maxHeight='none';e.style.overflow='visible';}else{e.style.height=e.vaHeight+'px';e.style.overflow='auto';e.style.maxHeight=e.vaMaxHeight;e.vaHeight=false;}}jQuery(function($){'use strict';$('.sub-panels').each(function(){var $childNodes=$('a[data-subpanel]',this),panels=$childNodes.map(function(){return this.getAttribute('data-subpanel');}),showPanel=this.getAttribute('data-show-panel');if(panels.length){activateSubPanel(showPanel,panels);$childNodes.click(function(){activateSubPanel(this.getAttribute('data-subpanel'),panels);return false;});}});});function activateSubPanel(p,panels){'use strict';var i,showPanel;if(typeof p==='string'){showPanel=p;}$('input[name="show_panel"]').val(showPanel);if(typeof panels==='undefined'){panels=jQuery('.sub-panels a[data-subpanel]').map(function(){return this.getAttribute('data-subpanel');});}for(i=0;i<panels.length;i++){jQuery('#'+panels[i]).css('display',panels[i]===showPanel?'block':'none');jQuery('#'+panels[i]+'-tab').toggleClass('activetab',panels[i]===showPanel);}}function selectCode(a){'use strict';var e=a.parentNode.parentNode.getElementsByTagName('CODE')[0];var s,r;if(window.getSelection){s=window.getSelection();if(s.setBaseAndExtent){var l=(e.innerText.length>1)?e.innerText.length-1:1;try{s.setBaseAndExtent(e,0,e,l);}catch(error){r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);}}else{if(window.opera&&e.innerHTML.substring(e.innerHTML.length-4)==='<BR>'){e.innerHTML=e.innerHTML+'&nbsp;';}r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);}}else if(document.getSelection){s=document.getSelection();r=document.createRange();r.selectNodeContents(e);s.removeAllRanges();s.addRange(r);}else if(document.selection){r=document.body.createTextRange();r.moveToElementText(e);r.select();}}function play_qt_file(obj){'use strict';var rectangle=obj.GetRectangle();var width,height;if(rectangle){rectangle=rectangle.split(',');var x1=parseInt(rectangle[0],10);var x2=parseInt(rectangle[2],10);var y1=parseInt(rectangle[1],10);var y2=parseInt(rectangle[3],10);width=(x1<0)?(x1*-1)+x2:x2-x1;height=(y1<0)?(y1*-1)+y2:y2-y1;}else{width=200;height=0;}obj.width=width;obj.height=height+16;obj.SetControllerVisible(true);obj.Play();}var inAutocomplete=false;var lastKeyEntered='';function phpbbCheckKey(event){'use strict';if(event.keyCode&&(event.keyCode===40||event.keyCode===38)){inAutocomplete=true;}if(inAutocomplete){if(!lastKeyEntered||lastKeyEntered===event.which){inAutocomplete=false;return true;}}if(event.which!==13){lastKeyEntered=event.which;return true;}return false;}jQuery(function($){'use strict';$('form input[type=text], form input[type=password]').on('keypress',function(e){var defaultButton=$(this).parents('form').find('input[type=submit].default-submit-action');if(!defaultButton||defaultButton.length<=0){return true;}if(phpbbCheckKey(e)){return true;}if((e.which&&e.which===13)||(e.keyCode&&e.keyCode===13)){defaultButton.click();return false;}return true;});});function insertUser(formId,value){'use strict';var $form=jQuery(formId),formName=$form.attr('data-form-name'),fieldName=$form.attr('data-field-name'),item=opener.document.forms[formName][fieldName];if(item.value.length&&item.type==='textarea'){value=item.value+'\n'+value;}item.value=value;}function insert_marked_users(formId,users){'use strict';for(var i=0;i<users.length;i++){if(users[i].checked){insertUser(formId,users[i].value);}}window.close();}function insert_single_user(formId,user){'use strict';insertUser(formId,user);window.close();}function parseDocument($container){'use strict';var test=document.createElement('div'),oldBrowser=(typeof test.style.borderRadius==='undefined'),$body=$('body');$container.find('input[data-reset-on-edit]').on('keyup',function(){$(this.getAttribute('data-reset-on-edit')).val('');});$container.find('.pagination .page-jump-form :button').click(function(){var $input=$(this).siblings('input.inputbox');pageJump($input);});$container.find('.pagination .page-jump-form input.inputbox').on('keypress',function(event){if(event.which===13||event.keyCode===13){event.preventDefault();pageJump($(this));}});$container.find('.pagination .dropdown-trigger').click(function(){var $dropdownContainer=$(this).parent();setTimeout(function(){if($dropdownContainer.hasClass('dropdown-visible')){$dropdownContainer.find('input.inputbox').focus();}},100);});if(oldBrowser){$container.find('ul.linklist.bulletin > li').filter(':first-child, .rightside:last-child').addClass('no-bulletin');}$container.find('.navlinks').each(function(){var $this=$(this),$left=$this.children().not('.rightside'),$right=$this.children('.rightside');if($left.length!==1||!$right.length){return;}function resize(){var width=0,diff=$left.outerWidth(true)-$left.width(),minWidth=Math.max($this.width()/3,240),maxWidth;$right.each(function(){var $this=$(this);if($this.is(':visible')){width+=$this.outerWidth(true);}});maxWidth=$this.width()-width-diff;$left.css('max-width',Math.floor(Math.max(maxWidth,minWidth))+'px');}resize();$(window).resize(resize);});$container.find('.breadcrumbs:not([data-skip-responsive])').each(function(){var $this=$(this),$links=$this.find('.crumb'),length=$links.length,classes=['wrapped-max','wrapped-wide','wrapped-medium','wrapped-small','wrapped-tiny'],classesLength=classes.length,maxHeight=0,lastWidth=false,wrapped=false;$this.find('a').each(function(){var $link=$(this);$link.attr('title',$link.text());});function check(){var height=$this.height(),width;width=parseInt($this.css('max-width'),10);if(!width){width=$body.width();}maxHeight=parseInt($this.css('line-height'),10);$links.each(function(){if($(this).height()>0){maxHeight=Math.max(maxHeight,$(this).outerHeight(true));}});if(height<=maxHeight){if(!wrapped||lastWidth===false||lastWidth>=width){return;}}lastWidth=width;if(wrapped){$this.removeClass('wrapped').find('.crumb.wrapped').removeClass('wrapped '+classes.join(' '));if($this.height()<=maxHeight){return;}}wrapped=true;$this.addClass('wrapped');if($this.height()<=maxHeight){return;}for(var i=0;i<classesLength;i++){for(var j=length-1;j>=0;j--){$links.eq(j).addClass('wrapped '+classes[i]);if($this.height()<=maxHeight){return;}}}}check();$(window).resize(check);});var selector='.linklist:not(.navlinks, [data-skip-responsive]),'+'.postbody .post-buttons:not([data-skip-responsive])';$container.find(selector).each(function(){var $this=$(this),filterSkip='.breadcrumbs, [data-skip-responsive]',filterLast='.edit-icon, .quote-icon, [data-last-responsive]',$linksAll=$this.children(),$linksNotSkip=$linksAll.not(filterSkip),$linksFirst=$linksNotSkip.not(filterLast),$linksLast=$linksNotSkip.filter(filterLast),persistent=$this.attr('id')==='nav-main',html='<li class="responsive-menu hidden"><a href="javascript:void(0);" class="responsive-menu-link">&nbsp;</a><div class="dropdown hidden"><div class="pointer"><div class="pointer-inner" /></div><ul class="dropdown-contents" /></div></li>',slack=3;if(!persistent){if($linksNotSkip.is('.rightside')){$linksNotSkip.filter('.rightside:first').before(html);$this.children('.responsive-menu').addClass('rightside');}else{$this.append(html);}}var $menu=$this.children('.responsive-menu'),$menuContents=$menu.find('.dropdown-contents'),persistentContent=$menuContents.find('li:not(.separator)').length,lastWidth=false,compact=false,responsive1=false,responsive2=false,copied1=false,copied2=false,maxHeight=0;$linksAll.each(function(){if(!$(this).height()){return;}maxHeight=Math.max(maxHeight,$(this).outerHeight(true));});if(maxHeight<1){return;}else{maxHeight=maxHeight+slack;}function check(){var width=$body.width();if(responsive2&&compact&&(width<=lastWidth)){return;}lastWidth=width;if(responsive1||responsive2){$linksNotSkip.removeClass('hidden');$menuContents.children('.clone').addClass('hidden');responsive1=responsive2=false;}if(compact){$this.removeClass('compact');compact=false;}if(persistent&&persistentContent){$menu.removeClass('hidden');}else{$menu.addClass('hidden');}if($this.height()<=maxHeight){return;}if(!compact){$this.addClass('compact');compact=true;}if($this.height()<=maxHeight){return;}if(compact){$this.removeClass('compact');compact=false;}if(!copied1){var $clones1=$linksFirst.clone();$menuContents.prepend($clones1.addClass('clone clone-first').removeClass('leftside rightside'));if($this.hasClass('post-buttons')){$('.button',$menuContents).removeClass('button icon-button');$('.responsive-menu-link',$menu).addClass('button icon-button').prepend('<span></span>');}copied1=true;}if(!responsive1){$linksFirst.addClass('hidden');responsive1=true;$menuContents.children('.clone-first').removeClass('hidden');$menu.removeClass('hidden');}if($this.height()<=maxHeight){return;}if(!compact){$this.addClass('compact');compact=true;}if($this.height()<=maxHeight){return;}if(!$linksLast.length){return;}if(compact){$this.removeClass('compact');compact=false;}if(!copied2){var $clones2=$linksLast.clone();$menuContents.prepend($clones2.addClass('clone clone-last').removeClass('leftside rightside'));copied2=true;}if(!responsive2){$linksLast.addClass('hidden');responsive2=true;$menuContents.children('.clone-last').removeClass('hidden');}if($this.height()<=maxHeight){return;}if(!compact){$this.addClass('compact');compact=true;}}if(!persistent){phpbb.registerDropdown($menu.find('a.responsive-menu-link'),$menu.find('.dropdown'),false);}$linksAll.find('img').each(function(){$(this).load(function(){check();});});check();$(window).resize(check);});if(oldBrowser){return;}$container.find('ul.topiclist dd.mark').siblings('dt').children('.list-inner').addClass('with-mark');$container.find('.topiclist.responsive-show-all > li > dl').each(function(){var $this=$(this),$block=$this.find('dt .responsive-show:last-child'),first=true;if(!$block.length){$this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');$block=$this.find('dt .responsive-show:last-child');}else{first=($.trim($block.text()).length===0);}$this.find('dd').not('.mark').each(function(){var column=$(this),$children=column.children(),html=column.html();if($children.length===1&&$children.text()===column.text()){html=$children.html();}$block.append((first?'':'<br />')+html);first=false;});});$container.find('.topiclist.responsive-show-columns').each(function(){var $list=$(this),headers=[],headersLength=0;$list.prev('.topiclist').find('li.header dd').not('.mark').each(function(){headers.push($(this).text());headersLength++;});if(!headersLength){return;}$list.find('dl').each(function(){var $this=$(this),$block=$this.find('dt .responsive-show:last-child'),first=true;if(!$block.length){$this.find('dt > .list-inner').append('<div class="responsive-show" style="display:none;" />');$block=$this.find('dt .responsive-show:last-child');}else{first=($.trim($block.text()).length===0);}$this.find('dd').not('.mark').each(function(i){var column=$(this),children=column.children(),html=column.html();if(children.length===1&&children.text()===column.text()){html=children.html();}if(i<headersLength){html=headers[i]+': <strong>'+html+'</strong>';}$block.append((first?'':'<br />')+html);first=false;});});});$container.find('table.table1').not('.not-responsive').each(function(){var $this=$(this),$th=$this.find('thead > tr > th'),headers=[],totalHeaders=0,i,headersLength;$th.each(function(column){var cell=$(this),colspan=parseInt(cell.attr('colspan'),10),dfn=cell.attr('data-dfn'),text=dfn?dfn:cell.text();colspan=isNaN(colspan)||colspan<1?1:colspan;for(i=0;i<colspan;i++){headers.push(text);}totalHeaders++;if(dfn&&!column){$this.addClass('show-header');}});headersLength=headers.length;$this.addClass('responsive');if(totalHeaders<2){$this.addClass('show-header');return;}$this.find('tbody > tr').each(function(){var row=$(this),cells=row.children('td'),column=0;if(cells.length===1){row.addClass('big-column');return;}cells.each(function(){var cell=$(this),colspan=parseInt(cell.attr('colspan'),10),text=$.trim(cell.text());if(headersLength<=column){return;}if((text.length&&text!=='-')||cell.children().length){cell.prepend('<dfn style="display: none;">'+headers[column]+'</dfn>');}else{cell.addClass('empty');}colspan=isNaN(colspan)||colspan<1?1:colspan;column+=colspan;});});});$container.find('table.responsive > tbody').not('.responsive-skip-empty').each(function(){var $items=$(this).children('tr');if(!$items.length){$(this).parent('table:first').addClass('responsive-hide');}});$container.find('#tabs, #minitabs').not('[data-skip-responsive]').each(function(){var $this=$(this),$ul=$this.children(),$tabs=$ul.children().not('[data-skip-responsive]'),$links=$tabs.children('a'),$item=$ul.append('<li class="tab responsive-tab" style="display:none;"><a href="javascript:void(0);" class="responsive-tab-link">&nbsp;</a><div class="dropdown tab-dropdown" style="display: none;"><div class="pointer"><div class="pointer-inner" /></div><ul class="dropdown-contents" /></div></li>').find('li.responsive-tab'),$menu=$item.find('.dropdown-contents'),maxHeight=0,lastWidth=false,responsive=false;$links.each(function(){var $this=$(this);maxHeight=Math.max(maxHeight,Math.max($this.outerHeight(true),$this.parent().outerHeight(true)));});function check(){var width=$body.width(),height=$this.height();if(!arguments.length&&(!responsive||width<=lastWidth)&&height<=maxHeight){return;}$tabs.show();$item.hide();lastWidth=width;height=$this.height();if(height<=maxHeight){if($item.hasClass('dropdown-visible')){phpbb.toggleDropdown.call($item.find('a.responsive-tab-link').get(0));}return;}responsive=true;$item.show();$menu.html('');var $availableTabs=$tabs.filter(':not(.activetab, .responsive-tab)'),total=$availableTabs.length,i,$tab;for(i=total-1;i>=0;i--){$tab=$availableTabs.eq(i);$menu.prepend($tab.clone(true).removeClass('tab'));$tab.hide();if($this.height()<=maxHeight){$menu.find('a').click(function(){check(true);});return;}}$menu.find('a').click(function(){check(true);});}var $tabLink=$item.find('a.responsive-tab-link');phpbb.registerDropdown($tabLink,$item.find('.dropdown'),{visibleClass:'activetab'});check(true);$(window).resize(check);});$container.find('#navigation').each(function(){var $items=$(this).children('ol, ul').children('li');if($items.length===1){$(this).addClass('responsive-hide');}});$container.find('[data-responsive-text]').each(function(){var $this=$(this),fullText=$this.text(),responsiveText=$this.attr('data-responsive-text'),responsive=false;function check(){if($(window).width()>700){if(!responsive){return;}$this.text(fullText);responsive=false;return;}if(responsive){return;}$this.text(responsiveText);responsive=true;}check();$(window).resize(check);});}jQuery(function($){'use strict';$('#phpbb.nojs').toggleClass('nojs hasjs');$('#phpbb').toggleClass('hastouch',phpbb.isTouch);$('#phpbb.hastouch').removeClass('notouch');$('form[data-focus]:first').each(function(){$('#'+this.getAttribute('data-focus')).focus();});parseDocument($('body'));});(function($){'use strict';phpbb.addAjaxCallback('mark_forums_read',function(res){var readTitle=res.NO_UNREAD_POSTS;var unreadTitle=res.UNREAD_POSTS;var iconsArray={forum_unread:'forum_read',forum_unread_subforum:'forum_read_subforum',forum_unread_locked:'forum_read_locked'};$('li.row').find('dl[class*="forum_unread"]').each(function(){var $this=$(this);$.each(iconsArray,function(unreadClass,readClass){if($this.hasClass(unreadClass)){$this.removeClass(unreadClass).addClass(readClass);}});$this.children('dt[title="'+unreadTitle+'"]').attr('title',readTitle);});$('a.subforum[class*="unread"]').removeClass('unread').addClass('read');if($('#active_topics').length){phpbb.ajaxCallbacks.mark_topics_read.call(this,res,false);}$('[data-ajax="mark_forums_read"]').attr('href',res.U_MARK_FORUMS);phpbb.closeDarkenWrapper(3000);});phpbb.addAjaxCallback('mark_topics_read',function(res,updateTopicLinks){var readTitle=res.NO_UNREAD_POSTS;var unreadTitle=res.UNREAD_POSTS;var iconsArray={global_unread:'global_read',announce_unread:'announce_read',sticky_unread:'sticky_read',topic_unread:'topic_read'};var iconsState=['','_hot','_hot_mine','_locked','_locked_mine','_mine'];var unreadClassSelectors;var classMap={};var classNames=[];if(typeof updateTopicLinks==='undefined'){updateTopicLinks=true;}$.each(iconsArray,function(unreadClass,readClass){$.each(iconsState,function(key,value){if((value==='_hot'||value==='_hot_mine')&&unreadClass!=='topic_unread'){return true;}classMap[unreadClass+value]=readClass+value;classNames.push(unreadClass+value);});});unreadClassSelectors='.'+classNames.join(',.');$('li.row').find(unreadClassSelectors).each(function(){var $this=$(this);$.each(classMap,function(unreadClass,readClass){if($this.hasClass(unreadClass)){$this.removeClass(unreadClass).addClass(readClass);}});$this.children('dt[title="'+unreadTitle+'"]').attr('title',readTitle);});$('a').has('span.icon_topic_newest').remove();if(updateTopicLinks){$('[data-ajax="mark_topics_read"]').attr('href',res.U_MARK_TOPICS);}phpbb.closeDarkenWrapper(3000);});phpbb.addAjaxCallback('notification.mark_all_read',function(res){if(typeof res.success!=='undefined'){phpbb.markNotifications($('#notification_list li.bg2'),0);phpbb.closeDarkenWrapper(3000);}});phpbb.addAjaxCallback('notification.mark_read',function(res){if(typeof res.success!=='undefined'){var unreadCount=Number($('#notification_list_button strong').html())-1;phpbb.markNotifications($(this).parent('li.bg2'),unreadCount);}});phpbb.markNotifications=function($popup,unreadCount){$popup.removeClass('bg2');$popup.find('a.mark_read').remove();$popup.each(function(){var link=$(this).find('a');link.attr('href',link.attr('data-real-url'));});$('strong','#notification_list_button').html(unreadCount);if(!unreadCount){$('#mark_all_notifications').remove();}var $title=$('title');var originalTitle=$title.text().replace(/(\((\d+)\))/,'');$title.text((unreadCount?'('+unreadCount+')':'')+originalTitle);};phpbb.addAjaxCallback('post_delete',function(){var $this=$(this),postId;if($this.attr('data-refresh')===undefined){postId=$this[0].href.split('&p=')[1];var post=$this.parents('#p'+postId).css('pointer-events','none');if(post.hasClass('bg1')||post.hasClass('bg2')){var posts1=post.nextAll('.bg1');post.nextAll('.bg2').removeClass('bg2').addClass('bg1');posts1.removeClass('bg1').addClass('bg2');}post.fadeOut(function(){$(this).remove();});}});phpbb.addAjaxCallback('post_visibility',function(res){var remove=(res.visible)?$(this):$(this).parents('.post');$(remove).css('pointer-events','none').fadeOut(function(){$(this).remove();});if(res.visible){remove.parents('.post').find('.post_deleted_msg').css('pointer-events','none').fadeOut(function(){$(this).remove();});}});phpbb.addAjaxCallback('row_delete',function(){$(this).parents('tr').remove();});phpbb.addAjaxCallback('zebra',function(res){var zebra;if(res.success){zebra=$('.zebra');zebra.first().html(res.MESSAGE_TEXT);zebra.not(':first').html('&nbsp;').prev().html('&nbsp;');}});phpbb.addAjaxCallback('vote_poll',function(res){if(typeof res.success!=='undefined'){var poll=$('.topic_poll');var panel=poll.find('.panel');var resultsVisible=poll.find('dl:first-child .resultbar').is(':visible');var mostVotes=0;var updatePanelHeight=function(height){height=(typeof height==='undefined')?panel.find('.inner').outerHeight():height;panel.css('min-height',height);};updatePanelHeight();if(!resultsVisible){poll.find('.poll_view_results').hide(500);}if(!res.can_vote){poll.find('.polls, .poll_max_votes, .poll_vote, .poll_option_select').fadeOut(500,function(){poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show();});}else{poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);}poll.find('[data-poll-option-id]').each(function(){var option=$(this);var optionId=option.attr('data-poll-option-id');mostVotes=(res.vote_counts[optionId]>=mostVotes)?res.vote_counts[optionId]:mostVotes;});poll.find('.poll_total_vote_cnt').html(res.total_votes);poll.find('[data-poll-option-id]').each(function(){var $this=$(this);var optionId=$this.attr('data-poll-option-id');var voted=(typeof res.user_votes[optionId]!=='undefined');var mostVoted=(res.vote_counts[optionId]===mostVotes);var percent=(!res.total_votes)?0:Math.round((res.vote_counts[optionId]/res.total_votes)*100);var percentRel=(mostVotes===0)?0:Math.round((res.vote_counts[optionId]/mostVotes)*100);var altText;altText=$this.attr('data-alt-text');if(voted){$this.attr('title',$.trim(altText));}else{$this.attr('title','');};$this.toggleClass('voted',voted);$this.toggleClass('most-votes',mostVoted);var bar=$this.find('.resultbar div');var barTimeLapse=(res.can_vote)?500:1500;var newBarClass=(percent===100)?'pollbar5':'pollbar'+(Math.floor(percent/20)+1);setTimeout(function(){bar.animate({width:percentRel+'%'},500).removeClass('pollbar1 pollbar2 pollbar3 pollbar4 pollbar5').addClass(newBarClass).html(res.vote_counts[optionId]);var percentText=percent?percent+'%':res.NO_VOTES;$this.find('.poll_option_percent').html(percentText);},barTimeLapse);});if(!res.can_vote){poll.find('.polls').delay(400).fadeIn(500);}var confirmationDelay=(res.can_vote)?300:900;poll.find('.vote-submitted').delay(confirmationDelay).slideDown(200,function(){if(resultsVisible){updatePanelHeight();}$(this).delay(5000).fadeOut(500,function(){resizePanel(300);});});setTimeout(function(){resizePanel(500);},1500);var resizePanel=function(time){var panelHeight=panel.height();var innerHeight=panel.find('.inner').outerHeight();if(panelHeight!==innerHeight){panel.css({minHeight:'',height:panelHeight}).animate({height:innerHeight},time,function(){panel.css({minHeight:innerHeight,height:''});});}};}});$('.poll_view_results a').click(function(e){e.preventDefault();var $poll=$(this).parents('.topic_poll');$poll.find('.resultbar, .poll_option_percent, .poll_total_votes').show(500);$poll.find('.poll_view_results').hide(500);});$('[data-ajax]').each(function(){var $this=$(this);var ajax=$this.attr('data-ajax');var filter=$this.attr('data-filter');if(ajax!=='false'){var fn=(ajax!=='true')?ajax:null;filter=(filter!==undefined)?phpbb.getFunctionByName(filter):null;phpbb.ajaxify({selector:this,refresh:$this.attr('data-refresh')!==undefined,filter:filter,callback:fn});}});$('#qr_full_editor').click(function(){$('#qr_postform').attr('action',function(i,val){return val+'#preview';});});$('.display_post').click(function(e){e.preventDefault();var postId=$(this).attr('data-post-id');$('#post_content'+postId).show();$('#profile'+postId).show();$('#post_hidden'+postId).hide();});$('#member_search').click(function(){var $memberlistSearch=$('#memberlist_search');$memberlistSearch.slideToggle('fast');phpbb.ajaxCallbacks.alt_text.call(this);if($memberlistSearch.is(':visible')){$('#username').focus();}return false;});$(function(){var $textarea=$('textarea:not(#message-box textarea, .no-auto-resize)');phpbb.resizeTextArea($textarea,{minHeight:75,maxHeight:250});phpbb.resizeTextArea($('textarea','#message-box'));});})(jQuery);$(document).ready(function(){(function($){'use strict';$.fn.getCollapsible=function(){return this.closest('.forabg').find('.topiclist.forums, .collapsible').eq(0);};$('a.collapse-btn').each(function(){var $this=$(this),hidden=$this.attr('data-hidden'),$content=$this.getCollapsible();if(!$content.length){return;}$this.show();if(hidden){$content.hide();}});phpbb.addAjaxCallback('phpbb_collapse',function(res){if(res.success){$(this).toggleClass('collapse-show collapse-hide').getCollapsible().stop(true,true).slideToggle('fast');}});})(jQuery);});$(".icon-search-self, .icon-search-new, .icon-search-unread, .icon-search-unanswered, .icon-search-active, .icon-search").remove();$(".icon-search-active, .icon-search").next().remove();jQuery(function($){$.each(['mark_forums_read','mark_topics_read'],function(i,cbName){var cbPhpbb=phpbb.ajaxCallbacks[cbName];phpbb.addAjaxCallback(cbName,function(res){cbPhpbb(res);$.ajax({url:markpostunread.updateSearchUnreadAction,type:'GET',cache:false}).success(function(ajaxData){if(ajaxData.search_unread){var $item=$('li a[href$="search_id=unreadposts"]');var $span=$item.find('span');($span.length?$span:$item).text(ajaxData.search_unread);}});});});});var requestRunning=!1,bbwizard;!function(e){"use strict";e.fn.bbvideo=function(t){function i(t,i,r){e.getJSON(i+"&callback=?",function(e){a(t,m(e.html,r))})}function r(t,i,r,o,l){if(i.match(r)){var c="yqlOembed"===l?"json":"html",d="yqlOembed"===l?'itemPath="/"':'xpath="//meta" and compat="html5"';e.ajax({url:"//query.yahooapis.com/v1/public/yql",dataType:"jsonp",data:{q:"select * from "+c+' where url="'+i+'" and '+d,format:"json",env:"store://datatables.org/alltableswithkeys",callback:"?"},success:function(i){var r="";if(null!==i.query.results)if("yqlOembed"===l)r=m(i.query.results.json.html,o);else{for(var c={},d=0,s=i.query.results.meta.length;d<s;d++){var h=i.query.results.meta[d].name||i.query.results.meta[d].property||null;null!==h&&(c[h]=i.query.results.meta[d].content)}var w=c["og:video"]||c["og:video:url"];w&&(r=e("<embed />").attr("src",w.replace("https:","")).attr("type",c["og:video:type"]||"application/x-shockwave-flash").attr("width",o.width||c["og:video:width"]).attr("height",o.height||c["og:video:height"]).attr("allowfullscreen","true").attr("autostart","false"))}a(t,r)}})}}function o(e,t,i){return'<object width="'+i.width+'" height="'+i.height+'" type="application/x-shockwave-flash" data="'+e+'"><param name="movie" value="'+e+'" />'+(void 0!==t?'<param name="flashvars" value="'+t.replace(/&/g,"&amp;").replace(/\{WIDTH}/g,i.width).replace(/\{HEIGHT}/g,i.height)+'" />':"")+'<param name="quality" value="high" /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="pluginspage" value="http://www.macromedia.com/go/getflashplayer" /><param name="autoplay" value="false" /><param name="autostart" value="false" /><param name="wmode" value="transparent" /></object>'}function a(e,t){e.attr("href")!==t&&e.after(t).wrap("<div />")}function m(e,t){return/width=["']/.test(e)===!1?e.replace(/(\/?>)/,' width="'+t.width+'" height="'+t.height+'"$1'):e.replace(/width=(['"])[0-9]{1,4}\1/gi,'width="'+t.width+'"').replace(/height=(['"])[0-9]{1,4}\1/gi,'height="'+t.height+'"')}var l=e.extend({width:560,height:315},t),c=[{site:"5min.com",type:"flash",regex:/http:\/\/(?:.*)?5min.com\/Video\/(?:.*)-([0-9]+)/i,embed:["http://embed.5min.com/$1/"]},{site:"allocine.fr",regex:/http:\/\/www.allocine.fr\/video\/player_gen_cmedia=(\d+)?([^[]*)?/i,embed:'<iframe src="http://www.allocine.fr/_video/iblogvision.aspx?cmedia=$1" style="width:{WIDTH}px; height:{HEIGHT}px" frameborder="0"></iframe>'},{site:"on.aol.com",type:"yqlOgp",regex:/http:\/\/on.aol.com\/video\/(?:.*)-([0-9]+)/i},{site:"break.com",regex:/http:\/\/(.*?)break.com\/([^[]*)?-([0-9]+)?([^[]*)?/i,embed:'<iframe src="http://www.break.com/embed/$3?embed=1" width="{WIDTH}" height="{HEIGHT}" webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder="0"></iframe>'},{site:"clipfish.de",type:"flash",regex:/http:\/\/www.clipfish.de\/(.*\/)?video\/([0-9]+)([^[]*)?/i,embed:["http://www.clipfish.de/cfng/flash/clipfish_player_3.swf?as=0&amp;vid=$2"]},{site:"clipmoon.com",type:"flash",regex:/http:\/\/www.clipmoon.com\/(.*?)\/(([0-9A-Za-z-_]+)([0-9A-Za-z-_]{2}))\/([^[]*)/i,embed:["http://www.clipmoon.com/flvplayer.swf?config=http://www.clipmoon.com/flvplayer.php?viewkey=$2&amp;external=yes&amp;vimg=http://www.clipmoon.com/thumb/$3.jpg"]},{site:"cnbc.com",regex:/http:\/\/.*\.cnbc.com\/[^?]+\?video=(\d+)?([^[]+)?/i,embed:'<iframe src="http://player.theplatform.com/p/gZWlPC/vcps_inline?byGuid=$1&size={WIDTH}_{HEIGHT}" width="{WIDTH}" height="{HEIGHT}" type="application/x-shockwave-flash" allowFullScreen="true"></iframe>'},{site:"cnet.com",regex:/http:\/\/([\w]+\.)?cnet\.com\/(videos\/)?([^(\.|\/)]*)([^[]*)?/i,embed:'<iframe src="http://www.cnet.com/videos/share/$3/" width="{WIDTH}" height="{HEIGHT}" frameborder="0" seamless="seamless" allowfullscreen></iframe>'},{site:"colbertnation.com",regex:/http:\/\/(?:.*?)colbertnation.com\/the-colbert-report-videos\/([0-9]+)\/([^[]*)?/i,embed:'<iframe src="http://media.mtvnservices.com/embed/mgid:cms:video:colbertnation.com:$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"collegehumor.com",regex:/http:\/\/www.collegehumor.com\/video\/([0-9]+)\/([^[]*)/i,embed:'<iframe src="http://www.collegehumor.com/e/$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0" webkitAllowFullScreen allowFullScreen></iframe>'},{site:"comedycentral.com",type:"yqlOgp",regex:/http:\/\/(?:.*?)comedycentral.com\/video-clips\/([^[]*)?/i},{site:"crackle.com",type:"flash",regex:/http:\/\/((.*?)?)crackle.com\/(.*?)\/(.*?)\/(.*?)\/([0-9]+)?([^[]*)?/i,embed:["http://www.crackle.com/p/$4/$5.swf","id=$6&amp;mu=0&amp;ap=0"]},{site:"dailymotion.com",regex:/https?:\/\/(?:.*?)dailymotion.com(?:.*?)\/video\/(([^[_]*)?([^[]*)?)?/i,embed:'<iframe frameborder="0" width="{WIDTH}" height="{HEIGHT}" src="//www.dailymotion.com/embed/video/$2"></iframe>'},{site:"dotsub.com",regex:/http:\/\/dotsub.com\/view\/(.*)/i,embed:'<iframe src="http://dotsub.com/media/$1/embed/" frameborder="0" width="{WIDTH}" height="{HEIGHT}"></iframe>'},{site:"ebaumsworld.com",regex:/http:\/\/(.*?)ebaumsworld.com\/video\/watch\/(.*?)\//i,embed:'<iframe src="http://www.ebaumsworld.com/media/embed/$2" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"facebook.com",regex:/https?:\/\/www.facebook.com\/(?:.*)(?:(?:video|photo).php\?v=|(?:videos|photos)\/)([0-9A-Za-z-_]+)(?:[^[]*)?/i,embed:'<iframe src="https://www.facebook.com/video/embed?video_id=$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"flickr.com",type:"oembed",regex:/https?:\/\/((.*?)?)flickr.com\/(.*?)\/(.*?)\/([0-9]+)([^[]*)?/i,embed:"//flickr.com/services/oembed/?url=$&&format=json&jsoncallback=?"},{site:"funnyordie.com",regex:/http:\/\/(?:.*?)funnyordie.com\/(.*?)\/(.*?)\/(?:[^[]*)?/i,embed:'<iframe src="http://www.funnyordie.com/embed/$2" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"g4tv.com",type:"flash",regex:/http:\/\/(?:www\.)?g4tv.com\/(.*?videos)\/([0-9]+)\/([^[]*)?/i,embed:["http://www.g4tv.com/lv3/$2"]},{site:"gameprotv.com",type:"flash",regex:/http:\/\/www.gameprotv.com\/(.*)-video-([0-9]+)?.([^[]*)?/i,embed:["http://www.gameprotv.com/player-viral.swf","file=http%3A%2F%2Fvideos.gameprotv.com%2Fvideos%2F$2.flv&amp;linktarget=_self&amp;image=http%3A%2F%2Fvideos.gameprotv.com%2Fvideos%2F$2.jpg&amp;plugins=adtonomy,viral-1"]},{site:"gamespot.com",regex:/http:\/\/www.gamespot.com\/videos\/.*\/\d+\-(\d+)\/([^[]*)?/i,embed:'<iframe src="http://www.gamespot.com/videos/embed/$1/" width="{WIDTH}" height="{HEIGHT}" scrolling="no" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'},{site:"howcast.com",type:"flash",regex:/http:\/\/(.*?)howcast.com\/videos\/([0-9]+)?-([^[]*)?/i,embed:["http://www.howcast.com/flash/howcast_player.swf?file=$2"]},{site:"hulu.com",type:"oembed",regex:/https?:\/\/(.*?)hulu.com\/([^[]*)?/i,embed:"//www.hulu.com/api/oembed?url=$&&format=json"},{site:"ign.com",regex:/http:\/\/(.*?)ign\.com\/videos\/([0-9]+)\/([0-9]+)\/([0-9]+)\/([^?]*)?([^[]*)?/i,embed:'<iframe src="http://widgets.ign.com/video/embed/content.html?url=$&" width="{WIDTH}" height="{HEIGHT}" scrolling="no" frameborder="0" allowfullscreen></iframe>'},{site:"instagram.com",regex:/https?:\/\/.*?instagram.com\/p\/(.*)\/([^[]*)?/i,embed:'<iframe src="//instagram.com/p/$1/embed/" width="612" height="710" frameborder="0" scrolling="no" allowtransparency="true"></iframe>'},{site:"kickstarter.com",regex:/https?:\/\/.*?kickstarter.com\/projects\/(.*)\/([^[]*)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="https://www.kickstarter.com/projects/$1/$2/widget/video.html" frameborder="0" scrolling="no"></iframe>'},{site:"liveleak.com",regex:/http:\/\/www.liveleak.com\/view\?i=([0-9A-Za-z-_]+)?(&[^\/]+)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://www.liveleak.com/ll_embed?f=$1" frameborder="0" allowfullscreen></iframe>'},{site:"maker.tv",regex:/http:\/\/(.*?)maker.tv\/([^[]*)?video\/([^\/]+)?\/([^[]*)?/i,embed:'<iframe src="http://makerplayer.com/embed/maker/$3" width="{WIDTH}" height="{HEIGHT}" frameborder="0" allowfullscreen seamless scrolling="no"></iframe>'},{site:"metacafe.com",regex:/http:\/\/www.metacafe.com\/watch\/([0-9]+)?((\/[^\/]+)\/?)?/i,embed:'<iframe src="http://www.metacafe.com/embed/$1/" width="{WIDTH}" height="{HEIGHT}" allowFullScreen frameborder=0></iframe>'},{site:"moddb.com",type:"yqlOgp",regex:/http:\/\/www.moddb.com\/([^[]*)?/i},{site:"mpora.com",regex:/http:\/\/(?:.*?)mpora.com\/(?:.*?)\/([^\/]+)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://mpora.com/videos/$1/embed" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'},{site:"msnbc.msn.com",type:"flash",regex:/http:\/\/www.msnbc.msn.com\/id\/(\d+)?\/vp\/(\d+)?#(\d+)?([^[]*)?/i,embed:["http://www.msnbc.msn.com/id/32545640","launch=$3&amp;width={WIDTH}&amp;height={HEIGHT}"]},{site:"myspace.com",regex:/https?:\/\/(www.)?myspace.com\/.*\/video\/(.*)\/([0-9]+)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="//media.myspace.com/play/video/$2-$3-$3" frameborder="0" allowtransparency="true" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'},{site:"myvideo.de",regex:/http:\/\/(.*?).myvideo.(.*?)\/(.*?)\/([^[]*)?/i,embed:'<iframe src="http://$1.myvideo.$2/embed/$4" style="width:{WIDTH}px;height:{HEIGHT}px;border:0 none;padding:0;margin:0;" width="{WIDTH}" height="{HEIGHT}" frameborder="0" scrolling="no"></iframe>'},{site:"nbcnews.com",type:"flash",regex:/http:\/\/www.nbcnews.com\/video\/.+?\/(\d+)\/#?(\d+)?/i,embed:["http://www.msnbc.msn.com/id/32545640","launch=$1&amp;width={WIDTH}&amp;height={HEIGHT}"]},{site:"photobucket.com",type:"flash",regex:/http:\/\/[a-z](.*?).photobucket.com\/(albums\/[^[]*\/([0-9A-Za-z-_ ]*)?)?([^[]*=)+?([^[]*)?/i,embed:["http://static.photobucket.com/player.swf?file=http://vid$1.photobucket.com/$2$5"]},{site:"revision3.com",type:"yqlOembed",regex:/http:\/\/(.*revision3\.com\/.*)/i,embed:"http://revision3.com/api/oembed/?url=$&&format=json"},{site:"rutube.ru",type:"yqlOembed",regex:/http:\/\/rutube.ru\/(.*?)\/([^[]*)?/i,embed:"http://rutube.ru/api/oembed/?url=$&&format=json"},{site:"sapo.pt",regex:/http:\/\/(.*?)sapo.pt\/(.*\/)?([^[]*)?/i,embed:'<iframe src="http://videos.sapo.pt/playhtml?file=http://rd3.videos.sapo.pt/$3/mov/1" frameborder="0" scrolling="no" width="{WIDTH}" height="{HEIGHT}"></iframe>'},{site:"screenr.com",regex:/http:\/\/(?:.*?)\.screenr.com\/([^[]*)?/i,embed:'<iframe src="http://www.screenr.com/embed/$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"scribd.com",regex:/https?:\/\/(?:www\.)?scribd\.com\/(mobile\/documents|doc)\/(.*?)\/([^[]*)?/i,embed:'<iframe class="scribd_iframe_embed" src="//www.scribd.com/embeds/$2/content?start_page=1&view_mode=scroll" data-auto-height="false" data-aspect-ratio="undefined" scrolling="no" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"slideshare.net",type:"oembed",regex:/https?:\/\/www.slideshare.net\/(.*?)\/([^[]*)?/i,embed:"//www.slideshare.net/api/oembed/2?url=$&&format=json"},{site:"snotr.com",regex:/http:\/\/(?:.*?)snotr.com\/video\/([0-9]+)\/.*/i,embed:'<iframe src="http://www.snotr.com/embed/$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0"></iframe>'},{site:"spike.com",type:"yqlOgp",regex:/http:\/\/www.spike.com\/([^[]*)?/i},{site:"streetfire.net",type:"yqlOgp",regex:/http:\/\/(.*?)streetfire.net\/video\/([^[]*)?/i},{site:"ted.com",regex:/https?:\/\/.*?ted.com\/talks\/([a-zA-Z0-9-_]+).html/i,embed:'<iframe src="//embed.ted.com/talks/$1.html" width="{WIDTH}" height="{HEIGHT}" frameborder="0" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'},{site:"testtube.com",type:"yqlOembed",regex:/http:\/\/(.*testtube\.com\/.*)/i,embed:"http://testtube.com/api/oembed/?url=$&&format=json"},{site:"thedailyshow.cc.com",type:"yqlOgp",regex:/http:\/\/(?:.*?)thedailyshow.cc.com\/videos\/([^[]*)?/i},{site:"theonion.com",regex:/http:\/\/((.*?)?)theonion.com\/([^,]+),([0-9]+)([^[]*)?/i,embed:'<iframe frameborder="no" width="{WIDTH}" height="{HEIGHT}" scrolling="no" src="http://www.theonion.com/video_embed/?id=$4"></iframe>'},{site:"tu.tv",type:"yqlOembed",regex:/http:\/\/(.*?)tu.tv\/videos\/([^[]*)?/i,embed:"http://tu.tv/oembed/?url=$&&format=json"},{site:"tudou.com",regex:/http:\/\/.*?tudou.com\/programs\/view\/(.+)\//i,embed:'<iframe src="http://www.tudou.com/programs/view/html5embed.action?code=$1&resourceId=0_06_05_99" allowtransparency="true" scrolling="no" frameborder="0" style="width:{WIDTH}px;height:{HEIGHT}px;"></iframe>'},{site:"twitch.tv",regex:/http:\/\/(.*?)twitch.tv\/([^[]*)?/i,embed:'<iframe src="http://www.twitch.tv/$2/embed" frameborder="0" scrolling="no" height="{HEIGHT}" width="{WIDTH}"></iframe>'},{site:"ustream.tv",regex:/http:\/\/(?:www\.)ustream\.tv\/(?:channel\/([0-9]{1,8}))/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://www.ustream.tv/embed/$1" scrolling="no" frameborder="0" style="border: 0 none transparent;"></iframe>'},{site:"vbox7.com",regex:/http:\/\/(?:.*?)vbox7.com\/play:([^[]+)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://vbox7.com/emb/external.php?vid=$1" frameborder="0" allowfullscreen></iframe>'},{site:"veoh.com",type:"flash",regex:/http:\/\/(.*?).veoh.com\/([0-9A-Za-z-_\/]+)?\/([0-9A-Za-z-_]+)/i,embed:["http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1361&amp;permalinkId=$3&amp;player=videodetailsembedded&amp;videoAutoPlay=0&amp;id=anonymous"]},{site:"vevo.com",regex:/http:\/\/(?:www\.)?vevo\.com\/watch\/([^?]*)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://cache.vevo.com/m/html/embed.html?video=$1" frameborder="0" allowfullscreen></iframe>'},{site:"viddler.com",regex:/http:\/\/(?:.*?).viddler.com\/v\/([0-9A-Za-z-_]+)([^[]*)?/i,embed:'<iframe id="viddler-$1" src="//www.viddler.com/embed/$1/?f=1&autoplay=0&player=full&loop=false&nologo=false&hd=false" width="{WIDTH}" height="{HEIGHT}" frameborder="0" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>'},{site:"videogamer.com",type:"yqlOgp",regex:/http:\/\/www.videogamer.com\/([^[]*)?/i},{site:"vimeo.com",regex:/https?:\/\/(?:.*?)vimeo.com(?:\/groups\/(?:.*)\/videos\/|\/)([^[]*)?/i,embed:'<iframe src="//player.vimeo.com/video/$1" width="{WIDTH}" height="{HEIGHT}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'},{site:"vine.co",regex:/https:\/\/vine\.co\/v\/([a-zA-Z0-9]{1,13})/i,embed:'<iframe class="vine-embed" src="https://vine.co/v/$1/embed/simple" width="480" height="480" frameborder="0"></iframe>'},{site:"screen.yahoo.com",regex:/http:\/\/screen.yahoo.com\/((([^-]+)?-)*)([0-9]+).html/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" scrolling="no" frameborder="0" src="$&?format=embed&player_autoplay=false"></iframe>'},{site:"youku.com",regex:/http:\/\/v.youku.com\/v_show\/id_(.*)\.html.*/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="http://player.youku.com/embed/$1" frameborder=0 allowfullscreen></iframe>'},{site:"youtu.be",regex:/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)([^[]*)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="//www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>'},{site:"youtube.com",regex:/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)([^[]*)?/i,embed:'<iframe width="{WIDTH}" height="{HEIGHT}" src="//www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>'}];return this.each(function(){var t=e(this),m=t.attr("href"),d={width:l.width,height:l.height};void 0!==t.data("bbvideo")&&t.data("bbvideo").length&&(d.width=t.data("bbvideo").split(",")[0].trim()||l.width,d.height=t.data("bbvideo").split(",")[1].trim()||l.height);var s=t.closest("div"),h=d.height/d.width;s.length>0&&0!==h&&s.width()<d.width&&(d.width=s.width(),d.height=d.width*h);for(var w=0,p=c.length;w<p;w++){var n=new RegExp(c[w].site+"/","i");if(n.test(m)){switch(c[w].type){case"flash":a(t,m.replace(c[w].regex,o(c[w].embed[0],c[w].embed[1],d)));break;case"yqlOgp":r(t,m,c[w].regex,d,c[w].type);break;case"yqlOembed":r(t,m.replace(c[w].regex,c[w].embed),c[w].regex,d,c[w].type);break;case"oembed":i(t,m.replace(c[w].regex,c[w].embed),d);break;default:a(t,m.replace(c[w].regex,c[w].embed.replace(/\{WIDTH}/g,d.width).replace(/\{HEIGHT}/g,d.height)))}break}}})},bbwizard=function(t,i){if(!requestRunning){var r=e("#bbcode_wizard");r.is(":visible")||(requestRunning=!0,e.ajax({url:t,dataType:"html",beforeSend:function(){r.hide().empty()},success:function(e){r.append(e).fadeIn("fast")},error:function(){switch(i){case"bbvideo":bbfontstyle("[BBvideo=560,315]","[/BBvideo]");break;default:bbfontstyle("["+i+"]","[/"+i+"]")}},complete:function(){requestRunning=!1}}))}};var t=function(e,t){var i;if(is_ie&&(i=document.forms[form_name].elements[text_name],i.focus(),baseHeight=document.selection.createRange().duplicate().boundingHeight),insert_text(e+t),is_ie){var r=e+t,o=i.innerHTML.indexOf(r);if(o>0){var a=o+r.length,m=i.createTextRange();m.move("character",a),m.select(),storeCaret(i),i.focus()}}};e(document).ready(function(){var i=e("body");e(".bbvideo").bbvideo(),i.on("click",".spoilbtn",function(t){t.preventDefault();var i=e(this),r=i.closest("div").next(".spoilcontent");r.slideToggle("fast",function(){i.text(r.is(":visible")?i.data("hide"):i.data("show"))})});var r=e("#bbcode_wizard");i.on("click",function(){r.fadeOut("fast")}),r.on("click","#bbcode_wizard_submit",function(i){i.preventDefault();var o=e(this).data("bbcode");switch(o){case"url":var a=e("#bbcode_wizard_link").val(),m=e("#bbcode_wizard_description").val();t("["+o+(m.length?"="+a:"")+"]"+(m.length?m:a),"[/"+o+"]");break;case"bbvideo":t("[BBvideo="+e("#bbvideo_wizard_width").val()+","+e("#bbvideo_wizard_height").val()+"]"+e("#bbvideo_wizard_link").val(),"[/BBvideo]")}r.fadeOut("fast")}).on("click","#bbcode_wizard_cancel",function(e){e.preventDefault(),r.fadeOut("fast")}).on("change","#bbvideo_wizard_sites",function(){e("#bbvideo_wizard_example").val(e(this).val())}).on("change","#bbvideo_wizard_size_presets",function(){if(0!==e(this).val().length){var t=e(this).val().split(",");e("#bbvideo_wizard_width").val(t[0]),e("#bbvideo_wizard_height").val(t[1])}}).click(function(e){e.stopPropagation()})})}(jQuery);(function($){'use strict';$.fn.extend({borderHover:function(){return this.each(function(){$(this).css({border:'solid 3px transparent',borderRadius:'6px',transition:'border-color 0.1s ease-out',cursor:'pointer'}).hover(function(){$(this).css('border-color','#4ae');},function(){$(this).css('border-color','transparent');});});}});function isResizable(){var mobileWidth=900;return(vseLightbox.resizeWidth>0&&$(window).width()>mobileWidth);}function lightboxResizer(elements){var $targetImage=elements.find('.postimage'),galleryName='post-gallery';if(!vseLightbox.lightboxSig){$targetImage=$targetImage.not(function(){return $(this).closest('.signature').length>0;});}if(isResizable()){$targetImage.css('max-width',vseLightbox.resizeWidth+'px');}else{return;}setTimeout(function(){$targetImage.one('load',function(){if($(this).closest('.postlink').length>0){return;}var imgIndex=(vseLightbox.lightboxGal)?'':$targetImage.index(this),imgWidth=$(this).outerWidth();if($(this).parent('a').length>0){if(imgWidth>=vseLightbox.resizeWidth||$(this).height()>=vseLightbox.resizeWidth){$(this).parent('a').attr({'data-lightbox':galleryName+imgIndex,'data-title':(vseLightbox.imageTitles)?$(this).attr('alt'):''}).end().borderHover();}}else if(imgWidth>=vseLightbox.resizeWidth){$(this).wrap(function(){var url=$(this).attr('src');return $('<a/>').attr({href:url,'data-lightbox':galleryName+imgIndex,'data-title':(vseLightbox.imageTitles)?((url.indexOf('download/file.php')!==-1)?$(this).attr('alt'):url.split('/').pop()):''});}).borderHover();}}).each(function(){if(this.complete){$(this).load();}});},0);}$(function(){lightboxResizer($(document));});$('#qr_posts').on('qr_loaded',function(e,elements){lightboxResizer(elements);});$('#qr_postform').on('ajax_submit_preview',function(){lightboxResizer($('#preview'));});})(jQuery);!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):"object"==typeof exports?module.exports=b(require("jquery")):a.lightbox=b(a.jQuery)}(this,function(a){function b(b){this.album=[],this.currentImageIndex=void 0,this.init(),this.options=a.extend({},this.constructor.defaults),this.option(b)}return b.defaults={albumLabel:"Image %1 of %2",alwaysShowNavOnTouchDevices:!1,fadeDuration:600,fitImagesInViewport:!0,imageFadeDuration:600,positionFromTop:50,resizeDuration:700,showImageNumberLabel:!0,wrapAround:!1,disableScrolling:!1,sanitizeTitle:!1},b.prototype.option=function(b){a.extend(this.options,b)},b.prototype.imageCountLabel=function(a,b){return this.options.albumLabel.replace(/%1/g,a).replace(/%2/g,b)},b.prototype.init=function(){var b=this;a(document).ready(function(){b.enable(),b.build()})},b.prototype.enable=function(){var b=this;a("body").on("click","a[rel^=lightbox], area[rel^=lightbox], a[data-lightbox], area[data-lightbox]",function(c){return b.start(a(c.currentTarget)),!1})},b.prototype.build=function(){var b=this;a('<div id="lightboxOverlay" class="lightboxOverlay"></div><div id="lightbox" class="lightbox"><div class="lb-outerContainer"><div class="lb-container"><img class="lb-image" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /><div class="lb-nav"><a class="lb-prev" href="" ></a><a class="lb-next" href="" ></a></div><div class="lb-loader"><a class="lb-cancel"></a></div></div></div><div class="lb-dataContainer"><div class="lb-data"><div class="lb-details"><span class="lb-caption"></span><span class="lb-number"></span></div><div class="lb-closeContainer"><a class="lb-close"></a></div></div></div></div>').appendTo(a("body")),this.$lightbox=a("#lightbox"),this.$overlay=a("#lightboxOverlay"),this.$outerContainer=this.$lightbox.find(".lb-outerContainer"),this.$container=this.$lightbox.find(".lb-container"),this.$image=this.$lightbox.find(".lb-image"),this.$nav=this.$lightbox.find(".lb-nav"),this.containerPadding={top:parseInt(this.$container.css("padding-top"),10),right:parseInt(this.$container.css("padding-right"),10),bottom:parseInt(this.$container.css("padding-bottom"),10),left:parseInt(this.$container.css("padding-left"),10)},this.imageBorderWidth={top:parseInt(this.$image.css("border-top-width"),10),right:parseInt(this.$image.css("border-right-width"),10),bottom:parseInt(this.$image.css("border-bottom-width"),10),left:parseInt(this.$image.css("border-left-width"),10)},this.$overlay.hide().on("click",function(){return b.end(),!1}),this.$lightbox.hide().on("click",function(c){return"lightbox"===a(c.target).attr("id")&&b.end(),!1}),this.$outerContainer.on("click",function(c){return"lightbox"===a(c.target).attr("id")&&b.end(),!1}),this.$lightbox.find(".lb-prev").on("click",function(){return 0===b.currentImageIndex?b.changeImage(b.album.length-1):b.changeImage(b.currentImageIndex-1),!1}),this.$lightbox.find(".lb-next").on("click",function(){return b.currentImageIndex===b.album.length-1?b.changeImage(0):b.changeImage(b.currentImageIndex+1),!1}),this.$nav.on("mousedown",function(a){3===a.which&&(b.$nav.css("pointer-events","none"),b.$lightbox.one("contextmenu",function(){setTimeout(function(){this.$nav.css("pointer-events","auto")}.bind(b),0)}))}),this.$lightbox.find(".lb-loader, .lb-close").on("click",function(){return b.end(),!1})},b.prototype.start=function(b){function c(a){d.album.push({link:a.attr("href"),title:a.attr("data-title")||a.attr("title")})}var d=this,e=a(window);e.on("resize",a.proxy(this.sizeOverlay,this)),a("select, object, embed").css({visibility:"hidden"}),this.sizeOverlay(),this.album=[];var f,g=0,h=b.attr("data-lightbox");if(h){f=a(b.prop("tagName")+'[data-lightbox="'+h+'"]');for(var i=0;i<f.length;i=++i)c(a(f[i])),f[i]===b[0]&&(g=i)}else if("lightbox"===b.attr("rel"))c(b);else{f=a(b.prop("tagName")+'[rel="'+b.attr("rel")+'"]');for(var j=0;j<f.length;j=++j)c(a(f[j])),f[j]===b[0]&&(g=j)}var k=e.scrollTop()+this.options.positionFromTop,l=e.scrollLeft();this.$lightbox.css({top:k+"px",left:l+"px"}).fadeIn(this.options.fadeDuration),this.options.disableScrolling&&a("body").addClass("lb-disable-scrolling"),this.changeImage(g)},b.prototype.changeImage=function(b){var c=this;this.disableKeyboardNav();var d=this.$lightbox.find(".lb-image");this.$overlay.fadeIn(this.options.fadeDuration),a(".lb-loader").fadeIn("slow"),this.$lightbox.find(".lb-image, .lb-nav, .lb-prev, .lb-next, .lb-dataContainer, .lb-numbers, .lb-caption").hide(),this.$outerContainer.addClass("animating");var e=new Image;e.onload=function(){var f,g,h,i,j,k,l;d.attr("src",c.album[b].link),f=a(e),d.width(e.width),d.height(e.height),c.options.fitImagesInViewport&&(l=a(window).width(),k=a(window).height(),j=l-c.containerPadding.left-c.containerPadding.right-c.imageBorderWidth.left-c.imageBorderWidth.right-20,i=k-c.containerPadding.top-c.containerPadding.bottom-c.imageBorderWidth.top-c.imageBorderWidth.bottom-120,c.options.maxWidth&&c.options.maxWidth<j&&(j=c.options.maxWidth),c.options.maxHeight&&c.options.maxHeight<j&&(i=c.options.maxHeight),(e.width>j||e.height>i)&&(e.width/j>e.height/i?(h=j,g=parseInt(e.height/(e.width/h),10),d.width(h),d.height(g)):(g=i,h=parseInt(e.width/(e.height/g),10),d.width(h),d.height(g)))),c.sizeContainer(d.width(),d.height())},e.src=this.album[b].link,this.currentImageIndex=b},b.prototype.sizeOverlay=function(){this.$overlay.width(a(document).width()).height(a(document).height())},b.prototype.sizeContainer=function(a,b){function c(){d.$lightbox.find(".lb-dataContainer").width(g),d.$lightbox.find(".lb-prevLink").height(h),d.$lightbox.find(".lb-nextLink").height(h),d.showImage()}var d=this,e=this.$outerContainer.outerWidth(),f=this.$outerContainer.outerHeight(),g=a+this.containerPadding.left+this.containerPadding.right+this.imageBorderWidth.left+this.imageBorderWidth.right,h=b+this.containerPadding.top+this.containerPadding.bottom+this.imageBorderWidth.top+this.imageBorderWidth.bottom;e!==g||f!==h?this.$outerContainer.animate({width:g,height:h},this.options.resizeDuration,"swing",function(){c()}):c()},b.prototype.showImage=function(){this.$lightbox.find(".lb-loader").stop(!0).hide(),this.$lightbox.find(".lb-image").fadeIn(this.options.imageFadeDuration),this.updateNav(),this.updateDetails(),this.preloadNeighboringImages(),this.enableKeyboardNav()},b.prototype.updateNav=function(){var a=!1;try{document.createEvent("TouchEvent"),a=this.options.alwaysShowNavOnTouchDevices?!0:!1}catch(b){}this.$lightbox.find(".lb-nav").show(),this.album.length>1&&(this.options.wrapAround?(a&&this.$lightbox.find(".lb-prev, .lb-next").css("opacity","1"),this.$lightbox.find(".lb-prev, .lb-next").show()):(this.currentImageIndex>0&&(this.$lightbox.find(".lb-prev").show(),a&&this.$lightbox.find(".lb-prev").css("opacity","1")),this.currentImageIndex<this.album.length-1&&(this.$lightbox.find(".lb-next").show(),a&&this.$lightbox.find(".lb-next").css("opacity","1"))))},b.prototype.updateDetails=function(){var b=this;if("undefined"!=typeof this.album[this.currentImageIndex].title&&""!==this.album[this.currentImageIndex].title){var c=this.$lightbox.find(".lb-caption");this.options.sanitizeTitle?c.text(this.album[this.currentImageIndex].title):c.html(this.album[this.currentImageIndex].title),c.fadeIn("fast").find("a").on("click",function(b){void 0!==a(this).attr("target")?window.open(a(this).attr("href"),a(this).attr("target")):location.href=a(this).attr("href")})}if(this.album.length>1&&this.options.showImageNumberLabel){var d=this.imageCountLabel(this.currentImageIndex+1,this.album.length);this.$lightbox.find(".lb-number").text(d).fadeIn("fast")}else this.$lightbox.find(".lb-number").hide();this.$outerContainer.removeClass("animating"),this.$lightbox.find(".lb-dataContainer").fadeIn(this.options.resizeDuration,function(){return b.sizeOverlay()})},b.prototype.preloadNeighboringImages=function(){if(this.album.length>this.currentImageIndex+1){var a=new Image;a.src=this.album[this.currentImageIndex+1].link}if(this.currentImageIndex>0){var b=new Image;b.src=this.album[this.currentImageIndex-1].link}},b.prototype.enableKeyboardNav=function(){a(document).on("keyup.keyboard",a.proxy(this.keyboardAction,this))},b.prototype.disableKeyboardNav=function(){a(document).off(".keyboard")},b.prototype.keyboardAction=function(a){var b=27,c=37,d=39,e=a.keyCode,f=String.fromCharCode(e).toLowerCase();e===b||f.match(/x|o|c/)?this.end():"p"===f||e===c?0!==this.currentImageIndex?this.changeImage(this.currentImageIndex-1):this.options.wrapAround&&this.album.length>1&&this.changeImage(this.album.length-1):("n"===f||e===d)&&(this.currentImageIndex!==this.album.length-1?this.changeImage(this.currentImageIndex+1):this.options.wrapAround&&this.album.length>1&&this.changeImage(0))},b.prototype.end=function(){this.disableKeyboardNav(),a(window).off("resize",this.sizeOverlay),this.$lightbox.fadeOut(this.options.fadeDuration),this.$overlay.fadeOut(this.options.fadeDuration),a("select, object, embed").css({visibility:"visible"}),this.options.disableScrolling&&a("body").removeClass("lb-disable-scrolling")},new b});(function($){'use strict';$.fn.topicPreview=function(options){var settings=$.extend({dir:'ltr',delay:1000,width:360,drift:15,position:{left:35,top:25}},options),previewTimeout,previewContainer=$('<div id="topic_preview"></div>').css('width',settings.width).appendTo('body');settings.delay=Math.max(settings.delay,300);$('.topic_preview_avatar').toggleClass('rtl',(settings.dir==='rtl')).children('img').brokenImage({replacement:settings.noavatar});var showTopicPreview=function(){var obj=$(this);var content=obj.closest('li, tr').find('.topic_preview_content').html();if(content===undefined||content===''){return false;}if(previewTimeout){previewTimeout=clearTimeout(previewTimeout);}obj.removeAttr('title').clearTitles('dt').clearTitles('dl');previewTimeout=setTimeout(function(){previewTimeout=undefined;previewContainer.html(content);var pointerOffset=8;var previewTop=obj.offset().top+settings.position.top,previewBottom=previewTop+previewContainer.height()+pointerOffset;previewContainer.toggleClass('invert',edgeDetect(previewBottom));previewTop=edgeDetect(previewBottom)?obj.offset().top-previewContainer.outerHeight(true)-pointerOffset:previewTop;previewContainer.stop(true,true).css({top:previewTop+'px',left:obj.offset().left+settings.position.left+(settings.dir==='rtl'?(obj.width()-previewContainer.width()):0)+'px'}).fadeIn('fast');},settings.delay);};var hideTopicPreview=function(){var obj=$(this);if(previewTimeout){previewTimeout=clearTimeout(previewTimeout);}previewContainer.stop(true,true).fadeOut('fast').animate({top:'-='+settings.drift+'px'},{duration:'fast',queue:false},function(){});obj.restoreTitles('dt').restoreTitles('dl');};var edgeDetect=function(y){return(y>=($(window).scrollTop()+$(window).height()-50));};return this.each(function(){$(this).hover(showTopicPreview,hideTopicPreview).on('click',function(){previewContainer.hide();if(previewTimeout){previewTimeout=clearTimeout(previewTimeout);}});});};$.extend($.fn,{brokenImage:function(options){var defaults={timeout:3000};options=$.extend(defaults,options);return this.each(function(){var image=this;$(image).bind('error',function(){insertPlaceholder();});setTimeout(function(){var test=new Image();test.src=image.src;if(test.height===0){insertPlaceholder();}},options.timeout);function insertPlaceholder(){if(options.replacement){image.src=options.replacement;}else{$(image).css('visibility','hidden');}}});},clearTitles:function(el){return this.each(function(){var $obj=$(this).closest(el);var title=$obj.attr('title');if(typeof title!==typeof undefined&&title!==false){$obj.data('title',title).removeAttr('title');}});},restoreTitles:function(el){return this.each(function(){var $obj=$(this).closest(el);$obj.attr('title',$obj.data('title'));});}});})(jQuery);

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