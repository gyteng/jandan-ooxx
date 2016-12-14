const app = require('../index').app;

app
  .controller('PasswordController', ['$scope', '$state', '$stateParams', '$http',
    ($scope, $state, $stateParams, $http) => {
      $scope.manager = {
        password: '',
        keypress: function() {

        },
      };
      $scope.checkPassword = () => {
        $http.post('/api/login', {
          password: $scope.manager.password,
        }).then(() => {
          $state.go('index');
        }).catch(() => {
          $state.go('index');
        });
      };
    }
  ])
;
