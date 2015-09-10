'use strict';

angular.module('theChatApp')
  .directive('loginSocial', function () {
    return {
      templateUrl: 'app/account/login/loginSocial/loginSocial.html',
      restrict: 'E',
      link: function (scope, element, attrs) {
      },
      controller: 'LoginCtrl'
    };
  });
