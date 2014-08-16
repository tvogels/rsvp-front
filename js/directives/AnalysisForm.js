app.directive('analysisForm', function (Analysis, $rootScope) {

  function bindFrequencyPreset(scope, set) {
    if (isDefined(set) && set !== null) {
      scope.frequencyPreset = null;
      scope.analysis.useFrequencyPreset(set);
    }
  }

  function reset(scope, to) {
    scope.analysis.reset();
  }

  return {

    scope: {
      'analysis': '=',
      'frequencySets': '=',
      'referenceSets': '='
    },

    templateUrl: '/js/views/analysis.form.html',

    link: function (scope) {
      scope.frequencyPreset = null;
      scope.resetSingle = false;
    },

    controller: function ($scope) {
      $scope.reset = reset.bind(null, $scope);
      // frequency preset selection
      $scope.bindFrequencyPreset = bindFrequencyPreset.bind(null, $scope);

      // controlling the current step
      $scope.step = 1;
      $scope.$watch('analysis.data', function () {
        var valid = $scope.analysis.dataValid();
        if($scope.step < 2 && valid) {
          $scope.step = 2;
        } else if (!valid) {
          $scope.step = 1;
        }
      }, true);
      $scope.$watch('analysis.frequencies', function () {
        var valid = $scope.analysis.frequenciesValid();
        if($scope.step < 3 && valid) {
          $scope.step = 3;
        } else if (!valid) {
          $scope.step = Math.min($scope.step, 2);
        }
      }, true);
    }

  };
});
