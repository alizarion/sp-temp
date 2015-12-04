'use strict';

angular.module('supplier.portal')
    .controller('LoginController', [
        '$scope',
        'AuthService',
        function ($scope,
                  AuthService) {

            $scope.authService = AuthService;

        }]);
