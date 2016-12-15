const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$stateParams', '$http',
    ($scope, $stateParams, $http) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
      $scope.public.isFavorite = false;
      $scope.public.view.push(id);
    }
  ])
;
