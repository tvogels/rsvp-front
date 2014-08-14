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
