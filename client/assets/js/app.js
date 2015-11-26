var graphviewApp = angular.module('graphviewApp', [
  'ngRoute',
]);

// TODO: Can't get Angular to pick up the template URL's, only the base index.html is displayed
graphviewApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/graphview', {
      templateUrl: 'runalgorithm.html',
      controller:'testcontroller'
    }).
    when('/runalgorithm', {
      templateUrl: '../../runalgorithm.html',
    });
  }]);

graphviewApp.controller('testcontroller', function($scope){
  $scope.message = "test";
});
