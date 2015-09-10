'use strict';

describe('Directive: logSocial', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/account/login/logSocial/logSocial.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<log-social></log-social>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the logSocial directive');
  }));
});
