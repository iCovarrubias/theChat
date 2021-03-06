'use strict';

describe('Directive: match', function () {

  // load the directive's module
  beforeEach(module('theChatApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<match></match>');
    element = $compile(element)(scope);
    expect(element.text()).to.equal('this is the match directive');
  }));
});
