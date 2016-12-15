const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$stateParams', '$http', '$interval',
    ($scope, $stateParams, $http, $interval) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
      $scope.public.isFavorite = false;
      $scope.public.view.push(id);

      $scope.isManagerMenuOpen = false;

      $scope.verifyImage = () => {
        $http.put('/api/image/' + id, {
          status: 1,
        }).then().catch();
        $scope.randomImage();
      };
      $scope.deleteImage = () => {
        $http.put('/api/image/' + id, {
          status: -1,
        }).then().catch();
        $scope.randomImage();
      };
    }
  ])
;
