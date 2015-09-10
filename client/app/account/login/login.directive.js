'use strict';

angular.module('theChatApp')
  .directive('login', function () {
    return {
      templateUrl: 'app/account/login/login.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
      },
      controller: 'LoginCtrl'
    };
  });
