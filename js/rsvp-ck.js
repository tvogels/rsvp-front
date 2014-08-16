
function getSrv(name) {
  return angular.element(document.body).injector().get(name);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function isDefined(vb) {
  return (typeof vb !== 'undefined');
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};


/* **********************************************
     Begin routingConfig.js
********************************************** */

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
          'serotypes': function (SerotypeRepo) {
            return SerotypeRepo.load();
          },
          'referenceSets': function (ReferenceSetRepo) {
            return ReferenceSetRepo.findAll();
          },
          'frequencySets': function (FrequencySetRepo) {
            return FrequencySetRepo.findAll();
          }
        }
      });

    $urlRouterProvider.otherwise('/');

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
     Begin indiClick.js
********************************************** */

app.directive('indiClick', ['$parse', function ($parse) {
    var directive = {
        link: link,
        restrict: 'A'
    };
    return directive;
    function link(scope, element, attr) {
        var fn = $parse(attr['indiClick']),
        target = element[0];

        element.on('click', function (event) {
            scope.$apply(function () {
                var height = element.height(),
                oldWidth = element.width(),
                opts = {
                    length: Math.round(height / 3),
                    radius: Math.round(height / 5),
                    width: Math.round(height / 10),
                    color: element.css("color"),
                    left: -5
                }; // customize this "resizing and coloring" algorithm
                attr.$set('disabled', true);
                element.width(oldWidth + oldWidth / 2); // make room for spinner

                var spinner = new Spinner(opts).spin(target);
                // expects a promise
                // http://docs.angularjs.org/api/ng.$q
                fn(scope, { $event: event })
                .then(function (res) {
                    element.width(oldWidth); // restore size
                    attr.$set('disabled', false);
                    spinner.stop();
                    return res;
                }, function (res) {
                    element.width(oldWidth); // restore size
                    attr.$set('disabled', false);
                    spinner.stop();
                });
            });
        });
    }
}]);


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
     Begin Excel.js
********************************************** */

app.factory('Excel', function ($q) {

  return {

    /*
     * Read a workbook (return a promise)
     */
    readWorkbookFromFile: function (file) {
      var deferred = $q.defer();

      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function(e) {
        var data = e.target.result;
        deferred.resolve(XLS.read(data, {type: 'binary'}));
      };

      return deferred.promise;
    },

    /*
     * Read the first sheet (return a promise)
     */
    readFirstSheetFromFile: function (file) {
      return this.readWorkbookFromFile(file).then(function (wb) {
        return XLS.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      });
    }

  };

});


/* **********************************************
     Begin SerotypeRepo.js
********************************************** */

app.factory('SerotypeRepo', function ($http) {

  return {

    'serotypes': [],

    'load': function () {
      var self = this;
      return $http
        .get('/serotypes')
        .then(this.transformer)
        .then(function (serotypes) {
          self.serotypes = serotypes;
          return serotypes;
        });
    },

    'transformer': function (res) {
      return res.data.map(function (a) {
        return a.label;
      });
    }

  };

});


/* **********************************************
     Begin ExcelInput.js
********************************************** */


app.directive('excelInput', function (Excel) {

  /*
   * Checks if a row has missing values
   */
  function hasNoMissings(variables, row) {
    for (var i = variables.length - 1; i >= 0; i--) {
      var st = variables[i];
      if (!isNumeric(row[st])) {
        return false;
      }
    }
    return true;
  }

  /*
   * Handler for drag hover
   */
  function fileDragHover(dropElem, e) {
    e.stopPropagation();
    e.preventDefault();
    dropElem.className = (e.type === "dragover" ? "hover dropzone" : "dropzone");
  }

  /*
   * Handler for file selection
   * needs scope because it runs ParseFile(scope, file)
   */
  function fileSelectHandler(scope, dropElem, e) {
    fileDragHover(dropElem, e);
    var files = dropElem.files || e.dataTransfer.files;
    parseFile(scope, files[0]);
  }

  /*
   * Handle Excel data produced by parseFile
   */
  function handleSheet(scope, file, sheet) {

    if (scope.requireId === 'true' && !sheet[0].hasOwnProperty('id')) {
      alert('Please make sure that the dataset includes a column named "id".');
      return false;
    }

    scope.filename = file.name;
    scope.excelData = sheet;

    renameVariablesAndAssignToScope(scope);
    checkMissings(scope);

  }

  /*
   * Rename variables and assign them to the scope
   */
  function renameVariablesAndAssignToScope(scope) {
      var prop;

      scope.excelVariables = [];
      for (prop in scope.excelData[0]) {
        var slimprop = prop.replace(/^\D+/g,'').toLowerCase();
        if (scope.excelData[0].hasOwnProperty(prop) && scope.serotypes.indexOf(slimprop) !== -1) {
          if (slimprop !== prop) {
            // change it
            for (var i = 0; i < scope.excelData.length; i++) {
              scope.excelData[i][slimprop] = scope.excelData[i][prop];
              delete scope.excelData[i][prop];
            }
          }
          scope.excelVariables.push(slimprop);
        } else if (slimprop != 'id') {
          for (var i = 0; i < scope.excelData.length; i++) {
            delete scope.excelData[i][prop];
          }
        }
      }
  }

  /*
   * Check for missings
   */
  function checkMissings(scope) {
    var origCount = scope.excelData.length;
    scope.excelData = scope.excelData.filter(hasNoMissings.bind(null, scope.excelVariables));
    var afterCount = scope.excelData.length;
    var diff = origCount - afterCount;
    if (diff !== 0) {
      alert(diff + ' rows contain missing/non-numeric values and have been omitted.');
      return false;
    }
  }

  /*
   * Parse a file (argument 2) and attach it's contents to the scope
   */
  function parseFile(scope, file) {
    Excel
      .readFirstSheetFromFile(file)
      .then(handleSheet.bind(null, scope, file));
  }


  return {

    'scope': {
      'excelData': '=',
      'excelVariables': '=',
      'requireId': '@'
    },

    'templateUrl': '/js/views/excel-input.html',

    'link': function (scope, element) {
      var dropElem = element[0];
      scope.filename = null;
      dropElem.className = 'dropzone';
      dropElem.addEventListener("dragover", fileDragHover.bind(null, dropElem), false);
      dropElem.addEventListener("dragleave", fileDragHover.bind(null, dropElem), false);
      dropElem.addEventListener("drop", fileSelectHandler.bind(null, scope, dropElem), false);
    },

    'controller': function ($scope, SerotypeRepo) {
      // make sure a list of all available serotypes is accessible
      $scope.serotypes = SerotypeRepo.serotypes;
      // watch excelVariables to reset the file name if necessary
      $scope.$watch('excelVariables', function (dta) {
        if (!dta || dta.length === 0) {
          $scope.filename = null;
        }
      });
    }

  };
});


/* **********************************************
     Begin FrequencySetRepo.js
********************************************** */

app.factory('FrequencySetRepo', function ($http, FrequencySet) {

  return {
    findAll: function () {
      return $http
        .get('/frequency-sets')
        .then(FrequencySet.apiResponseTransformer);
    }
  };

});


/* **********************************************
     Begin sufficientSerotypes.js
********************************************** */

app.filter('sufficientSerotypes', function () {
  return function (referenceSets, minimumSerotypes) {
    return referenceSets.filter(function (referenceSet) {
      var filtered = minimumSerotypes.filter(function (n) {
        return referenceSet.hasSerotypes.indexOf(n) === -1;
      });
      return filtered.length === 0;
    });
  };
});

/* **********************************************
     Begin ReferenceSetRepo.js
********************************************** */

app.factory('ReferenceSetRepo', function ($http, ReferenceSet) {

  return {
    findAll: function () {
      return $http
        .get('/reference-sets?{"$sort":{"public": 1}}')
        .then(ReferenceSet.apiResponseTransformer);
    },
    save: function (set) {
      return $http
        .post('/reference-sets', set)
        .then(function (resp) { return ReferenceSet.build(resp.data); });
    }
  };

});


/* **********************************************
     Begin AnalysisRepo.js
********************************************** */



/* **********************************************
     Begin ReferenceSet.js
********************************************** */

app.factory('ReferenceSet', function ($q, $timeout) {

  function ReferenceSet() {
    this.id = null;
    this.label = null;
    this.user = null;
    this.public = null;
    this.hasSerotypes = [];
    this.statistics = {};
    this.data = undefined;
  }

  ReferenceSet.prototype.hasData = function () {
    return (typeof this.data !== 'undefined');
  };

  ReferenceSet.prototype.computeStatistics = function () {
    var deferred = $q.defer();
    this.statistics = {
      'mean': {}, 
      'med': {}, 
      'std': {}, 
      'var': {}, 
      'p5': {}, 
      'p95': {}
    };
    var self = this;
    $timeout(function () {
      for (var i = self.hasSerotypes.length - 1; i >= 0; i--) {
        var st = self.hasSerotypes[i];
        // loop through serotypes
        // construct a vector of results
        var vector = new gauss.Vector;
        for (var j = self.data.length - 1; j >= 0; j--) {
          var row = self.data[j];
          vector.push(parseFloat(row[st]));
        }
        self.statistics.mean[st] = vector.mean();
        self.statistics.std[st] = vector.stdev();
        self.statistics.med[st] = vector.median();
        self.statistics['var'][st] = vector.variance();
        self.statistics.p5[st] = vector.percentile(.05);
        self.statistics.p95[st] = vector.percentile(.95);
      }
      deferred.resolve(self);
    }, 0);

    return deferred.promise;
  }

  ReferenceSet.build = function (data) {
    var rs = new ReferenceSet();
    rs.id = data.id;
    rs.label = data.label;
    rs.user = data.user;
    rs.public = data.public;
    rs.hasSerotypes = data.hasSerotypes;
    rs.statistics = data.statistics;
    rs.data = data.data;
    return rs;
  };

  ReferenceSet.apiResponseTransformer = function (response) {
    return response.data.map(ReferenceSet.build);
  };

  return ReferenceSet;

});


/* **********************************************
     Begin SinglePatientInput.js
********************************************** */

app.directive('singlePatientInput', function () {

  return {

    'scope': {
      'data': '=',
      'variables': '='
    },

    'templateUrl': "/js/views/single-patient-input.html",

    'link': function (scope) {

      // set up a data array with one element, the 'patient'
      scope.patient = function () {
        if (scope.data.length == 0) {
          var pat = {};
          scope.data.push(pat);
          return pat;
        } else {
          return scope.data[0];
        }
      }
    },

    'controller': function ($scope, SerotypeRepo) {

      $scope.serotypes = SerotypeRepo.serotypes;

      /*
       * Save the form
       */
      $scope.createNew = function (formdata) {

        // check if we don't have the serotype already
        if (inArray(formdata.serotype, $scope.variables)) {
          return alert('You already entered serotype '+formdata.serotype+'.');
        }

        // force chosing a serotype
        if (!isDefined(formdata.serotype) || formdata.serotype === null) {
          return alert('Please choose a serotype');
        }

        // parse the response and add it to the right places
        formdata.response = parseFloat(formdata.response);
        $scope.variables.push(formdata.serotype);
        $scope.patient()[formdata.serotype] = formdata.response;

        // reset the form
        $scope.formdata = {'serotype': null, 'response': ''};
        $scope.form.$setPristine();
        document.getElementById('select-serotype').focus();
      };

      /*
       * Remove a serotype
       */
      $scope.removeSerotype = function (st) {
        var array = $scope.variables;
        var index = array.indexOf(st);
        if (index > -1) {
          array.splice(index, 1);
          delete $scope.data[st];
        }
      };
      
    }

  };

});


/* **********************************************
     Begin FrequencySet.js
********************************************** */

app.factory('FrequencySet', function () {

  function FrequencySet(id, label, public, user, frequencies, hasSerotypes) {
    this.id = id;
    this.label = label;
    this.public = public;
    this.user = user;
    this.frequencies = frequencies;
    this.hasSerotypes = hasSerotypes;
  }

  FrequencySet.build = function (data) {
    return new FrequencySet(
      data.id,
      data.label,
      data.public,
      data.user,
      data.frequencies,
      data.hasSerotypes
    );
  };

  FrequencySet.apiResponseTransformer = function (response) {
    return response.data.map(FrequencySet.build);
  };

  return FrequencySet;

});


/* **********************************************
     Begin Analysis.js
********************************************** */

app.factory('Analysis', function () {

  function Analysis() {
    this.reset();
  }

  Analysis.prototype.frequenciesValid = function () {

    for (var i = this.hasSerotypes.length - 1; i >= 0; i--) {
      var st = this.hasSerotypes[i];
      if (!isNumeric(this.frequencies[st])) {
        return false;
      }
    }

    if (this.hasSerotypes.length === 0) {
      return false;
    }

    return true;
  };

  /*
   * This is a stub
   * Better validation should follow
   */
  Analysis.prototype.dataValid = function () {
    return this.hasSerotypes.length > 0;
  }

  Analysis.prototype.useFrequencyPreset = function (set) {
    for (var i = set.hasSerotypes.length - 1; i >= 0; i--) {
      var st = set.hasSerotypes[i];
      if (this.hasSerotypes.indexOf(st) !== -1) {
        this.frequencies[st] = set.frequencies[st];
      }
    }
  };

  Analysis.prototype.reset = function () {
    this.id = null;
    this.user = null;
    this.label = null;
    this.referenceStatistics = {};
    this.frequencies = {};
    this.data = [];
    this.hasSerotypes = [];
  }

  Analysis.build = function (data) {
    var a = new Analysis;
    a.id = data.id;
    return a;
  };

  Analysis.apiResponseTransformer = function (response) {
    return response.data.map(Analysis.build);
  };

  return Analysis;

});


/* **********************************************
     Begin AnalysisForm.js
********************************************** */

app.directive('analysisForm', function (Analysis, ReferenceSet, ReferenceSetRepo, $rootScope) {

  function bindFrequencyPreset(scope, set) {
    if (isDefined(set) && set !== null) {
      scope.frequencyPreset = null;
      scope.analysis.useFrequencyPreset(set);
    }
  }

  function reset(scope, to) {
    scope.analysis.reset();
  }

  function saveRefSet(scope, set) {
    return set.computeStatistics()
      .then(function (set) {
        if (scope.analysis.hasSerotypes.diff(set.hasSerotypes).length === 0 || 
            confirm('Your reference set does not contain all serotypes that are in your analysis? Do you want to proceed?')
           ) {
          return ReferenceSetRepo
            .save(set)
            .then(function (set) {
              scope.referenceSets.unshift(set);
              scope.analysis.referenceSet = set;
              scope.newRefSet = new ReferenceSet;
              scope.newRefSet.label = "...";
              scope.refTabs[0].active = true;
            });
        } else {
          return false;
        }
      })
  }

  return {

    scope: {
      'analysis': '=',
      'frequencySets': '=',
      'referenceSets': '='
    },

    templateUrl: '/js/views/analysis.form.html',

    link: function (scope) {
      scope.frequencyPreset = null;
      scope.newRefSet = new ReferenceSet;
      scope.refTabs = [
        {title:'Select preset', content: ''},
        {title:'Upload your own data', content: ''}
      ];
    },

    controller: function ($scope) {
      $scope.reset = reset.bind(null, $scope);
      // frequency preset selection
      $scope.bindFrequencyPreset = bindFrequencyPreset.bind(null, $scope);

      // controlling the current step
      $scope.step = 1;
      $scope.$watch('analysis.data', function () {
        var valid = $scope.analysis.dataValid();
        if($scope.step < 2 && valid) {
          $scope.step = 2;
        } else if (!valid) {
          $scope.step = 1;
        }
      }, true);
      $scope.$watch('analysis.frequencies', function () {
        var valid = $scope.analysis.frequenciesValid();
        if($scope.step < 3 && valid) {
          $scope.step = 3;
        } else if (!valid) {
          $scope.step = Math.min($scope.step, 2);
        }
      }, true);

      $scope.saveRefSet = saveRefSet.bind(null, $scope);
    }

  };
});


/* **********************************************
     Begin NewAnalysisController.js
********************************************** */

app.controller('NewAnalysisCtrl', function ($scope, serotypes, referenceSets, frequencySets, Analysis) {

  $scope.analysis = new Analysis;
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
