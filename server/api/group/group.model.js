'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  name: {
  	type: String, 
  	default: 'New Group'
  },
  members: [{ _id: Schema.Types.ObjectId, name: String, email: String}]
});

GroupSchema.post("save", function(group) {
	if(group.members.length === 0) {
		group.removeAsync();
	}
});

GroupSchema.methods = {
	addMember: function(users) {
		if(!Array.isArray(users)) {
			users = [users];
		}

		for(var i=0; i < users.length; i++) {
			var user = users[i];			
			this.members.addToSet(user);	
		}
	},

	leave: function(user) {
		var memberId = user._id;
		for(var i = 0; i < this.members.length; i++) {
			if(memberId.equals( this.members[i]._id) ){
				this.members.splice(i, 1);
				return;
			}
		}
	}

	// populateMembers: function() {
	// 	var _this = this;
	// 	return _this.constructor.populateAsync(_this,  {
	// 	  path: "members",
	// 	  select: "email name",  
	// 	});
	// }
};
module.exports = mongoose.model('Group', GroupSchema);
