'use strict';

describe('Directive: createGroupPanel', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/createGroupPanel/createGroupPanel.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<create-group-panel></create-group-panel>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the createGroupPanel directive');
  }));
});
