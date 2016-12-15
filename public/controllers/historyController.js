const app = require('../index').app;

app
  .controller('HistoryController', ['$scope', '$localStorage', '$state', '$mdMedia',
    ($scope, $localStorage, $state, $mdMedia) => {
      if(!$scope.public.history.length) {
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
        const img = new Image();
        img.onload = () => {
          $scope.history[i].width = img.width;
          $scope.history[i].height = img.height;
          if(img.height < img.width) {
            $scope.history[i].style = { height: '100%', 'max-width': 'none', 'min-width': 100 / f.height * f.width + '%'};
          }
        };
        img.src = f.url;
      });

      $scope.toImage = (index) => {
        const id = $scope.public.history[index].id;
        $scope.public.addToHistory = false;
        $state.go('index.image', { id });
      };
    }
  ])
;
