const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$stateParams', '$http',
    ($scope, $stateParams, $http) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
      $http.put('/api/image/' + id).then().catch();
    }
  ])
;
