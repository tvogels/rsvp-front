app.directive('analysisForm', function (Analysis, ReferenceSet, ReferenceSetRepo, $rootScope) {

  function bindFrequencyPreset(scope, set) {
    if (isDefined(set) && set !== null) {
      scope.frequencyPreset = null;
      scope.analysis.useFrequencyPreset(set);
    }
  }

  function reset(scope, to) {
    scope.analysis.reset();
  }

  function saveRefSet(scope, set) {
    return set.computeStatistics()
      .then(function (set) {
        if (scope.analysis.hasSerotypes.diff(set.hasSerotypes).length === 0 || 
            confirm('Your reference set does not contain all serotypes that are in your analysis? Do you want to proceed?')
           ) {
          return ReferenceSetRepo
            .save(set)
            .then(function (set) {
              scope.referenceSets.unshift(set);
              scope.analysis.referenceSet = set;
              scope.newRefSet = new ReferenceSet;
              scope.newRefSet.label = "...";
              scope.refTabs[0].active = true;
            });
        } else {
          return false;
        }
      })
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
      scope.newRefSet = new ReferenceSet;
      scope.refTabs = [
        {title:'Select preset', content: ''},
        {title:'Upload your own data', content: ''}
      ];
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

      $scope.saveRefSet = saveRefSet.bind(null, $scope);
    }

  };
});
