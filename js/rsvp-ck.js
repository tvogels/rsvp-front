(function(exports){

    var config = {

        /* List all the roles you wish to use in the app
        * You have a max of 31 before the bit shift pushes the accompanying integer out of
        * the memory footprint for an integer
        */
        roles :[
            'public',
            'user',
            'admin'],

        /*
        Build out all the access levels you want referencing the roles listed above
        You can use the "*" symbol to represent access to all roles.

        The left-hand side specifies the name of the access level, and the right-hand side
        specifies what user roles have access to that access level. E.g. users with user role
        'user' and 'admin' have access to the access level 'user'.
         */
        accessLevels : {
            'public' : "*",
            'anon': ['public'],
            'user' : ['user', 'admin'],
            'admin': ['admin']
        }

    }

    exports.userRoles = buildRoles(config.roles);
    exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

    /*
        Method to build a distinct bit mask for each role
        It starts off with "1" and shifts the bit to the left for each element in the
        roles array parameter
     */

    function buildRoles(roles){

        var bitMask = "01";
        var userRoles = {};

        for(var role in roles){
            var intCode = parseInt(bitMask, 2);
            userRoles[roles[role]] = {
                bitMask: intCode,
                title: roles[role]
            };
            bitMask = (intCode << 1 ).toString(2)
        }

        return userRoles;
    }

    /*
    This method builds access level bit masks based on the accessLevelDeclaration parameter which must
    contain an array for each access level containing the allowed user roles.
     */
    function buildAccessLevels(accessLevelDeclarations, userRoles){

        var accessLevels = {};
        for(var level in accessLevelDeclarations){

            if(typeof accessLevelDeclarations[level] == 'string'){
                if(accessLevelDeclarations[level] == '*'){

                    var resultBitMask = '';

                    for( var role in userRoles){
                        resultBitMask += "1"
                    }
                    //accessLevels[level] = parseInt(resultBitMask, 2);
                    accessLevels[level] = {
                        bitMask: parseInt(resultBitMask, 2)
                    };
                }
                else console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'")

            }
            else {

                var resultBitMask = 0;
                for(var role in accessLevelDeclarations[level]){
                    if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role]))
                        resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask
                    else console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
                }
                accessLevels[level] = {
                    bitMask: resultBitMask
                };
            }
        }

        return accessLevels;
    }

})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);

/* **********************************************
     Begin rsvp.js
********************************************** */

var app = angular.module('rsvpApp', ['ui.router','ui.bootstrap','ngCookies']);

app.config(function($stateProvider, $urlRouterProvider, $logProvider) {
  
  var access = routingConfig.accessLevels;

  // Public routes
  $stateProvider
    .state('public', {
      abstract: true,
      template: "<ui-view/>",
      data: {
        access: access.public
      },
      resolve: {
        'loadedAuth': function (Auth) {
          return Auth.userDeferred();
        }
      }
    })
    .state('public.home', {
      url: '/',
      templateUrl: '/js/views/home.html',
      controller: 'HomeCtrl'
    })
    .state('user.test', {
      url: "/test",
      controller: 'TestCtrl',
      templateUrl: '/js/views/test.html'
    });

    // Anonymous routes
    $stateProvider
      .state('anon', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.anon
        }
      });

    // Regular user routes
    $stateProvider
      .state('user', {
        abstract: true,
        template: "<ui-view/>",
        resolve: {
          'authorizePromise': function (Auth) {
            return Auth.authorizePromise(access.user);
          }
        }
      })
      .state('user.home', {
        url: '/',
        templateUrl: 'home'
      })
      .state('user.private', {
        abstract: true,
        url: '/private/',
        templateUrl: 'private/layout'
      })
      .state('user.private.home', {
        url: '',
        templateUrl: 'private/home'
      })
      .state('user.private.nested', {
        url: 'nested/',
        templateUrl: 'private/nested'
      })
      .state('user.private.admin', {
        url: 'admin/',
        templateUrl: 'private/nestedAdmin',
        data: {
          access: access.admin
        }
      });

    // Admin routes
    $stateProvider
      .state('admin', {
        abstract: true,
        template: "<ui-view/>",
        data: {
          access: access.admin
        },
        resolve: {
          'loadedAuth': function (Auth) {
            return Auth.loadMe();
          }
        }
      })
      .state('admin.admin', {
        url: '/admin/',
        templateUrl: 'admin',
        controller: 'AdminCtrl'
      });


    $urlRouterProvider.otherwise('/');


  // $stateProvider
  //   .state('app', {
  //     url: "",
  //     controller: 'ApplicationCtrl',
  //     templateUrl: '/js/views/app.html'
  //   })
  //   .state('app.analysis', {
  //     url: "/analysis",
  //     controller: 'AnalysisCtrl',
  //     templateUrl: '/js/views/analysis.html'
  //   })
  //   .state('app.analysis.new', {
  //     url: "/new",
  //     templateUrl: '/js/views/analysis.new.html',
  //     controller: 'NewAnalysisCtrl',
  //     resolve: {
  //       'serotypes': function ($http) {
  //         return $http.get('/serotypes').then(function (res) {
  //           return res.data.map(function (a) {
  //             return a.label;
  //           });
  //         });
  //       },
  //       'referenceSets': function ($http) {
  //         return $http.get('/reference-sets').then(function (res) {
  //           return res.data;
  //         });
  //       },
  //       'frequencySets': function ($http) {
  //         return $http.get('/frequency-sets').then(function (res) {
  //           return res.data;
  //         });
  //       }
  //     }
  //   })



});

app.run(function ($rootScope, $state, Auth) {

  $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams) {
    $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
    
    if(fromState.url === '^') {
      if(Auth.isLoggedIn()) {
        $state.go('public.home');
      } else {
        $rootScope.error = null;
        $state.go('public.home');
      }
    }
  });

});

function getSrv(name) {
  return angular.element(document.body).injector().get(name);
}

/* **********************************************
     Begin TestCtrl.js
********************************************** */


app.controller('TestCtrl', function ($scope) {

  $scope.hoi = {'data': [], 'variables' : []};

});


/* **********************************************
     Begin NavCtrl.js
********************************************** */

app.controller('NavCtrl', function ($scope, Auth) {
  $scope.auth = Auth;
});


/* **********************************************
     Begin Auth.js
********************************************** */

app.factory('Auth', function($http, $cookieStore, $q){

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
                console.log('start authorization');
                var deferred = $q.defer();
                if (self.authorize(role)) {
                  console.log('authorized');
                  deferred.resolve(true);
                } else {
                  console.log('no access');
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

/* **********************************************
     Begin ExcelInput.js
********************************************** */


app.directive('excelInput', function () {
  return {
    'scope': {
      'excelData': '=',
      'excelVariables': '=',
      'serotypes': '='
    },
    'template': "<p ng-if='filename == null'>Drag and drop an Excel file (.xls) here.</p>" +
                "<p ng-if='filename != null'>Imported {{filename}} ({{excelData.length}} rows).</p>" +
                "<ul ng-if='filename != null' class='list-inline'><li ng-repeat='var in excelVariables'>“{{var}}”</li></ul>",
    'link': function (scope, element) {
      element[0].className = 'dropzone';
      function FileDragHover(e) {
        e.stopPropagation();
        e.preventDefault();
        element[0].className = (e.type == "dragover" ? "hover dropzone" : "dropzone");
      }

      function FileSelectHandler(e) {

        // cancel event and hover styling
        FileDragHover(e);

        // fetch FileList object
        var files = element[0].files || e.dataTransfer.files;

        // process all File objects
        ParseFile(files[0]);

      }

      function ParseFile(file) {

        console.log(
          "File information", file.name,
          "type:" , file.type ,
          "size:" , file.size ,
          "bytes"
        );
        scope.filename = file.name;
        var reader = new FileReader();
        var name = file.name;
        reader.onload = function(e) {
          var data = e.target.result;

          /* if binary string, read with type 'binary' */
          var wb = XLS.read(data, {type: 'binary'});

          scope.excelData = XLS.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          scope.excelVariables = [];
          var prop;

          for (prop in scope.excelData[0]) {
              var slimprop = prop.replace(/^\D+/g,'').toLowerCase();
              if (scope.excelData[0].hasOwnProperty(prop) && scope.serotypes.indexOf(slimprop) != -1) {
                  if (slimprop != prop) {
                    // change it
                    for (i = 0; i < scope.excelData.length; i++) { 
                        scope.excelData[i][slimprop] = scope.excelData[i][prop];
                        delete scope.excelData[i][prop];
                    }
                  }
                  scope.excelVariables.push(slimprop);
              }
          }

          scope.$apply();
        };
        reader.readAsBinaryString(file);
        
      }

      element[0].addEventListener("dragover", FileDragHover, false);
      element[0].addEventListener("dragleave", FileDragHover, false);
      element[0].addEventListener("drop", FileSelectHandler, false);

    }
  };
});


/* **********************************************
     Begin AnalysisForm.js
********************************************** */

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

/* **********************************************
     Begin NewAnalysisController.js
********************************************** */

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


/* **********************************************
     Begin AnalysisController.js
********************************************** */

app.controller('AnalysisCtrl', function ($scope) {

});


/* **********************************************
     Begin HomeCtrl.js
********************************************** */

app.controller('HomeCtrl', function ($scope, $rootScope, $http, Auth) {

  $scope.formMode = 'register';
  $scope.formdata = {};
  $scope.errors = {};

  $scope.auth = Auth;

  $scope.submitForm = function (data) {
    console.log('submit', data);
    $scope.errors = {};
    if ($scope.formMode === 'login') {
      Auth.login(data, function () {}, function () {
        data.password = '';
        $scope.errors.invalidLogin = true;
      });
    } else if ($scope.formMode === 'register') {
      Auth.register(data, function () {
        console.log('done');
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
