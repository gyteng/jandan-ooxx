const app = require('../index').app;

app
  .controller('ImageController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$interval', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $interval, $localStorage) => {
      const id = $stateParams.id;
      if(!id) {
        $stateParams.id = 1;
      }
      $scope.currentImage = $scope.images.filter(f => {
        return f.id === id;
      })[0];
      if(!$scope.currentImage) {
        $http.get('/image/' + id).then(success => {
          $scope.currentImage = success.data;
        });
      }
    }
  ])
;
