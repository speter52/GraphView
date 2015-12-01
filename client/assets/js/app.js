var graphviewApp = angular.module('graphviewApp', [
  'ngRoute',
  'ngAnimate',
]);

// TODO: Can't get Angular to pick up the template URL's, only the layout index.html is displayed
graphviewApp.config(['$routeProvider','$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.
    when('/runalgorithm', {
      templateUrl: '../../partials/runalgorithm.html',
      controller:'OutputGraphCtrl'
    })
    .when('/creategraphs',{
      templateUrl: '../../partials/creategraphs.html'
    })
    .when('/initsystem',{
      templateUrl: '../../partials/initsystem.html'
    });

    $locationProvider.html5Mode(true);
  }]);

graphviewApp.controller('OutputGraphCtrl', function($scope){
  $scope.message = "test";
});
