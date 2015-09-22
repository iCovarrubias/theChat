'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  name: {
  	type: String, 
  	default: 'New Group'
  },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

GroupSchema.methods = {
	addMemeber: function(user) {
		//isma, TODO: push unique memebers, return -1 if user already exists
		members.push(user);
	},

	leave: function(user) {
		var memberId = user._id;
		for(var i = 0; i < members.length; i++) {
			if(memberId === members[i]) {
				members.splice(i, 1);
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
