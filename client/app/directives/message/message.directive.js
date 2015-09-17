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
      template: '<div class="msg">\
						<div ng-class="type">\
							<span class="msg-content" ng-transclude></span>\
						</div>\
					</div>',
      restrict: 'E',
      transclude: true,
      scope: {
        type: "="
      },
      link: function (scope, element, attrs) {
        
        // console.log('in dirrective t', attrs.type);
        scope.type = scope.type || 'msg-out';

      },
    };
  });
