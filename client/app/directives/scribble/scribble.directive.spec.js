'use strict';

describe('Directive: scribble', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/scribble/scribble.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<scribble></scribble>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the scribble directive');
  }));
});
