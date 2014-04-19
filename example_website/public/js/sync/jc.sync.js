jc.sync = (function() {


	var UserItemView = Backbone.View.extend({
		tagName: 'li',
		tmpl: '<input type="checkbox"><span class="name"><%=name%>',

		events: {
			'click .name': 'nameClick'
		},

		nameClick: function(e) {
			jc.chat.startNewChat(this.model);
		},

		data: function() {
			var id = this.model.get('id');
			return {
				name: jc.payload && id === jc.payload.user ? 'You' : id
			};
		},
		render: function() {
			this.$el.html(_.template(this.tmpl, this.data()));
		}
	});

	var userListView = new (Backbone.View.extend({
		initialize: function() {
			this.collection = jc.userCollection = new Backbone.Collection();
			this.$el = $('#sidebar');
			this.$contacts = $('#contacts ul');
			this.bindEvents();

			setTimeout(function() { jc.client.publish('/fullSync'); }, 200);
		},

		bindEvents: function() {
			// updating current users on the page
			jc.client.subscribe('/addUser', $.proxy(this, 'addUser'));
			jc.client.subscribe('/getAllUsers', $.proxy(this, 'updateAllUsers'));
			jc.client.subscribe('/removeUser', $.proxy(this, 'removeUser'));

			this.collection.on('add', function(model) {
				var view = new UserItemView({ model: model });
				view.render();
				this.$contacts.append(view.el);
			}, this);
		},

		addUser: function(info) {
			if(!info.user) return;
			this.collection.add({id: info.user});
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
		}
	}))();


	return function(info){
		jc.client.publish('/sync', info);
	};
})();
