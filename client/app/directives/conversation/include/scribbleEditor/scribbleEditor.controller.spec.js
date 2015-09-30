'use strict';

describe('Controller: ScribbleEditorCtrl', function () {

  // load the controller's module
  beforeEach(module('theChatApp'));

  var ScribbleEditorCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScribbleEditorCtrl = $controller('ScribbleEditorCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
