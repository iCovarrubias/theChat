'use strict';

angular.module('theChatApp')
  .directive('conversationHead', function (contactManager) {
    return {
      templateUrl: 'app/directives/conversation/conversationHead/conversationHead.html',
      restrict: 'E',
      // scope: true,
      link: function (scope, element, attrs) {
      	
      }
    };
  });
