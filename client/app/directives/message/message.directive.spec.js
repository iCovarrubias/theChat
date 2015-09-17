'use strict';

describe('Directive: message', function () {

  // load the directive's module
  beforeEach(module('theChatApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<message></message>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the message directive');
  }));
});
