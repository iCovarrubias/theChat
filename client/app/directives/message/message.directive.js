'use strict';

/*
	A directive that represents a single message in a conversation, 
	attrs:
		type: msg-in or msg-out
		content: The message we want to display
*/
angular.module('theChatApp')
  .directive('message', function () {
    return {
      templateUrl: 'app/directives/message/message.html',
      restrict: 'E',
      // replace: true,
      // transclude: true,
      scope: {
        // type: "=",
        msg: "="
      },
      link: function (scope, element, attrs) {
        
        // console.log('in dirrective t', attrs.type);
        // scope.type = scope.type || 'msg-out';

      },
    };
  });
