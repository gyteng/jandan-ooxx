const app = require('../index').app;

app
  .controller('IndexController', ['$scope', '$http', '$state', '$timeout',
    ($scope, $http, $state, $timeout) => {
      $scope.images = [];
      $scope.getImages = () => {
        if($scope.images.length > 10) {
          return;
        }
        $http.get('/random').then(success => {
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $scope.getImages();
        });
      };
      $scope.getImages();
      $scope.next = () => {
        $scope.images.splice(0);
        $scope.getImages();
      };
    }
  ])
;
