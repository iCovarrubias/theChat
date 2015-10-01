'use strict';

angular.module('theChatApp')
  .directive('contact', function () {
    return {
      templateUrl: 'app/directives/contact/contact.html',
      restrict: 'E',
      // replace: true,
      scope: {
      	contactInfo: "=",
        options: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('options', function(){
          if(scope.options === undefined) { return; }
          if(scope.options.noOkBtn) {
            element.find('.contact-btn-ok').remove();
          }

          if(scope.options.noCancelBtn) {
            element.find('.contact-btn-cancel').remove();
          }

          if(scope.options.noOptionsBtn) {
            element.find('.contact-btn-options').remove();
          }
        }, true);

        if(angular.isDefined(attrs.noOkBtn)) {
          element.find('.contact-btn-ok').remove();
        }
        if(angular.isDefined(attrs.noCancelBtn)) {
          element.find('.contact-btn-cancel').remove();
        }
        if(angular.isDefined(attrs.noOptionsBtn)) {
          element.find('.contact-btn-options').remove();
        }

        

      	scope.removeFriend = function(contact) {
      		scope.$emit('contact element removed', scope, element, contact);
      	}

        scope.acceptFriend = function(contact) {
          scope.$emit('contact ok', element, contact);
        }

      	scope.selectContact= function(contact) {
      		// contactsMainCtrl.openChatPanel(contact);
          scope.$emit('contact selected', scope, element, contact);
      	}

        scope.clickedOptions = function(contact) {
          scope.$emit('contact options', scope, element, contact);
        }
      }
    };
  });

