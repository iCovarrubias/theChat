/**
 * Broadcast updates to client when the model changes
 */

'use strict';

// var MessageEvents = require('./message.events');


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
    sendMessage(users, socket, data, cb);
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

  var fSocket = users[data.to];  //the friend's socket
  if(fSocket) {
    //friend is online
    data.from = socket.decoded_token._id;
    fSocket.emit('new message', data);
  } else {
    cb(true, "User is offline [" + data.to + "]");
  }
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
