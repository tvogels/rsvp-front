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

var app = angular.module('rsvpApp', ['ui.router','ui.bootstrap','ui.select2']);

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
      .state('user.analysis', {
        url: "/analysis",
        controller: 'AnalysisCtrl',
        templateUrl: '/js/views/analysis.html'
      });

    // Admin routes
    $stateProvider
      .state('admin', {
        abstract: true,
        template: "<ui-view/>",
        resolve: {
          'authorizePromise': function (Auth) {
            return Auth.authorizePromise(access.admin);
          }
        }
      })
      .state('user.analysis.new', {
        url: "/new",
        templateUrl: '/js/views/analysis.new.html',
        controller: 'NewAnalysisCtrl',
        resolve: {
          'serotypes': function ($http) {
            return $http.get('/serotypes').then(function (res) {
              return res.data.map(function (a) {
                return a.label;
              });
            });
          },
          'referenceSets': function ($http) {
            return $http.get('/reference-sets').then(function (res) {
              return res.data;
            });
          },
          'frequencySets': function ($http) {
            return $http.get('/frequency-sets').then(function (res) {
              return res.data;
            });
          }
        }
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

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
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

/* **********************************************
     Begin ExcelInput.js
********************************************** */


app.directive('excelInput', function () {
  return {
    'scope': {
      'excelData': '=',
      'excelVariables': '=',
      'serotypes': '=',
      'requireId': '@'
    },
    'template': "<p ng-if='filename == null'>Drag and drop an Excel file (.xls) here.</p>" +
                "<p ng-if='filename != null'>Imported {{filename}} ({{excelData.length}} rows).</p>" +
                "Serotypes: <ul ng-if='filename != null' class='list-inline'><li ng-repeat='var in excelVariables'>{{var}}</li></ul>",
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

        function hasNoMissings(row) {
          for (var i = scope.excelVariables.length - 1; i >= 0; i--) {
            var st = scope.excelVariables[i];
            if (!isNumeric(row[st])) {
              return false;
            }
          };
          return true;
        }

        reader.onload = function(e) {
          var data = e.target.result;

          /* if binary string, read with type 'binary' */
          var wb = XLS.read(data, {type: 'binary'});

          var tmp = XLS.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

          if (scope.requireId === 'true' && !tmp[0].hasOwnProperty('id')) {
            alert('Please make sure that the dataset includes a column named "id".');
            return false;
          }

          scope.excelData = tmp;
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

          // get rid of missings / non numerics
          var origCount = scope.excelData.length;
          console.log(scope.excelData);
          scope.excelData = scope.excelData.filter(hasNoMissings);
          var afterCount = scope.excelData.length;
          var diff = origCount - afterCount;
          if (diff !== 0) {
            alert(diff + ' rows contain missing/non-numeric values and have been omitted.');
          }

          scope.$apply();
        };
        reader.readAsBinaryString(file);
        
      }

      element[0].addEventListener("dragover", FileDragHover, false);
      element[0].addEventListener("dragleave", FileDragHover, false);
      element[0].addEventListener("drop", FileSelectHandler, false);

    },
    'controller': function ($scope) {
      $scope.$watch('excelVariables', function (dta) {
        if (!dta || dta.length === 0) {
          $scope.filename = null;
        }
      });
    }
  };
});


/* **********************************************
     Begin SinglePatientInput.js
********************************************** */


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


/* **********************************************
     Begin AnalysisForm.js
********************************************** */

app.directive('analysisForm', function () {
  return {
    restrict: 'A',
    templateUrl: '/js/views/analysis.form.html',
    scope: {
      'analysis': '=',
      'serotypes': '=',
      'frequencySets': '=',
      'referenceSets': '='
    },
    link: function (scope) {
      scope.showStep3 = false;
    },
    controller: function ($scope) {
      $scope.reset = function () {
        $scope.analysis.data = [];
        $scope.analysis.serotypes = [];
        $scope.analysis.frequencies = {};
        $scope.analysis.frequencySet = null;
        $scope.showStep3 = false;
      };
      $scope.$watch('analysis.frequencySet', function (set) {
        if (set !== null) {
          $scope.analysis.frequencySet = null;
          for (var i = set.hasSerotypes.length - 1; i >= 0; i--) {
            var st = set.hasSerotypes[i];
            if ($scope.analysis.serotypes.indexOf(st) !== -1) {
              $scope.analysis.frequencies[st] = set.frequencies[st];
            }
          };
        };
      });
      $scope.$watch('analysis.frequencies', function (freq) {
        if (Object.keys(freq).length > 0) {
          $scope.showStep3 = true;
        }
      },true);

      $scope.frequenciesValid = function () {
        for (var i = $scope.analysis.serotypes.length - 1; i >= 0; i--) {
          var st = $scope.analysis.serotypes[i];
          if (!isNumeric($scope.analysis.frequencies[st])) {
            return false;
          }
        };
        if ($scope.analysis.serotypes.length === 0) {
          return false;
        };
        return true;
      };

      $scope.dataValid = function () {

      };
    }
  };
});

/* **********************************************
     Begin NewAnalysisController.js
********************************************** */

app.controller('NewAnalysisCtrl', function ($scope, serotypes, referenceSets, frequencySets) {

  $scope.analysis = {
    'data': [],
    'serotypes': [],
    'frequencies': {},
    'frequencySet': null
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
