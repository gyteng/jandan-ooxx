const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$stateParams', '$http',
    ($scope, $stateParams, $http) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
      $scope.public.isFavorite = false;
      // $http.put('/api/image/' + id).then().catch();
      $scope.public.view.push(id);
    }
  ])
;
