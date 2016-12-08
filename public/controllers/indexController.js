const app = require('../index').app;

app
  .controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$interval', '$localStorage', '$location',
    ($scope, $http, $state, $stateParams, $timeout, $interval, $localStorage, $location) => {
      if($localStorage.autoShowHelpInfo && !$scope.historyIndex) {
        $scope.showHelpDialog();
      };
      let isGetImagesRunning = false;
      $scope.getImages = () => {
        if ($scope.images.length > 15 || isGetImagesRunning) {
          return Promise.resolve();
        }
        isGetImagesRunning = true;
        return $http.get('/random').then(success => {
          isGetImagesRunning = false;
          if (!$scope.images.length) {
            $localStorage.imagesHistory.push(success.data);
            $scope.setIndex(0);
          }
          $scope.images.push(success.data);
          $scope.getImages();
          return Promise.resolve();
        }).catch(() => {
          $timeout(() => {
            isGetImagesRunning = false;
            $scope.getImages();
          }, 2000);
          return Promise.reject();
        });
      };
      if($scope.historyIndex) {
        $scope.images[0] = {
          id: $localStorage.imagesHistory[$scope.index].id,
          url: $localStorage.imagesHistory[$scope.index].url,
        };
        $scope.setHistoryIndex(false);
        $state.go('index.image', { id: $scope.images[0].id });
      } else if($location.path() !== '/') {
        $state.go('index.image', { id: +$location.path().substr(1) });
      } else {
        if(!$scope.images[0]) {
          $scope.getImages().then(() => {
            $state.go('index.image', { id: $scope.images[0].id });
          });
        } else {
          $state.go('index.image', { id: $scope.images[0].id });
        }
      }
      $scope.getImages();
      $scope.random = (fromInterval) => {
        $scope.getImages();
        $scope.images.splice(0, 1);
        if ($scope.images[0]) {
          $localStorage.imagesHistory.push($scope.images[0]);
        }
        if ($localStorage.imagesHistory.length > 60) {
          $localStorage.imagesHistory.splice(0, $localStorage.imagesHistory.length - 60);
        }
        $scope.setIndex($localStorage.imagesHistory.length - 1);
        if (!fromInterval) {
          $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
          if ($scope.autoChange.status) {
            $scope.autoChange.interval = $interval(() => {
              $scope.random(true);
            }, 10 * 1000);
          }
        }
        $state.go('index.image', { id: $scope.images[0].id });
      };
      $scope.next = () => {
        if ($scope.index < $localStorage.imagesHistory.length - 1) {
          $scope.setIndex($scope.index + 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
          $state.go('index.image', { id: $scope.images[0].id });
        } else {
          $scope.random();
        }
      };
      $scope.prev = () => {
        if ($scope.index > 0) {
          $scope.setIndex($scope.index - 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
          $state.go('index.image', { id: $scope.images[0].id });
        }
      };
      $scope.$watch('autoChange.status', () => {
        if (!$scope.autoChange.status) {
          $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
          return;
        }
        $scope.autoChange.interval = $interval(() => {
          $scope.random(true);
        }, 10 * 1000);
      });
    }
  ]);
