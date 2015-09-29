'use strict';

describe('Directive: addUserPanel', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/addUserPanel/addUserPanel.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<add-user-panel></add-user-panel>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the addUserPanel directive');
  }));
});
