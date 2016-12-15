const app = require('../index').app;

app
  .controller('WeekController', ['$scope', '$localStorage', '$state', '$mdMedia', '$http',
    ($scope, $localStorage, $state, $mdMedia, $http) => {
      // if(!$scope.public.history.length) {
      //   return $state.go('index');
      // }
      $scope.divHeightStyle = { height: 100/3 + 'vw' };
      if($mdMedia('md')) {
        $scope.divHeightStyle.height = 100/4 + 'vw';
      }
      if($mdMedia('gt-md')) {
        $scope.divHeightStyle.height = 100/6 + 'vw';
      }
      $http.get('/api/image/week', {
        params: { number: 20 }
      }).then(success => {
        $scope.weekImages = success.data.map(m => {
          return {
            id: m.id,
            url: m.url,
            width: 1,
            height: 1,
            style: { width: '100%', overflow: 'hidden'},
          };
        });
        $scope.weekImages.forEach((f, i) => {
          // $scope.$apply(() => {
            const img = new Image();
            img.onload = () => {
              $scope.weekImages[i].width = img.width;
              $scope.weekImages[i].height = img.height;
              if(img.height < img.width) {
                $scope.weekImages[i].style = { height: '100%', 'max-width': 'none', 'min-width': 100 / f.height * f.width + '%'};
              }
            };
            img.src = f.url;
          // });
        });
      });
      $scope.toImage = (index) => {
        const id = $scope.weekImages[index].id;
        $state.go('index.image', { id });
      };
    }
  ])
;
