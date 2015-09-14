'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, Auth, User, socket) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.friendList = user.friends;

    $scope.user = user;

    // socket.onFriendListUpdate(function(evt,data) {
    //     console.log('cb', evt);
    // });

    $scope.addFriend = function(form){
    	var myId = user._id;
        
        //Isma, this will be replace by socket functionality
    	User
            .updateFriendList({id: myId},{op:'add', email: $scope.email}, 
                function(friend) {
                    console.log('ok: ',friend);
                    socket.emit('friendRequest', 
                        {
                            fid: friend._id,
                            userData: { //my data
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
                }, function(res) {
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
                console.log('remove finished with: ', data)
            }).catch(function(res) {
                if(res.data.message)
                {
                    $scope.errMsg = res.data.message;
                }
            })
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

    // syncFriendList(socket.socket, "user", $scope.friendList);
    socket.on('friendRequest', function(data) {
        console.log('friendRequest', data);
        console.log("[%s] %s Wants to be your friend", data.email, data.name);
    });

    $scope.$on('$destroy', function() {
        socket.removeListener('friendRequest');
        // socket.socket.removeAllListeners('user:addFriend');
        // socket.socket.removeAllListeners('user:friendRequest')
    });

  });
