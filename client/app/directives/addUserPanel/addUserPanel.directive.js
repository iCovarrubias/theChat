'use strict';

angular.module('theChatApp')
  .directive('addUserPanel', function (Auth, contactManager, socket) {
    return {
      templateUrl: 'app/directives/addUserPanel/addUserPanel.html',
      restrict: 'E',
      controller: function($scope, $element) {
      	$scope.contactInfo = null;
      	function finishAddContact() {
      		$scope.contactInfo = null;
	    	$scope.$emit("switchContactsMainView", "contacts");
	    	$scope.errorMsg = "";
      	}

      	$scope.queryContact = function(form) {
      		contactManager.getContactInfoByEmail($scope.email)
      			.then(function(res) {
      				// console.log('getContactInfoBy res:', res);
      				//update panel to show the user information and the buttons Add/Cancel
      				$scope.contactInfo = res;
      				
      				$element.find('.add-user-pannel-avatar').css({
      					'background-image': 'url("'  + '../../../assets/images/placeholder.png' + '")'
      				})
      				$scope.errorMsg = "";
      			})
      			.catch(function(res) {
      				if(res.data.message)
					{
						$scope.errorMsg = res.data.message;
					}
      			});
      	};

      	$scope.addFriend = function(contactInfo) {
      		var user = Auth.getCurrentUser();
			contactManager.saveContact(contactInfo)
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
					finishAddContact();
				})
				.catch(function(res) {
					if(res.data.message)
					{
						$scope.errorMsg = res.data.message;
					}
				});
		};

      		

	    $scope.cancelAddFriend = function() {
	    	finishAddContact();
	    };
      },
      link: function (scope, element, attrs) {
      }
    };
  });
