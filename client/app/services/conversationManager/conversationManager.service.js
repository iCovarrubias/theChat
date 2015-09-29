'use strict';

angular.module('theChatApp')
  .factory('conversationManager', function ($rootScope) {
    // Service logic
    // ...
    var conversations = {};
   
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
      saveMessage: function(message, friendId) {
        if(conversations[friendId]===undefined) {
          initConversation(friendId);
        }

        //save without friend ID, to avoid repeated data
        var theMessage = angular.extend({}, message);
        delete theMessage.friendId;        
        conversations[friendId].messages.push(theMessage); 
        
        //emit with friendId
        $rootScope.$broadcast('new message', message);
      },
        
    };
  });
