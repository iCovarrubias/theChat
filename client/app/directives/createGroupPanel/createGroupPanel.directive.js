'use strict';

angular.module('theChatApp')
  .directive('createGroupPanel', function (contactManager, socket) {
    //helper, remove friend from array
    function removeFromArray(friend, arr) {
      var friendId = friend._id;
      if(arr) {
        for(var i=0; i < arr.length; i++) {
          var id = arr[i]._id;
          if(friendId === id)
          {
            arr.splice(i, 1);
            return;
          }
        }
      }
    }

    return {
      templateUrl: 'app/directives/createGroupPanel/createGroupPanel.html',
      restrict: 'E',
      scope: {},
      controller: function ($scope, socket) {
        $scope.friendList = contactManager.getContacts('friends');
        $scope.selectedContacts = [];
      	$scope.showContactList = false;

      	$scope.setGroupName = function() {
      		$scope.showContactList = !!$scope.groupName;
      	};

        $scope.createGroup = function() {
          //create the group
          contactManager.createGroup($scope.groupName, $scope.selectedContacts)
            .then(function(group){
              //emit a add to group event
              
              socket.emit('addedToGroup', group);
              //go back
              $scope.$emit("switchContactsMainView", "contacts");
            });
        };

        // $scope.$on('contact ok' , function(event, contact) {
        //   event.stopPropagation();
        // });

        $scope.$on('contact selected', function(event, contact) {
          event.stopPropagation();
          //don't add if its repeated
          var contactExists = false;
          for(var i=0; i<$scope.selectedContacts.length; i++) {
            if($scope.selectedContacts[i]._id === contact._id)
            {
              contactExists = true;
              break;
            }
          }
          if(!contactExists){
            $scope.selectedContacts.push(contact);
          }
        });


        $scope.$on('contact element removed', function(event, element, friend) {
          if(event.panelId === 'selectedContacts') {
            removeFromArray(friend, $scope.selectedContacts);
            element.remove();
          }
          event.stopPropagation();
        });

      },
      link: function(scope, element, attrs) {
      }
    };
  });
