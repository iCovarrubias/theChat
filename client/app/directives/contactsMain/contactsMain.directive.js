'use strict';

angular.module('theChatApp')
  .directive('contactsMain', function (contactManager) {
   

    //directive definition object
    return {
      templateUrl: 'app/directives/contactsMain/contactsMain.html',
      restrict: 'E',
      scope: {},
      controller: function($scope, contactManager) {
        var viewUrls = { 
          contacts:     'app/directives/contactsMain/include/contactsPanelContainer.html',
          addUser:      'app/directives/contactsMain/include/addUserPanelContainer.html',
          createGroup:  'app/directives/contactsMain/include/createGroupPanelContainer.html',
          friendRequests:  'app/directives/contactsMain/include/friendRequestsContainer.html'
        };
      	$scope.view = null;
        $scope.viewUrl = null;
        // $scope.friendList = contactManager.getContacts();

        /*
          Changes what's included in ng-view, we can also change the current view
          with scope event 'switchContactsMainView'
          accepted parameters: "contacts", "addUser", "createGroup"
        */
      	$scope.switchView = function(menu) {
          $scope.friendList = contactManager.getContacts();
      		$scope.view    = menu;
          $scope.viewUrl = viewUrls[menu];
      	};

  
        //initialize, the default view is contacts
        $scope.switchView('contacts');

        $scope.$on('contact selected', function(event, contact) {
          $scope.$emit('openChatPanel', contact);
        });

        $scope.$on('contact element removed' , function(event, childScope,  element, contact) {
          if(contact.members) {
            contactManager.leaveGroup(contact)
              .then(function(){
                childScope.$destroy();
                element.remove();
              });
          } else {
            contactManager.removeContact(contact)
              .then(function() {
                childScope.$destroy();
                element.remove();
              })
          }
        }); 

      },//controller function END
      link: function(scope, element, attrs) {
        scope.$on('switchContactsMainView', function(event, menu) {
          //ask for the friend list again

          scope.switchView(menu);
        });

        scope.friendList = contactManager.getContacts();
        scope.friendRequests = contactManager.getFriendRequests();
        
        // scope.$on('new friend request', function(event, friendInfo) {
          // scope.friendRequests++;
        // });

        scope.$on('added to group', function(event, friend) {
          scope.friendList = contactManager.getContacts();
          // element.find('contacts-panel')
            // .append(contactManager.createContactElement(scope, friend));
        });

      }
    };
  });
