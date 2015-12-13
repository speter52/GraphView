var graphviewApp = angular.module('graphviewApp', [
  'ngRoute',
  'ngAnimate',
]);

// Angular Routes
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

// Angular Controllers TODO: Still need to move logic from js files to controllers
graphviewApp.controller('OutputGraphCtrl', function($scope){
  $scope.message = "test";
});
