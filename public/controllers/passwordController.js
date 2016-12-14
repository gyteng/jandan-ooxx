const app = require('../index').app;

app
  .controller('PasswordController', ['$scope', '$state', '$stateParams', '$http',
    ($scope, $state, $stateParams, $http) => {
      $scope.manager = {
        password: '',
        keypress: function(e) {
          if(e.keyCode === 13) {
            $scope.checkPassword();
          }
        },
      };
      $scope.checkPassword = () => {
        if(!$scope.manager.password) {
          return;
        }
        $http.post('/api/login', {
          password: $scope.manager.password,
        }).then(() => {
          $scope.public.isAdmin = true;
          $state.go('index');
        }).catch(() => {
          $scope.public.isAdmin = false;
          $state.go('index');
        });
      };
    }
  ])
;
