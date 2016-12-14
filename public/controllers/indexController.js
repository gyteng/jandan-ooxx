const app = require('../index').app;

app
  .controller('IndexController', ['$scope', '$state',
    ($scope, $state) => {
      if($state.current.name === 'index') {
        if($scope.public.images[0]) {
          $state.go('index.image', { id: $scope.public.images[0].id });
          return;
        }
        $scope.getImage().then(() => {
          $state.go('index.image', { id: $scope.public.images[0].id });
        });
      };
    }
  ])
;
