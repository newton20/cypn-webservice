var jc = {
	client:  new Faye.Client('/faye', { timeout: 20 })
};

$(function(){
	jc.sidebar.init();
});
