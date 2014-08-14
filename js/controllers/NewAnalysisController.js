app.controller('NewAnalysisCtrl', function ($scope, serotypes, referenceSets, frequencySets) {

  $scope.analysis = {
    'data': [],
    'serotypes': [],
    'frequencies': {},
    'frequencySet': null
  };
  $scope.serotypes = serotypes;
  $scope.referenceSets = referenceSets;
  $scope.frequencySets = frequencySets;


});
