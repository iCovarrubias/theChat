/**
 * Group model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var Group = require('./group.model');
var GroupEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
GroupEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Group.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    GroupEvents.emit(event + ':' + doc._id, doc);
    GroupEvents.emit(event, doc);
  }
}

module.exports = GroupEvents;
