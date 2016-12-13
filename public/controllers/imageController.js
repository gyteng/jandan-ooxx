const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$interval', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $interval, $localStorage) => {
      const id = $stateParams.id;
      $scope.setCurrentImage(id);
    }
  ])
;
