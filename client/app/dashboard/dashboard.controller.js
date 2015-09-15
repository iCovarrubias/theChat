'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, Auth, User, socket) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.friendList = user.friends;
    $scope.friendRequests = user.friendRequests;

    $scope.user = user;

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
                $scope.errMsg = "";
                $scope.email = "";
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
                if(!friendId) throw new Error("No friendId returned by server");

                var len = $scope.friendList.length;
                for(var i = 0; i < len; i++) {
                    if($scope.friendList[i]._id === friendId) {
                        $scope.friendList.splice(i,1);
                        return data;
                    }
                }
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
            })
    };

    /*
        Invoked when you accept a friend request
    */
    $scope.acceptFriend = function(friendId) {
        var myId = user._id;
        console.log('Accept Friend', friendId);

        User
            .updateFriendList({id: myId}, {op: 'acceptFriendRequest', friendId: friendId})
            .$promise
            .then(function(data){
                var friendId = data._id;
                if(!friendId) throw new Error("No friendId returned by server");

                //updat GUI
                //remove from friend requests
                var len = $scope.friendRequests.length;
                for(var i = 0; i < len; i++) {
                    if($scope.friendRequests[i]._id === friendId)
                    {
                        $scope.friendRequests.splice(i, 1); 
                        break;
                    }
                }
                
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
    }

    /*
     * Extend socket functionality 
     */
    // function syncFriendList(socket, modelName, array, cb) {
    //     cb = cb || angular.noop;

    //     socket.on(modelName + ':addFriend', function(item){
    //         console.log("socketon:addFriend", item);
    //         // cb(event, item, array);
    //     });
        
    // }
    // function syncFriendRequests(socket, modelName, array, cb) {

    // }

    /*
        Receives a friend request
    */
    socket.on('friendRequest', function(data) {
        console.log('friendRequest', data);
        console.log("[%s] %s Wants to be your friend", data.email, data.name);
        $scope.friendRequests.push(data);

    });

    $scope.$on('$destroy', function() {
        socket.removeListener('friendRequest');
        // socket.socket.removeAllListeners('user:addFriend');
        // socket.socket.removeAllListeners('user:friendRequest')
    });

  });
