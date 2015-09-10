'use strict';

describe('Directive: login', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/account/login/login.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<login></login>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the login directive');
  }));
});
