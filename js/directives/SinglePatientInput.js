
app.directive('singlePatientInput', function () {
  return {
    'scope': {
      'data': '=',
      'variables': '=',
      'serotypes': '='
    },
    'templateUrl': "/js/views/single-patient-input.html",
    'link': function (scope, element) {
      scope.patient = {};
      scope.data = [scope.patient];
      scope.newvar = {};
    },
    'controller': function ($scope) {
      $scope.createNew = function (newvar) {
        if ($scope.variables.indexOf(newvar.serotype) !== -1) {
          return alert('You already entered serotype '+newvar.serotype+'.');
        }
        console.log(newvar.serotype);
        if (typeof newvar.serotype === 'undefined' || newvar.serotype === null) {
          return alert('Please choose a serotype');
        }
        newvar.response = parseFloat(newvar.response);
        $scope.variables.push(newvar.serotype);
        $scope.patient[newvar.serotype] = newvar.response;
        // reset
        $scope.new = {'serotype': null, 'response': ''};
        $scope.form.$setPristine();
        document.getElementById('select-serotype').focus();
      };
      $scope.removeSerotype = function (st) {
        var array = $scope.variables;
        var index = array.indexOf(st);
        if (index > -1) {
          array.splice(index, 1);
          delete $scope.data[st];
        };
      };
    }
  };
});
