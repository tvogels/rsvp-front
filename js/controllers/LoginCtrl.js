app.controller('LoginCtrl', function ($scope, $rootScope) {
  $scope.credentials = {
    username: '',
    password: ''
  };
  $scope.login = function (credentials, Auth) {
    Auth.login(credentials).then(function (user) {
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      AuthService.setCurrentUser(user);
      DesiredRoute.go();
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };
});
