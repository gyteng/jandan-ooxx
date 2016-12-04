const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', ($scope, $mdSidenav, $state) => {
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
  .controller('IndexController', ['$scope', '$http', '$state', '$timeout', '$localStorage',
    ($scope, $http, $state, $timeout, $localStorage) => {
      $localStorage.$default({
        history: []
      });
      $scope.images = [];
      $scope.getImages = () => {
        if($scope.images.length > 10) {
          return;
        }
        $http.get('/random').then(success => {
          if($scope.images.indexOf(success.data) > 0) {
            return $scope.getImages();
          }
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $scope.getImages();
        });
      };
      $scope.getImages();
      $scope.next = () => {
        const url = $scope.images.splice(0, 1);
        $localStorage.history.push(url[0]);
        $scope.getImages();
      };
    }
  ])
  .controller('HistoryController', ['$scope', '$localStorage',
    ($scope, $localStorage) => {
      $scope.history = $localStorage.history;
    }
  ])
;
