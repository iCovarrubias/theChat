'use strict';

describe('Service: conversationManager', function () {

  // load the service's module
  beforeEach(module('theChatApp'));

  // instantiate service
  var conversationManager;
  beforeEach(inject(function (_conversationManager_) {
    conversationManager = _conversationManager_;
  }));

  it('should do something', function () {
    expect(!!conversationManager).to.be.true;
  });

});
