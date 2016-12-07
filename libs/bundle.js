/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	exports.app = angular.module('app', ['ngMaterial', 'ui.router', 'ngMessages', 'ngStorage']);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var app = __webpack_require__(1).app;

	app.config(['$urlRouterProvider', '$locationProvider', function ($urlRouterProvider, $locationProvider) {
	  $locationProvider.html5Mode(true);
	  $urlRouterProvider.when('', '/').otherwise('/');
	}]);

	app.config(['$stateProvider', function ($stateProvider) {
	  $stateProvider.state('index', {
	    url: '/',
	    controller: 'IndexController',
	    templateUrl: '/public/views/index.html'
	  }).state('history', {
	    url: '/history',
	    controller: 'HistoryController',
	    templateUrl: '/public/views/history.html'
	  });
	}]);

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var app = __webpack_require__(1).app;

	app.controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', function ($scope, $mdSidenav, $state, $mdDialog, $localStorage) {
	  $localStorage.$default({
	    autoShowHelpInfo: true,
	    history: []
	  });
	  if ($localStorage.history.length && !$scope.history[0].url) {
	    $localStorage.history = [];
	  }
	  $scope.historyIndex = false;
	  $scope.setHistoryIndex = function (index) {
	    $scope.historyIndex = index;
	  };
	  $scope.index = 0;
	  $scope.setIndex = function (index) {
	    $scope.index = index;
	  };
	  $scope.images = [];
	  $scope.openMenu = function () {
	    $mdSidenav('left').toggle();
	  };
	  $scope.helpDialog = {
	    autoShow: $localStorage.autoShowHelpInfo
	  };
	  $scope.setHelpInfo = function () {
	    $localStorage.autoShowHelpInfo = $scope.helpDialog.autoShow;
	  };
	  $scope.showHelpDialog = function () {
	    $mdDialog.show({
	      preserveScope: true,
	      scope: $scope,
	      templateUrl: '/public/views/help.html',
	      parent: angular.element(document.body),
	      clickOutsideToClose: true
	    });
	  };
	  $scope.menus = [{ name: '首页', icon: 'home', click: function click() {
	      return $state.go('index');
	    } }, { name: '浏览记录', icon: 'history', click: function click() {
	      return $state.go('history');
	    } }, { name: '帮助', icon: 'help_outline', click: function click() {
	      return $scope.showHelpDialog();
	    } }];
	  $scope.menuClick = function (index) {
	    $scope.menus[index].click();
	    $mdSidenav('left').close();
	  };
	}]).controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$localStorage', function ($scope, $http, $state, $stateParams, $timeout, $localStorage) {
	  // $localStorage.$default({
	  //   history: []
	  // });
	  if ($localStorage.autoShowHelpInfo && !$scope.historyIndex) {
	    $scope.showHelpDialog();
	  };
	  $scope.getImages = function () {
	    if ($scope.images.length > 10) {
	      return;
	    }
	    $http.get('/random').then(function (success) {
	      if ($scope.images.indexOf(success.data) > 0) {
	        return $scope.getImages();
	      }
	      if (!$scope.images.length) {
	        $localStorage.history.push(success.data);
	        $scope.setIndex(0);
	      }
	      $scope.images.push(success.data);
	      $scope.getImages();
	    }).catch(function () {
	      $scope.getImages();
	    });
	  };
	  if ($scope.historyIndex) {
	    // $scope.images[0] = $localStorage.history[$scope.index];
	    $scope.images[0] = {
	      id: $localStorage.history[$scope.index].id,
	      url: $localStorage.history[$scope.index].url
	    };
	    $scope.setHistoryIndex(false);
	  }
	  $scope.getImages();
	  $scope.random = function () {
	    $scope.images.splice(0, 1);
	    $localStorage.history.push($scope.images[0]);
	    if ($localStorage.history.length > 60) {
	      $localStorage.history.splice(0, $localStorage.history.length - 60);
	    }
	    $scope.setIndex($localStorage.history.length - 1);
	    $scope.getImages();
	  };
	  $scope.next = function () {
	    if ($scope.index < $localStorage.history.length - 1) {
	      $scope.setIndex($scope.index + 1);
	      $scope.images[0] = $localStorage.history[$scope.index];
	    } else {
	      $scope.random();
	    }
	  };
	  $scope.prev = function () {
	    if ($scope.index > 0) {
	      $scope.setIndex($scope.index - 1);
	      $scope.images[0] = $localStorage.history[$scope.index];
	    }
	  };
	}]).controller('HistoryController', ['$scope', '$localStorage', '$state', '$mdMedia', function ($scope, $localStorage, $state, $mdMedia) {
	  if (!$localStorage.history) {
	    return $state.go('index');
	  }
	  $scope.divHeightStyle = { height: 100 / 3 + 'vw' };
	  if ($mdMedia('md')) {
	    $scope.divHeightStyle.height = 100 / 4 + 'vw';
	  }
	  if ($mdMedia('gt-md')) {
	    $scope.divHeightStyle.height = 100 / 6 + 'vw';
	  }
	  $scope.history = $localStorage.history.map(function (m) {
	    return {
	      id: m.id,
	      url: m.url,
	      width: 1,
	      height: 1,
	      style: { width: '100%', overflow: 'hidden' }
	    };
	  });
	  $scope.history.forEach(function (f, i) {
	    // $scope.$apply(() => {
	    var img = new Image();
	    img.onload = function () {
	      $scope.history[i].width = img.width;
	      $scope.history[i].height = img.height;
	      if (img.height < img.width) {
	        $scope.history[i].style = { height: '100%', 'max-width': 'none', 'min-width': 100 / f.height * f.width + '%' };
	      }
	    };
	    img.src = f.url;
	    // });
	  });

	  $scope.toImage = function (index) {
	    $scope.setHistoryIndex(true);
	    $scope.setIndex(index);
	    $state.go('index');
	  };
	}]);

/***/ }
/******/ ]);