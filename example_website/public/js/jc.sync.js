jc.sync = (function() {
	var client = new Faye.Client('/faye', { timeout: 20 });

	function Sync(){
		this.$el = $('#sidebar');
		this.$contacts = $('#contacts ul');
		this.bindEvents();

		setTimeout(function() { $.post('/fullSync'); }, 200);

	}
	Sync.prototype = {
		bindEvents: function() {
			// updating current users on the page
			client.subscribe('/addUser', $.proxy(this, 'addUser'));
			client.subscribe('/getAllUsers', $.proxy(this, 'updateAllUsers'));
			client.subscribe('/removeUser', $.proxy(this, 'removeUser'));
			client.subscribe('/inviteUser',  $.proxy(this, 'inviteUser'));
		},

		addUser: function(info) {
			var user = info.user;
			if(!user) return;

			var $user = this.$contacts.find('[data-user="'+user+'"]');
			if(!$user.length) {
				this.$contacts.append('<li data-user="'+user+'">'+user+'</li>');
			}
		},

		removeUser: function(user) {
			var $user = this.$contacts.find('[data-user="'+user+'"]');
			if($user.length) {
				$user.remove();
			}			
		},

		updateAllUsers: function(users) {
			for(var user in users) {
				if(user && users.hasOwnProperty(user)) {
					this.addUser(users[user]);
				}
			}
		},

		inviteUser: function(user) {
			
		}

	};
	new Sync();

	

	
	return function(info){
		$.ajax({
			type: 'POST',
			url: '/sync',
			dataType: 'json',
			data: info
		});
	};
})();

