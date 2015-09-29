/**
 * Broadcast updates to client when the model changes
 */

'use strict';

// var MessageEvents = require('./message.events');
var Group = require('../group/group.model');

// Model events to emit
// var events = ['save', 'remove'];

exports.register = function(socket) {
  // Bind model events to socket events
  // for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
  //   var event = events[i];
  //   var listener = createListener('message:' + event, socket);

    // MessageEvents.on(event, listener);
    // socket.on('disconnect', removeListener(event, listener));
  // }

  socket.on('new message', function(data, cb) { 
    var users = require('../user/user.socket').getUserSockets();
    if(data.isGroupMessage !== true) {
      sendMessage(users, socket, data, cb);
    } else {
      sendGroupMessage(users, socket, data, cb);
    }
  });
};

function safeCallback(cb) {
  return typeof cb === "function"?cb:function(){};
}
function sendMessage(users, socket, data, cb) {
  cb = safeCallback(cb);
  // console.log("on socket sendMessage usr", users)
  // console.log("on socket sendMessage socket", socket)
  // console.log("on socket sendMessage data", data)
  

  var fSocket = users[data.friendId];  //the friend's socket
  if(fSocket) {
    //friend is online
    data.friendId = socket.decoded_token._id;
    fSocket.emit('new message', data);
  } else {
    cb(true, "User is offline [" + data.friendId + "]");
  }
}

function sendGroupMessage(users, socket, data, cb) {
  Group.findByIdAsync(data.friendId)
    .then(function(group) {
      if(!group) {
        cb(true, "Can't find group [" + data.friendId + "]");
        return;
      }
      for(var i=0; i<group.members.length; i++) {
        var memberId = group.members[i]._id;
        var memberSocket = users[memberId];
        if(!memberSocket) {continue;}
        memberSocket.emit('new message', data);
      }
    });
}
// function createListener(event, socket) {
//   return function(doc) {
//     socket.emit(event, doc);
//   };
// }

// function removeListener(event, listener) {
//   return function() {
//     MessageEvents.removeListener(event, listener);
//   };
// }
