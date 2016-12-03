const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', ($scope, $mdSidenav) => {
    $scope.openMenu = () => {
      $mdSidenav('left').toggle();
    };
    $scope.menus = [
      {name: '首页', icon: ''},
      {name: '浏览记录', icon: ''},
    ];
  }])
  .controller('IndexController', ['$scope', '$http', '$state', '$timeout',
    ($scope, $http, $state, $timeout) => {
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
        $scope.images.splice(0, 1);
        $scope.getImages();
      };
    }
  ])
;
