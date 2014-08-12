app.factory('AuthService', function ($http, Session, $q) {
  var authService = {
    currentUser: null
  };

  authService.setCurrentUser = function (user) {
    authService.currentUser = user;
  };

  authService.getMe = function () {
    var deferred = $q.defer();
    $http.get('/users/me').then(function (res) {
      if (res.status === 204) {
        deferred.resolve(null);
      } else {
        deferred.resolve(res.data);
      }
    }, function () {
      deferrred.resolve(null);
    });
    return deferred.promise;
  };
 
  authService.login = function (credentials) {
    return $http
      .post('/users/login', credentials)
      .then(function (res) {
        Session.create(res.id, res.uid, 'user');
        return $http.get('/users/me').then(function (res) {
          return res.data;
        });
      });
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };

  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authorizedRoles.indexOf(Session.userRole) !== -1);
  };

  authService.logout = function () {
    return $http.get('/users/logout').then(function () {
      Session.destroy();
      authService.setCurrentUser(null);
    });
  };
 
  return authService;
});
