'use strict';

angular.module('theChatApp')
  .controller('ScribbleEditorCtrl', function ($scope, $modalInstance) {
    $scope.message = 'Hello';
	$scope.myColor = '#000';

    $scope.ok = function (event) {
      var theCanvas = angular.element(event.target).find('canvas')[0];
      $modalInstance.close(theCanvas.toDataURL());
      // console.warn('WIP: can now obtain the canvas!');
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.pickColor = function() {
      console.warn('WIP: open color picker!');
    };
  });

