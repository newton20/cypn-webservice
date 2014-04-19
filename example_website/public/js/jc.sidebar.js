/*
* Jira Chat Sidebar Scripts
* @author swider
*/

jc.sidebar = (function(){
	var
		sidebarSel = '#sidebar',
		toggleSel = '#sidebartoggle',
		collapsedclass = 'sidebarcollapsed',
		
		$body,
		$sidebar,
		$toggle,

		toggleSidebar = function(){
			console.log('wtf?'+collapsedclass);
			$body.toggleClass(collapsedclass);
		},
	
		init = function(){
			$body = $('body');
			$sidebar = $(sidebarSel);
			$toggle = $sidebar.find(toggleSel);
			
			$toggle.click(toggleSidebar);
		};
	
	return {
		init: init
	};
}());
