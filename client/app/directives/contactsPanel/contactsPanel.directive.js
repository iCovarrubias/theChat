'use strict';

angular.module('theChatApp')
  .directive('contactsPanel', function (contactManager) {
    function createContacts(scope, contactsPanel, contacts) {
      if(contacts && contacts.length) {
        for(var i = 0; i < contacts.length; i++) {
          var contactElem = contactManager.createContactElement(scope, contacts[i]);

          contactsPanel.append(contactElem);
        }
      }
    }

    return {
      // templateUrl: 'app/directives/contactsPanel/contactsPanel.html',
      restrict: 'E',
      scope: {
        contactList: "=",
        noCancelBtn: "@",
        noOkBtn: "@"
      },
      link: function (scope, element, attrs) {
     	  var contactsPanel = element;
        var watchContactListFn = null;

        //isma, had to do this ugly hack because we don't have the contactList 
        //until the parent is linked, and I don't want to use pre-linking in all parents
        //that use this directive
        // if(scope.contactList) {
        //   createContacts(scope, contactsPanel, scope.contactList)
        // } else {
          watchContactListFn = 
          scope.$watchCollection('contactList', function(contactList) {
            if(contactList) {
              contactsPanel.empty();//re-create, like ng-repeat
              createContacts(scope, contactsPanel, contactList);
              // watchContactListFn(); //remove watch
            }
          });
        // }
     


        scope.$on('contact element removed', function(event, friend) {
          //attach panelId and propagate
          if(attrs['panelId']) {
            event.panelId = attrs['panelId'];
          }
      	});

        
        
      }
    };
  });
