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
      scope: {
        currentGroup: '='
      },
      controller: function ($scope, socket) {
        $scope.friendList = contactManager.getContacts('friends');
        $scope.selectedContacts = [];
      	$scope.showContactList = false;

      	$scope.setGroupName = function() {
      		$scope.showContactList = !!$scope.groupName;
      	};

        $scope.createGroup = function() {
          if($scope.isEditGroup) {
            //create the group
            contactManager.addContactsToGroup($scope.currentGroup, $scope.selectedContacts)
              .then(function(group){
                //emit a add to group event
                
                socket.emit('addedToGroup', group);
                //go back
                $scope.$emit("switchContactsMainView", "contacts");
              });
          } else {
            //create the group
            contactManager.createGroup($scope.groupName, $scope.selectedContacts)
              .then(function(group){
                //emit a add to group event
                
                socket.emit('addedToGroup', group);
                //go back
                $scope.$emit("switchContactsMainView", "contacts");
              });
          }
            
        };

        // $scope.$on('contact ok' , function(event, contact) {
        //   event.stopPropagation();
        // });

        $scope.$on('contact selected', function(event, childScope, element, contact) {
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
            if($scope.currentGroup) {
              //isma attach an extra property to pass options
              //this is deleted later on the contactManager              
              contact._tmp_opts = childScope.options?childScope.options:{}; 
              contact._tmp_opts.noCancelBtn = false;
              // console.log('contact tmp', contact._tmp_opts);
            }
            
            $scope.selectedContacts.push(contact);
            // if(childScope.options) {
            //   console.log('contact options', childScope.options);
            //   childScope.options = { noCancelBtn: false };
            // }
          }
        });


        $scope.$on('contact element removed', function(event, childScope, element, friend) {
          if(event.panelId === 'selectedContacts') {
            removeFromArray(friend, $scope.selectedContacts);
            childScope.$destroy();
            element.remove();
          }
          event.stopPropagation();
        });

        

      },
      link: function(scope, element, attrs) {
        scope.selectedContactsOpts = {noOkBtn: true};
        var currentGroup = scope.currentGroup;
        if(currentGroup) {
          scope.isEditGroup = true;
          scope.groupName = currentGroup.name;
          scope.showContactList = true;
          scope.selectedContacts = currentGroup.members;
          scope.selectedContactsOpts.noCancelBtn = true;
          scope.selectedContactsOpts.noOkBtn = true;
        }
      }
    };
  });
