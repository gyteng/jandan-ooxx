const app = require('../index').app;

app.config(['hammerDefaultOptsProvider', hammerDefaultOptsProvider => {
  hammerDefaultOptsProvider.set({recognizers: [
    [ Hammer.Tap,   { time: 250} ],
    [ Hammer.Press, { enable: true} ],
    [ Hammer.Swipe, { enable: true} ],
  ] });
}]);

app.config(['$urlRouterProvider', '$locationProvider',
  ($urlRouterProvider, $locationProvider) => {
    $locationProvider.html5Mode(true);
    $urlRouterProvider
      .when('', '/')
      .otherwise('/');
  }
]);

app.config(['$stateProvider', $stateProvider => {
  $stateProvider
    .state('index', {
      url: '/',
      controller: 'IndexController',
      templateUrl: '/public/views/index.html',
    })
    .state('index.image', {
      url: '{id:int}',
      controller: 'ImageController',
      templateUrl: '/public/views/image.html',
    })
    .state('history', {
      url: '/history',
      controller: 'HistoryController',
      templateUrl: '/public/views/history.html',
    })
    .state('week', {
      url: '/week',
      controller: 'WeekController',
      templateUrl: '/public/views/week.html',
    })
    .state('password', {
      url: '/password',
      controller: 'PasswordController',
      templateUrl: '/public/views/password.html',
    });
}]);
