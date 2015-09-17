'use strict';

angular.module('theChatApp')
  .directive('conversation', function () {
    return {
      templateUrl: 'app/directives/conversation/conversation.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });
