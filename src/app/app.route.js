'use strict';

angular.module('supplier.portal')
    .config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/invoices', {
                templateUrl: 'app/features/invoices/invoicesView.html',
                controller: 'InvoiceController',
                title: 'GLOBAL.MENU_ITEM_INVOICES',
                resolve: {
                    translationPart: [ 'TranslationService',function(TranslationService){
                       return TranslationService('invoices');
                    }]
                }
            })
            .when('/payments', {
                templateUrl: 'app/features/payments/paymentsView.html',
                controller: 'PaymentController',
                title: 'GLOBAL.MENU_ITEM_PAYMENTS',
                resolve: {
                    translationPart: [ 'TranslationService',function(TranslationService){
                        return TranslationService('payments');
                    }]
                }
            })
            .when('/upload', {
                templateUrl: 'app/features/upload/uploadView.html',
                controller: 'UploadController',
                title: 'GLOBAL.MENU_ITEM_UPLOAD',
                resolve: {
                    translationPart : [ 'TranslationService',function(TranslationService){
                        return TranslationService('upload');
                    }]
                }
            })
            .otherwise({
                redirectTo: '/invoices'
            });
    }]);