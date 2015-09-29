'use strict';

describe('Directive: contactsMain', function () {

  // load the directive's module and view
  beforeEach(module('theChatApp'));
  beforeEach(module('app/directives/contactsMain/contactsMain.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<contacts-main></contacts-main>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).to.equal('this is the contactsMain directive');
  }));
});
