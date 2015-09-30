'use strict';

angular.module('theChatApp')
  .directive('scribble', function () {
    return {
      templateUrl: 'app/directives/scribble/scribble.html',
      restrict: 'E',
      scope: {
      	msg:'='
      },
      link: function (scope, element, attrs) {
      	element.find('img').attr('src', scope.msg.message); 
      }
    };
  });
