'use strict';

angular.module('theChatApp')
  .factory('conversationManager', function ($rootScope) {
    // Service logic
    // ...
    var conversations = {};
    function saveMessage(friendId, msg) {
      if(conversations[friendId]===undefined) {
          initConversation(friendId);
        }

      delete msg.friendId; //we don't need friendId, avoid repeating data

      //actually save the message, you could either save to the localStorage
      //or other persistence means  
      conversations[friendId].messages.push(msg); 
    }
   
    /*
      A helper method that initializes the necessary data to chat with friendId,
    */
    function initConversation(friendId) {
      conversations[friendId] = {
        friendId: friendId,
        messages: []
      };
    }
  

    // Public API here
    return {
      /*
        Retrieves an ongoing conversation.
        Receives the userId of the user whose conversation we want to retrieve.
      */
      getConversation: function (userId) {
        return conversations[userId];
      }, 
      
      /*
        Saves a message for the user "to", if "to" is not specified
        then it means we have an income message
        msg: {
          message: "the message",
            type: "msg-in" | "msg-out"
          content-type: "text" | "scribble"  
        }
      */
      saveMessage: function(message, friendId, type) {
        //save without friend ID, to avoid repeated data
        var theMessage = angular.extend({}, message);

        theMessage.type = type === undefined? 'msg-out': type;

        if( (theMessage.type  === 'msg-out' && theMessage.isGroupMessage ) 
            || !theMessage.isGroupMessage)
        {
          delete theMessage.from;
        }
        
        saveMessage(friendId, theMessage);
        
        //emit with friendId
        $rootScope.$broadcast('new message', friendId, theMessage);
      }
        
    };
  });
