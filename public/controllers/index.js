const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', ($scope, $mdSidenav, $state) => {
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
  .controller('IndexController', ['$scope', '$http', '$state', '$timeout', '$localStorage',
    ($scope, $http, $state, $timeout, $localStorage) => {
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
          }
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $scope.getImages();
        });
      };
      $scope.getImages();
      $scope.next = () => {
        $scope.images.splice(0, 1);
        // const url = $scope.images.splice(0, 1);
        $localStorage.history.push($scope.images[0]);
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
