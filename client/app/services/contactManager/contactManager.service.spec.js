'use strict';

describe('Service: contactManager', function () {

  // load the service's module
  beforeEach(module('theChatApp'));

  // instantiate service
  var contactManager;
  beforeEach(inject(function (_contactManager_) {
    contactManager = _contactManager_;
  }));

  it('should do something', function () {
    expect(!!contactManager).to.be.true;
  });

});
