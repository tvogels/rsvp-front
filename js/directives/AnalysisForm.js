app.directive('analysisForm', function () {
  return {
    restrict: 'A',
    templateUrl: '/js/views/analysis.form.html',
    scope: {
      'analysis': '=',
      'serotypes': '=',
      'frequencySets': '=',
      'referenceSets': '='
    },
    link: function (scope) {
      scope.showStep3 = false;
    },
    controller: function ($scope) {
      $scope.reset = function () {
        $scope.analysis.data = [];
        $scope.analysis.serotypes = [];
        $scope.analysis.frequencies = {};
        $scope.analysis.frequencySet = null;
        $scope.showStep3 = false;
      };
      $scope.$watch('analysis.frequencySet', function (set) {
        if (set !== null) {
          $scope.analysis.frequencySet = null;
          for (var i = set.hasSerotypes.length - 1; i >= 0; i--) {
            var st = set.hasSerotypes[i];
            if ($scope.analysis.serotypes.indexOf(st) !== -1) {
              $scope.analysis.frequencies[st] = set.frequencies[st];
            }
          };
        };
      });
      $scope.$watch('analysis.frequencies', function (freq) {
        if (Object.keys(freq).length > 0) {
          $scope.showStep3 = true;
        }
      },true);

      $scope.frequenciesValid = function () {
        for (var i = $scope.analysis.serotypes.length - 1; i >= 0; i--) {
          var st = $scope.analysis.serotypes[i];
          if (!isNumeric($scope.analysis.frequencies[st])) {
            return false;
          }
        };
        if ($scope.analysis.serotypes.length === 0) {
          return false;
        };
        return true;
      };

      $scope.dataValid = function () {

      };
    }
  };
});