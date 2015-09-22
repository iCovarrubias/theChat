'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, $compile, Auth, User, socket, conversationManager) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.friendList = user.friends;
    $scope.friendRequests = user.friendRequests;

    $scope.user = user;
    console.log('groups', user.groups);

    /*
        A helper function that returns the index of an object in an array
        params:
            propName: the name of the field used for comparation
            propValue: the value we are matching against
            arr: An array of objects
        returns:
            number - the position of the element in the array or -1 if not found
        example:
            getIndexBy('_id', "55f0ba26fe778bac22e9e2a9", $scope.friendList)
    */
    //returns the position of such id or -1 if it doesn't exist
    function getIndexBy(propName, propValue, arr) {
        var len = arr.length;
        for(var i = 0;  i < len; i++)
        {
            if(arr[i][propName] === propValue)
            {    return i;  }
        }
        return -1;
    }

    /*
        A helper function that looks for an element in an array
        using the _id property and removes it.

        params:
        id: the value to match
        arr: An array of objects which we asume have the _id propety
    
        returns: 
            if found, returns the element removed
            undefined if not found
    */
    function findByIdAndRemove(id, arr){
        var idx = getIndexBy('_id', id, arr);
        if(idx !== -1) {
            return arr.splice(idx, 1);
        }
    }

    // socket.onFriendListUpdate(function(evt,data) {
    //     console.log('cb', evt);
    // });

    $scope.addFriend = function(form){
    	var myId = user._id;
    	User
            .updateFriendList({id: myId},{op:'add', email: $scope.email})
            .$promise
            .then( function(friend){
                console.log('addFriend response', friend);
                //update GUI
                $scope.friendList.push(friend);
                $scope.errMsg = '';
                $scope.email = '';
                return friend;
            })
            .then( function(friend) {
                //emit a friend request
                socket.emit('friendRequest', 
                    {
                        fid: friend._id, //receiver
                        friendRequest: { //my data
                            _id: user._id,
                            email: user.email,
                            name: user.name
                        }
                    },
                    function(error, msg) {
                        if(error) {
                            console.log('Error sending friendRequest', msg);
                        }
                    });
            })
            .catch(function(res) {
                if(res.data.message)
                {
                    $scope.errMsg = res.data.message;
                }
            }); 
    };

    $scope.removeFriend = function(friendId) {
        var myId = user._id;
        // user.$update({friendId: friendId});
        User
            .updateFriendList({id: myId}, {op:'remove', friendId: friendId})
            .$promise
            .then(function(data) {
                var friendId = data.friendId;
                if(!friendId) { throw new Error('No friendId returned by server'); }

                findByIdAndRemove(friendId, $scope.friendList);
                // var len = $scope.friendList.length;
                // for(var i = 0; i < len; i++) {
                //     if($scope.friendList[i]._id === friendId) {
                //         $scope.friendList.splice(i,1);
                //         return data;
                //     }
                // }
            })
            .catch(function(res) {
                // console.log('an error was trown', res);
                if(res.data && res.data.message)
                {
                    $scope.errMsg = res.data.message;
                } else 
                {
                    console.error('Unprocessable server response', res);
                }
            });
    };

    /*
        Invoked when you accept a friend request
    */
    $scope.acceptFriend = function(friendId) {
        var myId = user._id;
        User
            .updateFriendList({id: myId}, {op: 'acceptFriendRequest', friendId: friendId})
            .$promise
            .then(function(data){
                var friendId = data._id;
                if(!friendId){ throw new Error('No friendId returned by server'); }

                //updat GUI
                //remove from friend requests
                findByIdAndRemove(friendId, $scope.friendRequests);
                // var len = $scope.friendRequests.length;
                // for(var i = 0; i < len; i++) {
                //     if($scope.friendRequests[i]._id === friendId)
                //     {
                //         $scope.friendRequests.splice(i, 1); 
                //         break;
                //     }
                // }

                //add to user list
                $scope.friendList.push(data);
            })
            .catch(function(res) {
                // console.log('an error was trown', res);
                if(res.data && res.data.message)
                {
                    $scope.errMsg = res.data.message;
                } else 
                {
                    console.error('Unprocessable server response', res);
                }
            });
    };

    $scope.rejectFriend = function(friendId) {
        var myId = user._id;
        User
            .updateFriendList({id: myId}, {op: 'rejectFriendRequest', friendId: friendId})
            .$promise
            .then(function(data) {

                //update GUI
                findByIdAndRemove(data.friendId, $scope.friendRequests);
            });
    };

    socket.on('friendRequest', function(data) {
        $scope.friendRequests.push(data);
    });
    /*
        ADDING/REMOVING CONTACTS code ends here.
    */


    /*
        GROUP MANAGEMENT code starts here
    */
    $scope.createGroup = function(form) {
        var myId = user._id;
        User
            .updateGroups({id: myId},{op:'create', name: $scope.groupName})
            .$promise
            .then(function(res) {
                //isma TODO, update view
                console.log('group created successfully', res);
            })
            .catch(function(res) {
                console.error('There was an error creating group: ', res.data.message);
            })
    }
    /*
        GROUP MANAGEMENT code ends here
    */





    /*
        CHATTING WITH PEOPLE code starts here
    */
    $scope.openChatPanel = function(friend) {
        //change the currentFriend, the <conversation> directive reacts to this change 
        $scope.currentFriend = friend;
    };

    $scope.onSendMessage = function(message, contentType) {
        if(false)
            return sendScribble();

        sendTextMessage(message, contentType);
    };

    
    function sendTextMessage(msg, contentType){
        //the message to be sent
        var aMessage = {
            message: msg,
            friendId: $scope.currentFriend._id,
            contentType: contentType,
            type: 'msg-out'
        };

        //save msg (the message to be displayed)
        conversationManager.saveMessage(aMessage, aMessage.friendId);


        //emit
        console.log('send message to: ', aMessage.to);
        socket.emit('new message', aMessage, function(error, message) {
            if(error) { return console.log(message);}
            //isma, TODO receives back a time-stamped message from server
            //you could implement something like sending/sent/received/visto
        });
    }

    function sendScribble(){
        //isma placeholder
        console.error('This functionalty is not available yet');
    }

    socket.on('new message', function(data){
        console.log('incoming message', data);
        var aMessage = {
            message: data.message,
            contentType: data.contentType,
            type: 'msg-in',
            friendId: data.friendId
        };
        conversationManager.saveMessage(aMessage, data.friendId);
    });

    //isma, todo: these listeners should be removed on logout
    $scope.$on('$destroy', function() {
        socket.removeListener('friendRequest');
        socket.removeListener('new message');
    });

  });
