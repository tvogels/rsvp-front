app.directive('analysisForm', function (AUTH_EVENTS) {
  return {
    restrict: 'A',
    templateUrl: '/js/views/analysis.form.html',
    scope: {
      'analysis': '=',
      'serotypes': '='
    },
    link: function (scope) {
      
    }
  };
});