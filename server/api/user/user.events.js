/**
 * User model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var User = require('./user.model');
var UserEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserEvents.setMaxListeners(0);

// Model events //isma, never do this!
// you are alerting everyone when you change something!!
// User.schema.post('save', emitEvent('save'));


// function emitEvent(event) {
//   return function(msg) {
//     // UserEvents.emit(event + ':' + doc._id, doc);
//     // console.log('onUserEvents socket emit: ', event, msg);
//     UserEvents.emit(event, msg);
//   }
// }

module.exports = UserEvents;
