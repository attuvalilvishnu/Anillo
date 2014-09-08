'use strict';


var GLOBAL = {
    BASE_URL: 'http://192.168.1.129/'
}, storageEngine = sessionStorage;
var RoleId;
var userName;

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
]).config(['$routeProvider', function($routeProvider) {



        $routeProvider.when('/',
                {
                    templateUrl: 'partials/authentication/login.html',
                    controller: 'LoginController'
                }
        );
        $routeProvider.when('/quotes',
                {
                    templateUrl: 'partials/quotes/quotes.html',
                    controller: 'quoteController'

                }
        );

        $routeProvider.when('/quoteConsole/:Id',
                {
                    templateUrl: 'partials/quotes/quoteConsole.html',
                    controller: 'QuoteConsoleController'
                }
        );

        $routeProvider.when('/quoteConsole',
                {
                    templateUrl: 'partials/quotes/quoteConsole.html',
                    controller: 'QuoteConsoleAddController'
                }
        );

        $routeProvider.when('/partDetails',
                {
                    templateUrl: 'partials/quotes/partDetail.html',
                    controller: 'partDetailController'
                }
        );
//        $routeProvider.otherwise(
//                {redirectTo: '/'}
//        );




    }])

        .run(function($rootScope, $location) {


            $rootScope.$on('$routeChangeStart', function(event, next, current) {

                if (storageEngine.authToken) {

                }
                else {
                    console.log("go to login page");
                    $location.path('/');
                }

            });



        });







var GLOBAL = {
    BASE_URL: 'http://192.168.1.129/'
}, storageEngine;





