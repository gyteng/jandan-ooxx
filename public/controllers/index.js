const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', ($scope, $mdSidenav, $state) => {
    $scope.historyIndex = null;
    $scope.setHistoryIndex = (index) => {
      $scope.historyIndex = index;
    };
    $scope.index = null;
    $scope.setIndex = (index) => {
      $scope.index = index;
    };
    $scope.images = [];
    $scope.openMenu = () => {
      $mdSidenav('left').toggle();
    };
    $scope.menus = [
      {name: '首页', icon: '', click: 'index' },
      {name: '浏览记录', icon: '', click: 'history' },
    ];
    $scope.menuClick = index => {
      $state.go($scope.menus[index].click);
      $mdSidenav('left').close();
    };
  }])
  .controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $localStorage) => {
      $localStorage.$default({
        history: []
      });
      $scope.getImages = () => {
        if($scope.images.length > 10) {
          return;
        }
        $http.get('/random').then(success => {
          if($scope.images.indexOf(success.data) > 0) {
            return $scope.getImages();
          }
          if(!$scope.images.length) {
            $localStorage.history.push(success.data);
            $scope.setIndex(0);
          }
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $scope.getImages();
        });
      };
      if($scope.historyIndex !== null) {
        $scope.images[0] = $localStorage.history[$scope.historyIndex];
        $scope.setIndex($scope.historyIndex);
        $scope.setHistoryIndex(null);
      }
      $scope.getImages();
      $scope.random = () => {
        $scope.images.splice(0, 1);
        $localStorage.history.push($scope.images[0]);
        if($localStorage.history.length > 50) {
          $localStorage.history.splice(0, 1);
        }
        $scope.setIndex($localStorage.history.length - 1);
        $scope.getImages();
      };
      $scope.next = () => {
        if($scope.index < $localStorage.history.length - 1) {
          $scope.setIndex($scope.index + 1);
          $scope.images[0] = $localStorage.history[$scope.index];
        }
      };
      $scope.prev = () => {
        if($scope.index > 0) {
          $scope.setIndex($scope.index - 1);
          $scope.images[0] = $localStorage.history[$scope.index];
        }
      };
    }
  ])
  .controller('HistoryController', ['$scope', '$localStorage', '$state',
    ($scope, $localStorage, $state) => {
      $scope.history = $localStorage.history;
      $scope.toImage = (index) => {
        $scope.setHistoryIndex(index);
        $state.go('index');
      };
    }
  ])
;
