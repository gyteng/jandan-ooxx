const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', '$interval', '$location', '$http', '$timeout',
    ($scope, $mdSidenav, $state, $mdDialog, $localStorage, $interval, $location, $http, $timeout) => {
      $localStorage.$default({
        settings: {
          autoChange: false,
          autoShowHelpInfo: true,
        },
        imagesHistory: [],
      });
      $scope.public = {
        isLoading: false,
        isAdmin : false,
        isFavorite: false,
        addToHistory: true,
        currentImage: {},
        images: [],
        view: [],
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
      if($scope.public.settings.autoShowHelpInfo) {
        $scope.showHelpDialog();
      };
      $scope.favorite = () => {
        if($scope.public.isFavorite) { return; }
        $scope.public.isFavorite = true;
        $http.post('/api/image/favorite', {
          id: $scope.public.currentImage.id,
        }).then().catch();
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
        name: '本周热门',
        icon: 'favorite',
        click: () => $state.go('week')
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
        if($scope.public.isAdmin) {
          $scope.menus[4].name = '退出';
          $scope.menus[4].icon = 'exit_to_app';
          $scope.menus[4].click = () => {
            $http.post('/api/logout').then(() => {
              $scope.public.isAdmin = false;
            });
          };
          return;
        }
        $scope.menus[4].name = '管理';
        $scope.menus[4].icon = 'settings';
        $scope.menus[4].click = () => {
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
      $scope.imagePreload = 1;
      $timeout(() => {
        $scope.imagePreload = 15;
      }, 1500);
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
        $localStorage.imagesHistory = $localStorage.imagesHistory.filter(f => {
          return f.id !== image.id;
        });
        $localStorage.imagesHistory.push(image);
        if($localStorage.imagesHistory.length > 60) {
          $localStorage.imagesHistory.splice(0, $localStorage.imagesHistory.length - 60);
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
          $scope.public.isLoading = true;
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
            $scope.public.isLoading = false;
          } else {
            $scope.getImageById(id).then((s) => {
              $scope.setCurrentImage(id, addToHistory);
            }).catch(() => {
              $scope.public.isLoading = false;
            });
          }
        }
      };
      $scope.randomImage = () => {
        if($scope.public.images.length > 1) {
          $scope.public.images.splice(0, 1);
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
        $localStorage.imagesHistory.forEach((f, i) => {
          if(f.id === $scope.public.currentImage.id) {
            index = i;
          }
        });
        if(index > 1) {
          $scope.public.addToHistory = false;
          const id = $localStorage.imagesHistory[index - 1].id;
          $state.go('index.image', { id });
        }
      };
      $scope.nextImage = () => {
        let index = null;
        $localStorage.imagesHistory.forEach((f, i) => {
          if(f.id === $scope.public.currentImage.id) {
            index = i;
          }
        });
        if(index < $localStorage.imagesHistory.length - 1) {
          $scope.public.addToHistory = false;
          const id = $localStorage.imagesHistory[index + 1].id;
          $state.go('index.image', { id });
        } else {
          $scope.randomImage();
        }
      };
      $interval(() => {
        if(!$scope.public.view.length) { return; }
        $http.post('/api/image/view', {
          id: $scope.public.view,
        });
        $scope.public.view = [];
      }, 10 * 1000);
      const loadWeekImages = () => {
        $http.get('/api/image/week', {
          params: { number: 60 }
        }).then(success => {
          $scope.weekImages = success.data;
          $scope.weekImages = $scope.weekImages.map(m => {
            return {
              id: m.id,
              url: m.url,
              width: 1,
              height: 1,
              style: { width: '100%', overflow: 'hidden'},
            };
          });
          $scope.weekImages.forEach((f, i) => {
            const img = new Image();
            img.onload = () => {
              $scope.weekImages[i].width = img.width;
              $scope.weekImages[i].height = img.height;
              if(img.height < img.width) {
                $scope.weekImages[i].style = { height: '100%', 'max-width': 'none', 'min-width': 100 / f.height * f.width + '%'};
              }
            };
            img.src = f.url;
          });
        });
      };
      loadWeekImages();
      $interval(() => {
        loadWeekImages();
      }, 90 * 1000);
    }
  ]);
