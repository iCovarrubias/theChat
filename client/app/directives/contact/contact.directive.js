'use strict';

angular.module('theChatApp')
  .directive('contact', function () {
    return {
      templateUrl: 'app/directives/contact/contact.html',
      restrict: 'E',
      // replace: true,
      scope: {
      	contactInfo: "="
      },
      link: function (scope, element, attrs) {
        if(angular.isDefined(attrs.noOkBtn)) {
          element.find('.contact-btn-ok').remove();
        }
        if(angular.isDefined(attrs.noCancelBtn)) {
          element.find('.contact-btn-cancel').remove();
        }

      	scope.removeFriend = function(contact) {
      		scope.$emit('contact element removed', scope, element, contact);
      	}

        scope.acceptFriend = function(contact) {
          scope.$emit('contact ok', element, contact);
        }

      	scope.selectContact= function(contact) {
      		// contactsMainCtrl.openChatPanel(contact);
          scope.$emit('contact selected', contact);
      	}
      }
    };
  });

