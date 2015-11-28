var graphviewApp = angular.module('graphviewApp', [
  'ngRoute',
  'ngAnimate',
]);

// TODO: Can't get Angular to pick up the template URL's, only the layout index.html is displayed
graphviewApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/runalgorithm', {
      templateUrl: '../../runalgorithm.html',
      controller:'OutputGraphCtrl'
    })
    .when('/creategraph',{
      templateUrl: '../../creategraph.html'
    })
    .when('/configureinput',{
      templateUrl: '../../configureinput.html'
    });
  }]);

graphviewApp.controller('OutputGraphCtrl', function($scope){
  $scope.message = "test";
});
