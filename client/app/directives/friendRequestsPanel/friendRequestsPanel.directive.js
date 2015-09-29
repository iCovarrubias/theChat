'use strict';

angular.module('theChatApp')
  .directive('friendRequestsPanel', function (contactManager) {
    return {
      templateUrl: 'app/directives/friendRequestsPanel/friendRequestsPanel.html',
      restrict: 'E',
      scope: {},
      controller: function($scope) {
    		
        $scope.$on('contact element removed', function(event, element, contact) {
    			event.stopPropagation();
    			contactManager.rejectFriendRequest(contact)
    				.then(function() {
    					element.remove();
    				})
    				.catch(function(err) {
    					console.error('something went wrong while rejecting friend', contact._id);
    				});
    		});

        $scope.$on('contact ok', function(event, element, contact) {
          event.stopPropagation();
          contactManager.acceptFriendRequest(contact)
            .then(function() {
              $scope.friendRequests = contactManager.getFriendRequests();
            });
        });

      },
      link: function (scope, element, attrs) {
      	scope.friendRequests = contactManager.getFriendRequests();
        scope.$on('new friend request', function(event, friend) {
          element.find('contacts-panel')
            .append(contactManager.createContactElement(scope, friend));
        });
      }
    };
  });
