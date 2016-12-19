const app = require('../index').app;

app
  .controller('HistoryController', ['$scope', '$localStorage', '$state', '$mdMedia', '$http',
    ($scope, $localStorage, $state, $mdMedia, $http) => {
      if(!$localStorage.imagesHistory.length) {
        return $state.go('index');
      }
      $scope.divHeightStyle = { height: 100/3 + 'vw' };
      if($mdMedia('md')) {
        $scope.divHeightStyle.height = 100/4 + 'vw';
      }
      if($mdMedia('gt-md')) {
        $scope.divHeightStyle.height = 100/6 + 'vw';
      }
      const loadHistoryImages = () => {
        $scope.public.isLoading = true;
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
            $scope.public.isLoading = false;
          };
          img.src = f.url;
        });
      };
      loadHistoryImages();
      $scope.toImage = (index) => {
        const id = $localStorage.imagesHistory[index].id;
        $scope.public.addToHistory = false;
        $state.go('index.image', { id });
      };
      $scope.refreshHistory = () => {
        $http.get('/api/image', {
          params: { number: 60 }
        }).then(success => {
          $localStorage.imagesHistory = success.data;
          loadHistoryImages();
        });
      };
    }
  ])
;
