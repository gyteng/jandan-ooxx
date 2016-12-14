const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$stateParams',
    ($scope, $stateParams) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
    }
  ])
;
