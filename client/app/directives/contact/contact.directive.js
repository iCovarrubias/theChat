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
      		scope.$emit('contact element removed', element, contact);
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


/* REMOVE FRIEND
if(contact.members) {
            contactManager.leaveGroup(contact) 
              .then(function(data) {
                element.remove();                
              })
              .catch(function(res) {
                if(res.data && res.data.message)
                {
                  scope.errMsg = res.data.message;
                } else 
                {
                  console.error('Unprocessable server response', res);
                }
              });
          } else {
            console.error('we should not call contact manager from here, this directive')
            console.error('must only remove itself and emit, the contacts panel or someone else')
            console.error('should be responsible for the contacts persistence')
            contactManager.removeContact(contact)
            .then(function(){
              element.remove();
            })
            .catch(function(res) {
              // console.log('an error was trown', res);
              if(res.data && res.data.message)
              {
                scope.errMsg = res.data.message;
              } else 
              {
                console.error('Unprocessable server response', res);
              }
            });
          }
*/