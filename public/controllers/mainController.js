const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', '$interval', '$location', '$http',
    ($scope, $mdSidenav, $state, $mdDialog, $localStorage, $interval, $location, $http) => {
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
          clickOutsideToClose: true,
        });
      };
      $scope.closeDialog = () => {
        $mdDialog.hide($scope.dialog);
      };
      $scope.menus = [{
        name: '首页',
        icon: 'home',
        click: () => {
          if($location.path().match(/^\/\d{1,}$/)) {
            return;
          }
          $state.go('index');
        }
      }, {
        name: '浏览记录',
        icon: 'history',
        click: () => $state.go('history')
      }, {
        name: '帮助',
        icon: 'help_outline',
        click: () => $scope.showHelpDialog()
      }, {
        name: '关于本项目',
        icon: 'code',
        click: () => {
          window.location = 'https://github.com/gyteng/jandan-ooxx';
        },
      } ];
      $scope.menuClick = index => {
        $scope.menus[index].click();
        $mdSidenav('left').close();
      };
      $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
        if (fromState.name === 'index.image' && toState.name !== 'index.image') {
          $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
        }
      });

      if($localStorage.autoShowHelpInfo) {
        $scope.showHelpDialog();
      };





      $scope.public = {
        addToHistory: true,
        currentImage: {},
        images: [],
        history: $localStorage.imagesHistory,
      };
      $scope.getImage = () => {
        return $http.get('/api/image', {
          params: { number: 60 }
        }).then(success => {
          success.data.forEach(f => {
            if(!$scope.public.images.filter(img => { return img.id === f.id; })[0]) {
              $scope.public.images.push(f);
            }
          });
          return success;
        });
      };
      $scope.getImageById = (id) => {
        return $http.get('/api/image/' + id).then(success => {
          $scope.public.images.push(success.data);
          return success;
        });
      };
      $scope.$watch('public.images', () => {
        if($scope.public.images.length < 15) {
          $scope.getImage();
        }
      });
      $scope.addHistory = (image) => {
        $scope.public.history = $scope.public.history.filter(f => {
          return f.id !== image.id;
        });
        $scope.public.history.push(image);
        if($scope.public.history.length > 60) {
          $scope.public.history.splice(0, $scope.public.history.length - 60);
        }
      };
      $scope.setCurrentImage = (id) => {
        if(!id) {
          if($scope.public.images.length) {
            $scope.public.currentImage = $scope.public.images[0];
            $scope.addHistory($scope.public.currentImage);
          } else {
            $scope.getImage.then(() => {
              $scope.setCurrentImage();
            });
          }
        } else {
          const addToHistory = $scope.public.addToHistory;
          const image = $scope.public.images.filter(f => {
            return f.id === id;
          })[0];
          if(image) {
            $scope.public.currentImage = image;
            if(addToHistory) {
              $scope.addHistory($scope.public.currentImage);
            } else {
              $scope.public.addToHistory = true;
            }
          } else {
            $scope.getImageById(id).then(() => {
              $scope.setCurrentImage(id, addToHistory);
            });
          }
        }
      };
      $scope.randomImage = () => {
        if($scope.public.images.length > 1) {
          $scope.public.images.splice(0, 1);
          // $scope.public.currentImage = $scope.public.images[0];
          const image = $scope.public.images[0];
          $scope.addHistory(image);
          $state.go('index.image', { id: image.id });
        } else {
          $scope.getImage().then(() => {
            $scope.randomImage();
          });
        }
      };
      $scope.prevImage = () => {
        let index = null;
        $scope.public.history.forEach((f, i) => {
          if(f.id === $scope.public.currentImage.id) {
            index = i;
          }
        });
        if(index > 1) {
          $scope.public.addToHistory = false;
          const id = $scope.public.history[index - 1].id;
          $state.go('index.image', { id });
        }
      };
      $scope.nextImage = () => {
        let index = null;
        $scope.public.history.forEach((f, i) => {
          if(f.id === $scope.public.currentImage.id) {
            index = i;
          }
        });
        if(index < $scope.public.history.length - 1) {
          $scope.public.addToHistory = false;
          const id = $scope.public.history[index + 1].id;
          $state.go('index.image', { id });
        } else {
          $scope.randomImage();
        }
      };
    }
  ]);
