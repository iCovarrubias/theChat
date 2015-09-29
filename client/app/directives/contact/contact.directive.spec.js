'use strict';

describe('Directive: contact', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/contact/contact.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<contact></contact>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the contact directive');
  }));
});
