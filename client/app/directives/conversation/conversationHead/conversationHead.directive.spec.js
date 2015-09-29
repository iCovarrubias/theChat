'use strict';

describe('Directive: conversationHead', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/conversation/conversationHead/conversationHead.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<conversation-head></conversation-head>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the conversationHead directive');
  }));
});
