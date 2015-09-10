'use strict';

/*
	A directive that checks if two elements match:
*/
angular.module('theChatApp')
  .directive('match', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
      		if(!attrs.match) {
      			return;
      		}
        	function validateEqual(myValue){

				//myValue is this directive's value
				var otherValue = scope.$eval(attrs.match); 
				var valid = (myValue == otherValue);

				ngModelCtrl.$setValidity('match',valid);
				//err message handling
				return valid? myValue: undefined;
			}

        	ngModelCtrl.$parsers.push(validateEqual);
      		ngModelCtrl.$formatters.push(validateEqual);

   //    		scope.$watch(attrs.ngModel, function() {
			// 	validateEqual(ngModelCtrl.$viewValue);
			// });

			scope.$watch(attrs.match, function() {
      			// console.log('watching',ngModelCtrl.$viewValue);
				// ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue);
				validateEqual(ngModelCtrl.$viewValue);
			});
      }
    };
  });
