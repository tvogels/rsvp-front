app.controller('NewAnalysisCtrl', function ($scope, serotypes, referenceSets, frequencySets, Analysis) {

  $scope.analysis = new Analysis;
  $scope.serotypes = serotypes;
  $scope.referenceSets = referenceSets;
  $scope.frequencySets = frequencySets;

});
