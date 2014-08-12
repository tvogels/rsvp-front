app.controller('NewAnalysisCtrl', function ($scope, serotypes, referenceSets, frequencySets) {

  $scope.analysis = {
    'type': 'single',
    'data': [],
    'serotypes': []
  };
  $scope.serotypes = serotypes;
  $scope.referenceSets = referenceSets;
  $scope.frequencySets = frequencySets;


});
