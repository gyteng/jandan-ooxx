const app = require('../index').app;

app
  .controller('MainController', ['$scope', '$mdSidenav', '$state', '$mdDialog', '$localStorage', '$interval', '$location',
    ($scope, $mdSidenav, $state, $mdDialog, $localStorage, $interval, $location) => {
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
    }
  ]);
