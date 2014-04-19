/*
* Jira Chat Sidebar Chat Scripts
* @author swider, dominick
*/

var MessageView = Backbone.View.extend({
});

var ChatWindowView = Backbone.View.extend({
	className: 'chatwindow',
	tmpl: '<ul class="chat_messages"></ul>\
		<div><input type="text"><button class="send-message">Send</button><button class="invite">+</button></div>\
		<a class="close">x</a>',

	events: {
		'click .send-message': 'sendMessage',
		'keydown input': 'keydown',
		'click .invite':'inviteChat',
		'click .close':'postChat'
	},

	initialize: function() {
		this.$el.attr('id', 'chatwindow-'+this.model.get('id'));
		this.recipient = this.model.get('id');
	},

	keydown: function(e) {
		if(e.keyCode === 13) {
			this.sendMessage();
			this.$text.val('');
		}
	},

	sendMessage: function(message) {
		var msg = message || this.$text.val();
		jc.client.publish('/updateChatWindow', {
			sender: jc.payload.user,
			recipient: this.model.get('id'),
			message: msg
		});
	},

	addRecipientMessage: function(info) {
		this.$ul.append('<li class="msg">\
			<span class="chat_sender">'+info.sender+':</span>\
			<span class="chat_msg">'+info.message+'</span></div>');
		this.$ul.scrollTop(99999);
	},

	inviteChat: function(info) {
		jc.client.publish('/startVideo', {
			sender: jc.payload.user,
			recipient: this.model.get('id'),
			ticket: jc.payload.ticket
		});
	},

	postChat: function(info) {
		var $clonedMessages = $(".chat_messages").clone();
		$clonedMessages.find('.video_link').remove();
		var messages = $clonedMessages.html();
		messages = messages.replace(/\t/g,"").replace(/<li class=\"msg\">/g,"").replace(/<\/li>/g,"\\r\\n");
		messages = messages.replace(/<span class=\"chat_sender\">/g,"").replace(/<span class=\"chat_msg\">/g,"").replace(/<\/span>/g,"");
		console.log(info);
		console.log(messages);
		jc.client.publish('/postChat', { sender: jc.payload.user, ticket: jc.payload.ticket, comment: messages });

		var $el = jc.chat.chats[this.model.get('id')].$el;
		delete jc.chat.chats[this.model.get('id')];
		$el.remove();
		jc.chat.$videoframe.removeClass('active').attr('src','');
	},


	render: function() {
		this.$el.html(_.template(this.tmpl, {user: this.model.get('id')}));
		this.$ul = this.$('ul');
		this.$text = this.$('input');
		return this;
	}
});


jc.chat = new (Backbone.View.extend({
	events: {
		'click .video_link': 'openVideoLink'
	},
	initialize: function() {
		this.setElement('body');
		this.$contacts = this.$('#contacts');
		this.$chats = this.$('#chats');
		this.chats = {};
		this.boundUsers = [];
		this.$videoframe = $('#video_chat');

		window.addEventListener('message', _.bind(this.getCurrentUser, this), false);
	},

	bindUpdateChatWindow: function(user) {
		if(this.boundUsers.indexOf(user) !== -1) return;
		this.boundUsers.push(user);
		jc.client.subscribe('/updateChatWindow', _.bind(this.updateChatWindow, this));
		jc.client.subscribe('/showChat', _.bind(this.showChat, this));
	},

	getCurrentUser: function(e) {
		var payload = JSON.parse(e.data);
		this.bindUpdateChatWindow(payload.user);

		jc.payload = payload;
		jc.sync(payload);
	},

	showChat: function(info) {
		info.message = '<a class="video_link" href="/video/'+info.ticket+'/">Invite to videochat (' +info.ticket+')</a>';
		if(info.sender === jc.payload.user) jc.client.publish('/updateChatWindow', info);
	},

	openVideoLink: function(e) {
		this.$videoframe.attr('src', $(e.currentTarget).attr('href'));
		this.$videoframe.addClass('active');
		return false;
	},

	startNewChat: function(userModel) {
		var chatWindowView = new ChatWindowView({model: userModel});
		this.$chats.append(chatWindowView.render().el);
		this.chats[userModel.get('id')] = chatWindowView;
	},

	updateChatWindow: function(info) {
		var model = jc.userCollection.get(info.recipient);
		if(!this.chats[info.recipient]) this.startNewChat(model);
		this.chats[info.recipient].addRecipientMessage(info);
	}
}))();
