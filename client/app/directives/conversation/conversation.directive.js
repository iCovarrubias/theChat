'use strict';

angular.module('theChatApp')
  .directive('conversation', function ($compile, conversationManager) {

  	/* 
        A function that compiles a <message>
        arguments:
            message: string|object
                string: The message to be displayed
                object: {message: "the message", type: "msg-out|msg-in"}
            type: msg-out or msg-in 
    */
    //isma, todo: fix/remove this
    function createMessage(scope, message, type) {
        if(typeof message === "string")
        {
            message = {message: message, type: type}
        }
       
        scope.msg = message;
        var elem = $compile('<message type="msg.type">{{msg.message}}</message>')(scope);
        return elem;
    }

    /*
      Add a <message> to element.
      aMessage [array|object]
        Array: All messages in the array will be added
    */
    function addMessage(scope, aMessage, element) {
      var messages = aMessage;
      if(!angular.isArray(messages) && typeof aMessage === "object")
      {
        messages = [aMessage];
      }
      var len = messages.length;
      //isma, TODO, this can be greatly optimized if we cache elements too
      for(var i = 0; i < len; i++) {
        var msgScope = scope.$new(true); //isma, TODO: ask ivan, is it a good idea to create this many scopes?
        var msg = createMessage(msgScope, messages[i]);
        element.append(msg);
      }
    }

    /*
      //isma, TODO, use this object to save all message elements by userId
      this way we don't have to re-compile messages when switching between users
    */
    var messageElements = {};

    return {
      templateUrl: 'app/directives/conversation/conversation.html',
      restrict: 'E',
      scope: {
      	currentFriend: "=",
        onSendMessage: "&"
      },
      link: function (scope, element, attrs) {
        var currentConversation = null;
        var $chatBody = element.find('.chat-body');
        scope.sendMessage = function(message) {
          var msg = {
            message: message,
            contentType:  "text"
          };
          scope.onSendMessage(msg);
          scope.message =  "";
        };
      	scope.$watch('currentFriend', function() {
      		// console.log('switching to user: ', scope.currentFriend);
          //switch to new conversation
          if(scope.currentFriend)
          {
            currentConversation = conversationManager.getConversation(scope.currentFriend._id);

            $chatBody.empty(); //isma, TODO, save all messages before removing, use .detach() instead

            if(currentConversation && currentConversation.messages)
            {
              var messages = currentConversation.messages;

              addMessage(scope, messages, $chatBody);
            }
          }
      	});

        scope.$on('new message', function(event, message) {
          //you must add the message only if the current window is selected
          //if not selected, messages are retrieved from service
          if(message.friendId == scope.currentFriend._id) {
            addMessage(scope, message, $chatBody)
          }
        });

      }
    };
  });
