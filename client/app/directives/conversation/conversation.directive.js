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

    function createMessage(scope, message, type) {
        if(typeof message === "string")
        {
          type = type===undefined?"msg-out":type;
          message = {message: message, type: type};
        }
        //isma TODO: we can re-use the same compile function and just change the scope??
        // console.log('message is:', message);
        scope.msg = message;
        var messageCompileFn = $compile('<message msg="msg"></message>'); 
        var elem = messageCompileFn(scope);
        return elem;
    }

    /* 
        A function that compiles a <scribble>
        arguments:
            message: object
                object: {message: data, type: "msg-out|msg-in"}
            type: msg-out or msg-in 
    */
    function createScribble(scope, message, type) {
      scope.msg = message;
      var scribbleCompileFn = $compile('<scribble msg="msg"></scribble>'); 
      var elem = scribbleCompileFn(scope);
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
        var msgType = messages[i].contentType;
        var msg = msgType === "text"?
          createMessage(msgScope, messages[i]):createScribble(msgScope, messages[i]);
        element.append(msg);
      }
    }

    /*
      //isma, TODO, use this object to save all message elements by userId
      this way we don't have to re-compile messages when switching between users
    */
    // var messageElements = {};

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
            contentType:  "text",
            isGroupMessage: !!scope.currentFriend.members
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

        scope.$on('new message', function(event, friendId, message) {
          //you must add the message only if the current window is selected
          //if not selected, messages are retrieved from service
          if(scope.currentFriend && friendId === scope.currentFriend._id) {
            addMessage(scope, message, $chatBody)
          }
        });

      },
      controller: function($scope, $modal) {
        $scope.openScribbleEditor = function() {
          var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'app/directives/conversation/include/scribbleEditor/modalDrawScribble.html',
            controller: 'ScribbleEditorCtrl'
          });
          modalInstance.result.then(function (data) {
            var msg = {
              message: data,
              contentType:  "scribble",
              isGroupMessage: !!$scope.currentFriend.members
            };
            
            $scope.onSendMessage(msg);
          }, function () {
            console.warn('WIP, Modal dismissed');
          });
        };
      }
    };
  });
