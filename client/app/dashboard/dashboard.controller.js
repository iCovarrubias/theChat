'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, Auth, User, socket) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.friendList = user.friends;

    $scope.user = user;

    $scope.addFriend = function(form){
    	var myId = user._id;
        
        //Isma, this will be replace by socket functionality
    	User
            .updateFriendList({id: myId},{op:'add', email: $scope.email}, 
                function(friend) {
                    console.log('ok: ', user.friends);
                }, function(res) {
                    if(res.data.message)
                    {
                        $scope.errMsg = res.data.message;
                    }
                });
    };

    $scope.removeFriend = function(friendId) {
        //Isma, this will be replaced by socket listeners
        console.log("fid is:", friendId)
        for(var i=0; i < user.friends.length; i++) {
             if(user.friends[i]._id === friendId) {
                user.friends.splice(i, 1);
                break;
             }
        }
        console.log("removingFriend", friendId);
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
    function syncFriendList(socket, modelName, array, cb) {
        cb = cb || angular.noop;

        socket.on(modelName + ':addFriend', function(item){
            console.log("socketon:addFriend", item);
            // cb(event, item, array);
        });
        
    }
    function syncFriendRequests(socket, modelName, array, cb) {

    }

    syncFriendList(socket.socket, "user", $scope.friendList);


    $scope.$on('$destroy', function() {
        socket.socket.removeAllListeners('user:addFriend');
        // socket.socket.removeAllListeners('user:friendRequest')
    });

  });
