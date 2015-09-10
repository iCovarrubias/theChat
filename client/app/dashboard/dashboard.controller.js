'use strict';

angular.module('theChatApp')
  .controller('DashboardCtrl', function ($scope, Auth, User, socket) {
    $scope.errMsg = '';
    var user = Auth.getCurrentUser();

    $scope.friendList = user.friends;
    
    $scope.user = user;

    $scope.addFriend = function(form){
    	var myId = Auth.getCurrentUser()._id;
        
    	User
            .addFriend({id: myId},{email: $scope.email}, 
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
        console.log("fid is:", friendId)
        for(var i=0; i < user.friends.length; i++) {
             if(user.friends[i]._id === friendId) {
                user.friends.splice(i, 1);
                break;
             }
        }
        console.log("saving", user);
        user.$update();
    }

    $scope.$on('$destroy', function() {
        socket.unsyncUpdates('user');
    });

  });
