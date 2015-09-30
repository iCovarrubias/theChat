'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, Auth, User, socket, contactManager, conversationManager) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.user = user;

    // socket.onFriendListUpdate(function(evt,data) {
    //     console.log('cb', evt);
    // });

    // $scope.addFriend = function(form){
    // 	//moved to addUserPanel.directive controller
    // };

    // $scope.removeFriend = function(friendId) {
       //moved to contactsMain.directive controller
    // };



    socket.on('friendRequest', function(data) {
        contactManager.onNewFriendRequest(data);
        // $scope.friendRequests.push(data);
    });

    socket.on('addedToGroup', function(data) {
        contactManager.onAddedToGroup(data);
    });
    /*
        ADDING/REMOVING CONTACTS code ends here.
    */



    /*
        CHATTING WITH PEOPLE code starts here
    */
    $scope.openChatPanel = function(friend) {
        //change the currentFriend, the <conversation> directive reacts to this change 
        $scope.currentFriend = friend;
    };

    $scope.onSendMessage = function(message, contentType, isGroupMessage) {
        if(contentType === "text") {
            sendTextMessage(message, contentType, isGroupMessage);
        } else {
            return sendScribble(message, contentType, isGroupMessage);
        }
    };

    
    function sendTextMessage(msg, contentType, isGroupMessage){
        //the message to be sent
        var aMessage = {
            message: msg,
            friendId: $scope.currentFriend._id,
            contentType: contentType,
            from: user.name
        };
        
        if(isGroupMessage === true) { aMessage.isGroupMessage = true; }

        //save msg (the message to be displayed)
        conversationManager.saveMessage(aMessage, aMessage.friendId);


        //emit
        socket.emit('new message', aMessage, function(error, message) {
            if(error) { return console.log(message);}
            //isma, TODO receives back a time-stamped message from server
            //you could implement something like sending/sent/received/visto
        });
    }

    function sendScribble(data, contentType, isGroupMessage){
        var aMessage = {
            message: data,
            friendId: $scope.currentFriend._id,
            contentType: contentType,
            from: user.name
        };
        
        if(isGroupMessage === true) { aMessage.isGroupMessage = true; }

        //save msg (the message to be displayed)
        conversationManager.saveMessage(aMessage, aMessage.friendId);


        //emit
        socket.emit('new message', aMessage, function(error, message) {
            if(error) { return console.log(message);}
            //isma, TODO receives back a time-stamped message from server
            //you could implement something like sending/sent/received/visto
        });
    }

    socket.on('new message', function(data){
        conversationManager.saveMessage(data, data.friendId, "msg-in");
    });

    //isma, todo: these listeners should be removed on logout
    $scope.$on('$destroy', function() {
        socket.removeListener('friendRequest');
        socket.removeListener('new message');
    });

    //listens to when a contact is selected to chat with
    $scope.$on('openChatPanel', function(event, friend) {
        $scope.openChatPanel(friend);
    });

  });
