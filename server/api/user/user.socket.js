/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var UserEvents = require('./user.events');

//isma, we save all the sockets by userId.
//does this allows us to find users in a distributed environment?
var users = {}; 

// Model events to emit
// var events = ['save', 'remove']; //super bad idea to emit these two
// var events = ['friendListUpdated']; 

exports.register = function(socket) {

  //isma TODO, refactor how user disconect
  socket.on('disconnect', function(){
    // removeListener(event, listener);
    delete users[socket._id];
  }); 

  socket.on('friendRequest', function(data, cb) {
    sendFriendRequest(data, cb);
  })
  users[socket.decoded_token._id] = socket;
};

exports.getUserSockets = function() {
  return users;
}

/*
  This event is triggered when a user adds/removes a friend

  PARAMS
  data is {fid: id, userData:{} }

    data.fid: the id of the friend you've added

    data.userData: {_id: id, email: String, name: String }
        data.userData.email: email of current user
        data.userData.name: name of current user
        
  cb: function, Used to report errors to sender only, see ERRORS below
 
  EMITS
  'friendRequest' if the contact you are adding is online
  
  ERRORS
  if callback cb is passed, it will responde with cb(bool error, str message)

 */
function sendFriendRequest(data, cb) {
  if(typeof cb === "function") {
    if(!data) {
      return cb(true, "No data was passed"); 
    }
    //isma, todo add more validations
  }

  
  var fSocket = users[data.fid];  //the friend's socket
  if(fSocket) {
    //friend is online, send contact request w/id email and name
    fSocket.emit('friendRequest', data.friendRequest);
  }
}


// function createListener(event, socket) {
//   return function(msg) {
//     // socket.emit(event, msg);
//   };
// }

// function removeListener(event, listener) {
//   return function() {
//     UserEvents.removeListener(event, listener);
//   };
// }
