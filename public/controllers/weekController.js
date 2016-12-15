const app = require('../index').app;

app
  .controller('WeekController', ['$scope', '$localStorage', '$state', '$mdMedia', '$http',
    ($scope, $localStorage, $state, $mdMedia, $http) => {
      $scope.divHeightStyle = { height: 100/3 + 'vw' };
      if($mdMedia('md')) {
        $scope.divHeightStyle.height = 100/4 + 'vw';
      }
      if($mdMedia('gt-md')) {
        $scope.divHeightStyle.height = 100/6 + 'vw';
      }
      $scope.toImage = (index) => {
        const id = $scope.weekImages[index].id;
        $state.go('index.image', { id });
      };
    }
  ])
;
