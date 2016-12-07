const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', '$interval',
  ($scope, $mdSidenav, $state, $mdDialog, $localStorage, $interval) => {
    $localStorage.$default({
      autoChange: false,
      autoShowHelpInfo: true,
      imagesHistory: [],
    });
    $scope.autoChange = {
      status: $localStorage.autoChange,
      interval: null,
    };
    $scope.setAutoChange = () => {
      $localStorage.autoChange = $scope.autoChange.status;
    };
    $scope.historyIndex = false;
    $scope.setHistoryIndex = (index) => {
      $scope.historyIndex = index;
    };
    $scope.index = 0;
    $scope.setIndex = (index) => {
      $scope.index = index;
    };
    $scope.images = [];
    $scope.openMenu = () => {
      $mdSidenav('left').toggle();
    };
    $scope.helpDialog = {
      autoShow: $localStorage.autoShowHelpInfo,
    };
    $scope.setHelpInfo = () => {
      $localStorage.autoShowHelpInfo = $scope.helpDialog.autoShow;
    };
    $scope.showHelpDialog = () => {
      $scope.dialog = $mdDialog.show({
        preserveScope: true,
        scope: $scope,
        templateUrl: '/public/views/help.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
      });
    };
    $scope.closeDialog = () => {
      $mdDialog.hide($scope.dialog);
    };
    $scope.menus = [
      {name: '首页', icon: 'home', click: () => $state.go('index') },
      {name: '浏览记录', icon: 'history', click: () => $state.go('history') },
      {name: '帮助', icon: 'help_outline', click: () => $scope.showHelpDialog() },
    ];
    $scope.menuClick = index => {
      $scope.menus[index].click();
      $mdSidenav('left').close();
    };
    $scope.$on('$stateChangeStart',(event, toState, toParams, fromState, fromParams, options) => {
      if(fromState.name === 'index') {
        $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
      }
    });
  }])
  .controller('IndexController', ['$scope', '$http', '$state', '$stateParams', '$timeout', '$interval', '$localStorage',
    ($scope, $http, $state, $stateParams, $timeout, $interval, $localStorage) => {
      if($localStorage.autoShowHelpInfo && !$scope.historyIndex) {
        $scope.showHelpDialog();
      };
      let isGetImagesRunning = false;
      $scope.getImages = () => {
        if($scope.images.length > 15 || isGetImagesRunning) {
          return;
        }
        isGetImagesRunning = true;
        $http.get('/random').then(success => {
          isGetImagesRunning = false;
          // if($scope.images.indexOf(success.data) > 0) {
          //   return $scope.getImages();
          // }
          if(!$scope.images.length) {
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
      if($scope.historyIndex) {
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
        if($scope.images[0]) { $localStorage.imagesHistory.push($scope.images[0]); }
        if($localStorage.imagesHistory.length > 60) {
          $localStorage.imagesHistory.splice(0, $localStorage.imagesHistory.length - 60);
        }
        $scope.setIndex($localStorage.imagesHistory.length - 1);
        if(!fromInterval) {
          $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
          if($scope.autoChange.status) {
            $scope.autoChange.interval = $interval(() => {
              $scope.random(true);
            }, 10 * 1000);
          }
        }
      };
      $scope.next = () => {
        if($scope.index < $localStorage.imagesHistory.length - 1) {
          $scope.setIndex($scope.index + 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
        } else {
          $scope.random();
        }
      };
      $scope.prev = () => {
        if($scope.index > 0) {
          $scope.setIndex($scope.index - 1);
          $scope.images[0] = $localStorage.imagesHistory[$scope.index];
        }
      };
      $scope.$watch('autoChange.status', () => {
        if(!$scope.autoChange.status) {
          $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
          return;
        }
        $scope.autoChange.interval = $interval(() => {
          $scope.random(true);
        }, 10 * 1000);
      });

    }
  ])
  .controller('HistoryController', ['$scope', '$localStorage', '$state', '$mdMedia',
    ($scope, $localStorage, $state, $mdMedia) => {
      if(!$localStorage.imagesHistory) {
        return $state.go('index');
      }
      $scope.divHeightStyle = { height: 100/3 + 'vw' };
      if($mdMedia('md')) {
        $scope.divHeightStyle.height = 100/4 + 'vw';
      }
      if($mdMedia('gt-md')) {
        $scope.divHeightStyle.height = 100/6 + 'vw';
      }
      $scope.history = $localStorage.imagesHistory.map(m => {
        return {
          id: m.id,
          url: m.url,
          width: 1,
          height: 1,
          style: { width: '100%', overflow: 'hidden'},
        };
      });
      $scope.history.forEach((f, i) => {
        // $scope.$apply(() => {
          const img = new Image();
          img.onload = () => {
            $scope.history[i].width = img.width;
            $scope.history[i].height = img.height;
            if(img.height < img.width) {
              $scope.history[i].style = { height: '100%', 'max-width': 'none', 'min-width': 100 / f.height * f.width + '%'};
            }
          };
          img.src = f.url;
        // });
      });

      $scope.toImage = (index) => {
        $scope.setHistoryIndex(true);
        $scope.setIndex(index);
        $state.go('index');
      };
    }
  ])
;
