app.directive('loginDialog', function (AUTH_EVENTS) {
  return {
    restrict: 'A',
    template: '<div ng-if="visible" \
                    ng-include="\'/js/views/loginDialog.html\'">',
    link: function (scope) {
      var showDialog = function () {
        scope.visible = true;
      };
      var hideDialog = function () {
        scope.visible = false;
      };
      var hasErrors = function () {
        scope.invalidCredentials = true;
      };
  
      scope.visible = false;
      scope.invalidCredentials = false;
      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog);
      scope.$on(AUTH_EVENTS.loginSuccess, hideDialog);
      scope.$on(AUTH_EVENTS.loginFailed, hasErrors);
    }
  };
});