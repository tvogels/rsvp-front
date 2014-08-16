app.controller('HomeCtrl', function ($scope, $rootScope, $http, Auth) {

  $scope.formMode = 'register';
  $scope.formdata = {};
  $scope.errors = {};

  $scope.auth = Auth;

  $scope.submitForm = function (data) {
    $scope.errors = {};
    if ($scope.formMode === 'login') {
      Auth.login(data, function () {}, function () {
        data.password = '';
        $scope.errors.invalidLogin = true;
      });
    } else if ($scope.formMode === 'register') {
      Auth.register(data, function () {
      }, function () {
        $scope.errors.usernameInUse = true;
      });
    }
  };

  $scope.toggleForm = function () {
    $scope.errors = {};
    return $scope.formMode = {
      'register': 'login',
      'login': 'register'
    }[$scope.formMode];
  };
  $scope.panelTitle = function () {
    return {
      'register': 'Register to use RSVP',
      'login': 'Login to RSVP'
    }[$scope.formMode];
  };
  $scope.submitText = function () {
    return {
      'register': 'Register',
      'login': 'Login'
    }[$scope.formMode];
  };  
  $scope.switchText = function () {
    return {
      'register': 'login',
      'login': 'register'
    }[$scope.formMode];
  };
});
