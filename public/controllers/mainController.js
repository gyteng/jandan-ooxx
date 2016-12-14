const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', '$interval', '$location', '$http',
    ($scope, $mdSidenav, $state, $mdDialog, $localStorage, $interval, $location, $http) => {
      $localStorage.$default({
        settings: {
          autoChange: false,
          autoShowHelpInfo: true,
        },
        imagesHistory: [],
      });
      $scope.public = {
        isAdmin : false,
        isFavorite: false,
        addToHistory: true,
        currentImage: {},
        images: [],
        history: $localStorage.imagesHistory,
        settings: $localStorage.settings,
      };
      $scope.checkAdmin = () => {
        $http.get('/api/login').then(success => {
          $scope.public.isAdmin = success.data.isLogin;
        });
      };
      $scope.checkAdmin();

      $scope.showHelpDialog = () => {
        $scope.dialog = $mdDialog.show({
          preserveScope: true,
          scope: $scope,
          templateUrl: '/public/views/help.html',
          parent: angular.element(document.body),
          clickOutsideToClose: true,
        });
      };
      $scope.closeHelpDialog = () => {
        $mdDialog.hide($scope.dialog);
      };
      //
      // $scope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
      //   if (fromState.name === 'index.image' && toState.name !== 'index.image') {
      //     $scope.autoChange.interval && $interval.cancel($scope.autoChange.interval);
      //   }
      // });
      //
      if($scope.public.settings.autoShowHelpInfo) {
        $scope.showHelpDialog();
      };
      $scope.favorite = () => {
        $scope.public.isFavorite = true;
      };

      $scope.menus = [ {
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
        name: '管理',
        icon: 'settings',
        click: () => $state.go('password')
      }, {
        name: '关于本项目',
        icon: 'code',
        click: () => {
          window.location = 'https://github.com/gyteng/jandan-ooxx';
        },
      } ];
      $scope.$watch('public.isAdmin', () => {
        console.log($scope.public.isAdmin);
        if($scope.public.isAdmin) {
          $scope.menus[3].name = '退出';
          $scope.menus[3].icon = 'exit_to_app';
          $scope.menus[3].click = () => {
            $http.post('/api/logout').then(() => {
              $scope.public.isAdmin = false;
            });
          };
          return;
        }
        $scope.menus[3].name = '管理';
        $scope.menus[3].icon = 'settings';
        $scope.menus[3].click = () => {
          $state.go('password');
        };
        return;
      });
      $scope.openMenu = () => {
        $mdSidenav('left').toggle();
      };
      $scope.menuClick = index => {
        $scope.menus[index].click();
        $mdSidenav('left').close();
      };

      $scope.imageUrlPreload = 60;
      $scope.imagePreload = 15;
      $scope.getImage = () => {
        return $http.get('/api/image', {
          params: { number: $scope.imageUrlPreload - $scope.public.images.length }
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
      $scope.$watch('public.images.length', () => {
        if($scope.public.images.length < $scope.imageUrlPreload / 2) {
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
