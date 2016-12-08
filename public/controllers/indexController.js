const app = require('../index').app;

app
  .controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$interval', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $interval, $localStorage) => {
      if ($localStorage.autoShowHelpInfo && !$scope.historyIndex) {
        $scope.showHelpDialog();
      };
      let isGetImagesRunning = false;
      $scope.getImages = () => {
        if ($scope.images.length > 15 || isGetImagesRunning) {
          return;
        }
        isGetImagesRunning = true;
        $http.get('/random').then(success => {
          isGetImagesRunning = false;
          // if($scope.images.indexOf(success.data) > 0) {
          //   return $scope.getImages();
          // }
          if (!$scope.images.length) {
            $localStorage.imagesHistory.push(success.data);
            $scope.setIndex(0);
          }
          $scope.images.push(success.data);
          $scope.getImages();
        }).catch(() => {
          $timeout(() => {
            isGetImagesRunning = false;
            $scope.getImages();
          }, 2000);
        });
      };
      if ($scope.historyIndex) {
        // $scope.images[0] = $localStorage.history[$scope.index];
        $scope.images[0] = {
          id: $localStorage.imagesHistory[$scope.index].id,
          url: $localStorage.imagesHistory[$scope.index].url,
        };
        $scope.setHistoryIndex(false);
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
      };
      $scope.next = () => {
        if ($scope.index < $localStorage.imagesHistory.length - 1) {
          $scope.setIndex($scope.index + 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
        } else {
          $scope.random();
        }
      };
      $scope.prev = () => {
        if ($scope.index > 0) {
          $scope.setIndex($scope.index - 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
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
