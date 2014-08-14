app.factory('Auth', function($http, $q){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = { username: '', role: userRoles.public, loaded: false };

    function changeUser(user) {
        angular.extend(currentUser, user);
        currentUser.loaded = true;
    }

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined) {
                role = currentUser.role;
            }

            return accessLevel.bitMask & role.bitMask;
        },
        userDeferred: function () {
            var self = this;
            var deferred = $q.defer();
            if (this.user.loaded) {
                deferred.resolve(self.user);
            } else {
                this.loadMe().then(function () {
                    deferred.resolve(self.user);
                });
            }
            return deferred.promise;
        },
        isLoggedIn: function() {
            return this.user.role.title === userRoles.user.title || this.user.role.title === userRoles.admin.title;
        },
        loadMe: function () {
            return $http.get('/users/me').then(function (a) {
                changeUser(a.data);
                return a.data;
            });
        },
        isLoggedInDeferred: function() {
            var self = this;
            return this.userDeferred().then(function () {
                return self.isLoggedIn();
            });
        },
        register: function(user, success, error) {
            var self = this;
            $http.post('/users', user).success(function(res) {
                self.login(user, function () {
                    return self.loadMe().then(function () {
                        success(res.data);
                    }); 
                });
            }).error(error);
        },
        login: function(user, success, error) {
            var self = this;
            $http.post('/users/login', user).success(function(res){
                return self.loadMe().then(function () {
                    success(res.data);
                });
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/users/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public,
                    loaded: true,
                    email: '',
                    organization: ''
                });
            }).error(error);
        },
        authorizePromise: function (role) {
            var self = this;
            return this.userDeferred().then(function () {
                var deferred = $q.defer();
                if (self.authorize(role)) {
                  deferred.resolve(true);
                } else {
                  deferred.reject(true);
                }
                return deferred.promise;
            });
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});