/**
 *
 */
var IteSoft = angular.module('itesoft', [
    'ngSanitize',
    'ui.bootstrap.tabs',
    'ui.bootstrap.modal',
    'ui.bootstrap.tpls',
    'ngAnimate',
    'matchMedia',
    'ui.grid',
    'ngRoute',
    'pascalprecht.translate',
    'ui.grid.selection',
    'ui.grid.autoResize',
    'ui.grid.resizeColumns',
    'ui.grid.moveColumns'
]);

/**
 * @ngdoc directive
 * @name itesoft.directive:itCompile
 * @module itesoft
 * @restrict EA
 *
 * @description
 * This directive can evaluate and transclude an expression in a scope context.
 *
 * @example
  <example module="itesoft">
    <file name="index.html">
        <div ng-controller="DemoController">
             <div class="jumbotron ">
                 <div it-compile="pleaseCompileThis"></div>
             </div>
    </file>
    <file name="controller.js">
         angular.module('itesoft')
         .controller('DemoController',['$scope', function($scope) {

                $scope.simpleText = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. ' +
                    'Adipisci architecto, deserunt doloribus libero magni molestiae nisi odio' +
                    ' officiis perferendis repudiandae. Alias blanditiis delectus dicta' +
                    ' laudantium molestiae officia possimus quaerat quibusdam!';

                $scope.pleaseCompileThis = '<h4>This is the compile result</h4><p>{{simpleText}}</p>';
            }]);
    </file>
  </example>
 */
IteSoft
    .config(['$compileProvider', function ($compileProvider) {
        $compileProvider.directive('itCompile', ['$compile',function($compile) {
            return function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.itCompile);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            };
        }]);
    }]);

/**
 * @ngdoc directive
 * @name itesoft.directive:itModalFullScreen
 * @module itesoft
 * @restrict EA
 *
 * @description
 * print the encapsuled content into full screen modal popup
 *
 * <table class="table">
 *  <tr>
 *   <td><pre><it-modal-full-screen it-open-class="myCssClass"></pre></td>
 *   <td>class to set on the modal popup where is expanded , default class it-modal-background </td>
 *  </tr>
 * <tr>
 *   <td><pre><it-modal-full-screen it-escape-key="27"></pre></td>
 *   <td>it-escape-key keyboard mapping for close action, default 27 "escape key" </td>
 *  </tr>
 * <tr>
 *   <td><pre><it-modal-full-screen it-z-index="700"></pre></td>
 *   <td>set the  z-index of the modal element, by default take highest index of the view.</td>
 *  </tr>
 *  </table>
 * @example
 <example module="itesoft">
     <file name="index.html">
         <it-modal-full-screen  >
             <div class="jumbotron" >Lorem ipsum dolor sit amet,
             consectetur adipisicing elit. Assumenda autem cupiditate dolor dolores dolorum et fugiat inventore
             ipsum maxime, pariatur praesentium quas sit temporibus velit, vitae. Ab blanditiis expedita tenetur.
             </div>
         </it-modal-full-screen>
     </file>

 </example>
 */
IteSoft
    .directive('itModalFullScreen',
    [ '$timeout','$window','$document',
        function( $timeout,$window,$document) {

            function _findHighestZIndex()
            {
                var elements = document.getElementsByTagName("*");
                var highest_index = 0;

                for (var i = 0; i < elements.length - 1; i++) {
                    var computedStyles = $window.getComputedStyle(elements[i]);
                    var zindex = parseInt(computedStyles['z-index']);
                    if ((!isNaN(zindex)? zindex : 0 )> highest_index) {
                        highest_index = zindex;
                    }
                }
                return highest_index;
            }

            var TEMPLATE = '<div class="it-modal-full-screen" ng-class="$isModalOpen? $onOpenCss : \'\'">' +
                '<div  ng-if="$isModalOpen"  class="it-modal-full-screen-button ">' +
                '<button class="btn pull-right" ng-click="$closeModal()"><div class="it-animated-ciruclar-button"><i class="fa fa-compress"></i></div></button>' +
                '</div>'+
                '<div  ng-if="!$isModalOpen"  class="it-modal-full-screen-button ">' +
                ' <button class="btn pull-right"  ng-click="$openModal()"><div class="it-animated-ciruclar-button"><i class="fa fa-expand"></i></div></button> ' +
                '</div>'+
                '<div  class="it-modal-full-screen-content it-fill"  ng-transclude> </div>' +
                '</div>';

            return {
                restrict: 'EA',
                transclude: true,
                scope: false,
                template: TEMPLATE,
                link : function(scope, iElement, iAttrs, controller){
                    var zindex = (!isNaN(parseInt(iAttrs.itZIndex))? parseInt(iAttrs.itZIndex) : null);
                    scope.$onOpenCss = iAttrs.itOpenClass ?iAttrs.itOpenClass : 'it-modal-background';

                    var escapeKey =   (!isNaN(parseInt(iAttrs.itEscapeKey))? parseInt(iAttrs.itEscapeKey) : 27);
                    var content = angular.element(iElement[0]
                        .querySelector('.it-modal-full-screen'));
                    var contentElement = angular.element(content[0]);
                    scope.$openModal = function () {
                        scope.$isModalOpen = true;
                        var body = document.getElementsByTagName("html");
                        var computedStyles = $window.getComputedStyle(body[0]);
                        var top = parseInt(computedStyles['top']);
                        var marginTop = parseInt(computedStyles['margin-top']);
                        var paddingTop = parseInt(computedStyles['padding-top']);
                        var topSpace = (!isNaN(parseInt(top))? parseInt(top) : 0) +
                            (!isNaN(parseInt(marginTop))? parseInt(marginTop) : 0)
                            + (!isNaN(parseInt(paddingTop))? parseInt(paddingTop) : 0);
                        contentElement.addClass('it-opened');
                        contentElement.css('top', topSpace+'px');
                        if(zindex !== null){
                            contentElement.css('z-index',zindex );
                        } else {
                            contentElement.css('z-index', _findHighestZIndex() +100 );
                        }
                        $timeout(function(){
                            var event = document.createEvent('Event');
                            event.initEvent('resize', true /*bubbles*/, true /*cancelable*/);
                            $window.dispatchEvent(event);
                        },300)
                    };

                    scope.$closeModal = function(){
                        scope.$isModalOpen = false;
                        scope.$applyAsync(function(){
                            contentElement.removeAttr( 'style' );
                            contentElement.removeClass('it-opened');
                            $timeout(function(){
                                var event = document.createEvent('Event');
                                event.initEvent('resize', true /*bubbles*/, true /*cancelable*/);
                                $window.dispatchEvent(event);
                            },300)
                        })
                    };

                    $document.on('keyup', function(e) {
                        if(e){
                            if(e.keyCode == escapeKey){
                                scope.$closeModal();
                            }
                        }
                    });
                }
            }
        }]);


"use strict";

/**
 * @ngdoc directive
 * @name itesoft.directive:itBusyIndicator
 * @module itesoft
 * @restrict EA
 *
 * @description
 * <li>Simple loading spinner displayed instead of the screen while waiting to fill the data.</li>
 * <li>It has 2 usage modes:
 * <ul>
 *     <li> manual : based on "is-busy" attribute value to manage into the controller.</li>
 *     <li> automatic : no need to use "is-busy" attribute , automatically displayed while handling http request pending.</li>
 * </ul>
 * </li>
 *
 * @usage
 * <it-busy-indicator is-busy="true">
 * </it-busy-indicator>
 *
 * @example
 <example module="itesoft-showcase">
 <file name="index.html">
 <div ng-controller="LoaderDemoController">
     <it-busy-indicator is-busy="loading">
     <div class="container-fluid">
     <div class="jumbotron">
     <button class="btn btn-primary" ng-click="loadData()">Start Loading (manual mode)</button>
    <button class="btn btn-primary" ng-click="loadAutoData()">Start Loading (auto mode)</button>
     <div class="row">
     <table class="table table-striped table-hover ">
     <thead>
     <tr>
     <th>#</th>
     <th>title</th>
     <th>url</th>
     <th>image</th>
     </tr>
     </thead>
     <tbody>
     <tr ng-repeat="dataItem in data">
     <td>{{dataItem.id}}</td>
     <td>{{dataItem.title}}</td>
     <td>{{dataItem.url}}</td>
     <td><img ng-src="{{dataItem.thumbnailUrl}}" alt="">{{dataItem.body}}</td>
     </tr>
     </tbody>
     </table>
     </div>
     </div>
     </div>
     </it-busy-indicator>
 </div>
 </file>
 <file name="Module.js">
 angular.module('itesoft-showcase',['ngResource','itesoft']);
 </file>
 <file name="PhotosService.js">
 angular.module('itesoft-showcase')
 .factory('Photos',['$resource', function($resource){
                                return $resource('http://jsonplaceholder.typicode.com/photos/:id',null,{});
                            }]);
 </file>
 <file name="Controller.js">
 angular.module('itesoft-showcase')
 .controller('LoaderDemoController',['$scope','Photos','$timeout', function($scope,Photos,$timeout) {
        $scope.loading = false;

        var loadInternalData = function () {
            var data = [];
            for (var i = 0; i < 15; i++) {
                var dataItem = {
                    "id" : i,
                    "title": "title " + i,
                    "url" : "url " + i
                };
                data.push(dataItem);
            }
            return data;
        };

        $scope.loadData = function() {
            $scope.data = [];
            $scope.loading = true;

            $timeout(function() {
                $scope.data = loadInternalData();
            },500)
            .then(function(){
                $scope.loading = false;
            });
        }

        $scope.loadAutoData = function() {
            $scope.data = [];
            Photos.query().$promise
            .then(function(data){
                $scope.data = data;
            });
        }
 }]);
 </file>

 </example>
 *
 **/

IteSoft
    .directive('itBusyIndicator', ['$timeout', '$http', function ($timeout, $http) {
        var _loadingTimeout;

        function link(scope, element, attrs) {
            scope.$watch(function () {
                return ($http.pendingRequests.length > 0);
            }, function (value) {
                if (_loadingTimeout) $timeout.cancel(_loadingTimeout);
                if (value === true) {
                    _loadingTimeout = $timeout(function () {
                        scope.hasPendingRequests = true;
                    }, 250);
                }
                else {
                    scope.hasPendingRequests = false;
                }
            });
        }

        return {
            link: link,
            restrict: 'AE',
            transclude: true,
            scope: {
                isBusy:'='
            },
            template:   '<div class="mask-loading-container" ng-show="hasPendingRequests"></div>' +
                '<div class="main-loading-container" ng-show="hasPendingRequests || isBusy"><i class="fa fa-circle-o-notch fa-spin fa-4x text-primary "></i></div>' +
                '<ng-transclude ng-show="!isBusy"></ng-transclude>'
        };
    }]);
"use strict";


/**
 * @ngdoc directive
 * @name itesoft.directive:itLoader
 * @module itesoft
 * @restrict EA
 *
 * @description
 * Simple loading spinner that handle http request pending.
 *
 *
 * @example
    <example module="itesoft-showcase">
        <file name="index.html">
            <div ng-controller="LoaderDemoController">
                 <div class="jumbotron ">
                 <div class="bs-component">
                 <button class="btn btn-primary" ng-click="loadMoreData()">Load more</button>
                 <it-loader></it-loader>
                 <table class="table table-striped table-hover ">
                 <thead>
                 <tr>
                 <th>#</th>
                 <th>title</th>
                 <th>url</th>
                 <th>image</th>
                 </tr>
                 </thead>
                 <tbody>
                 <tr ng-repeat="data in datas">
                 <td>{{data.id}}</td>
                 <td>{{data.title}}</td>
                 <td>{{data.url}}</td>
                 <td><img ng-src="{{data.thumbnailUrl}}" alt="">{{data.body}}</td>
                 </tr>
                 </tbody>
                 </table>
                 <div class="btn btn-primary btn-xs" style="display: none;">&lt; &gt;</div></div>
                 </div>
            </div>
        </file>
         <file name="Module.js">
             angular.module('itesoft-showcase',['ngResource','itesoft']);
         </file>
         <file name="PhotosService.js">
          angular.module('itesoft-showcase')
                .factory('Photos',['$resource', function($resource){
                                return $resource('http://jsonplaceholder.typicode.com/photos/:id',null,{});
                            }]);
         </file>
         <file name="Controller.js">
             angular.module('itesoft-showcase')
                     .controller('LoaderDemoController',['$scope','Photos', function($scope,Photos) {
                            $scope.datas = [];

                            $scope.loadMoreData = function(){
                                Photos.query().$promise.then(function(datas){
                                    $scope.datas = datas;
                                });
                     };
             }]);
         </file>

    </example>
 *
 **/
IteSoft
    .directive('itLoader',['$http','$rootScope', function ($http,$rootScope) {
        return {
            restrict : 'EA',
            scope:true,
            template : '<span class="fa-stack">' +
                            '<i class="fa fa-refresh fa-stack-1x" ng-class="{\'fa-spin\':$isLoading}">' +
                            '</i>' +
                        '</span>',
            link : function ($scope) {
                $scope.$watch(function() {
                    if($http.pendingRequests.length>0){
                        $scope.$applyAsync(function(){
                            $scope.$isLoading = true;
                        });

                    } else {
                        $scope.$applyAsync(function(){
                            $scope.$isLoading = false;
                        });

                    }
                });

            }
        }
    }]
);
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itDetail
 * @module itesoft
 * @restrict EA
 *
 * @description
 * A container element for detail part of the master-detail main content.
 *
 * To use master details directive, add an {@link itesoft.directive:itMasterDetail `<it-master-detail>`} parent element. This will encompass all master details content,
 * and have 2 child elements: 1 {@link itesoft.directive:itMaster `<it-master>`} for the list selectable content,
 * and {@link itesoft.directive:itDetail `<it-detail>`} that display the content of the selected item.
 *
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *        <it-detail-header>
 *       </it-detail-header>
 *
 *       <it-detail-content>
 *       </it-detail-content>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 */
IteSoft
    .directive('itDetail',[function() {
        return {
            restrict: 'EA',
            require: '^itMasterDetail',
            transclude: true,
            scope: false,
            template: ' <div ng-show="($parent.$parent.desktop || ($parent.$parent.activeState == \'detail\' &&$parent.$parent.mobile))"   ng-if="currentItemWrapper.currentItem"  class="it-master-detail-slide-left col-md-{{$masterCol ? (12-$masterCol) : 6}} it-fill" >' +
                ' <div class="it-fill" ng-transclude>' +
                '</div>' +
                '</div>' +
                '<div  ng-show="($parent.$parent.desktop || ($parent.$parent.activeState == \'detail\' &&$parent.$parent.mobile))" class="col-md-{{$masterCol ? (12-$masterCol) : 6}} it-fill" ng-if="!currentItemWrapper.currentItem">' +
                '<div class="it-watermark" >{{$itNoDetail}}</div>' +
                '</div>'
        }
    }]);

"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itDetailContent
 * @module itesoft
 * @restrict EA
 *
 * @description
 * A container element for detail part of the master-detail main content.
 *
 * To use master details directive, add an {@link itesoft.directive:itMasterDetail `<it-master-detail>`} parent element. This will encompass all master details content,
 * and have 2 child elements: 1 {@link itesoft.directive:itMaster `<it-master>`} for the list selectable content,
 * and {@link itesoft.directive:itDetail `<it-detail>`} that display the content of the selected item.
 *
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *        <it-detail-header>
 *       </it-detail-header>
 *
 *       <it-detail-content>
 *       </it-detail-content>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 */
IteSoft
    .directive('itDetailContent',function() {
        return {
            restrict: 'EA',
            require: '^itDetail',
            transclude: true,
            scope:false,
            template : '<div class="row it-fill">' +
                ' <div class="col-md-12  it-fill" ng-transclude>'+

                            '</div>'+
                       '</div>'

        }
    });
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itDetailHeader
 * @module itesoft
 * @restrict EA
 *
 * @description
 * A container element for detail header, MUST be include in {@link itesoft.directive:itDetail `<it-detail>`} .
 * for more information see {@link itesoft.directive:itMasterDetail `<it-master-detail>`}.
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *        <it-detail-header>
 *           <button class="btn btn-primary" title="Add" ng-disabled="currentItemWrapper.hasChanged" ng-click="myAction()"><span class="fa fa-plus fa-lg"></span></button>
 *       </it-detail-header>
 *
 *       <it-detail-content>
 *       </it-detail-content>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 */
IteSoft
    .directive('itDetailHeader',function() {
        return {
            restrict: 'EA',
            require : '^itDetail',
            scope : false,
            transclude: true,
            template : '<div class="fluid-container"><div class="row it-md-header">'+
                '<div class="col-md-2 it-fill  col-xs-2">' +
                '<a href="" ng-if="$parent.$parent.$parent.mobile" ng-click="$parent.$parent.$parent.$parent.goToMaster()" class="it-material-design-hamburger__icon pull-left it-fill "> ' +
                '<span  class="menu-animated it-material-design-hamburger__layer " ng-class="{\'it-material-design-hamburger__icon--to-arrow\':$parent.$parent.$parent.$parent.mobile}"> ' +
                '</span>' +
                ' </a>'+
                '</div>'+
                '<div class="col-md-10 col-xs-10 it-fill ">'+
                '<div class="btn-toolbar  it-fill pull-right " ng-transclude>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>'
        }

    });
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itMaster
 * @module itesoft
 * @restrict EA
 *
 * @description
 * Most important part of master-detail component, that
 *
 * To use master details directive, add an  {@link itesoft.directive:itMasterDetail `<it-master-detail>`} parent element. This will encompass all master details content,
 * and have 2 child elements: 1  {@link itesoft.directive:itMaster `<it-master>`} for the list selectable content,
 * and {@link itesoft.directive:itDetail `<it-detail>`} that display the content of the selected item.
 * * for more information see {@link itesoft.directive:itMasterDetail `<it-master-detail>`}.
 * <table class="table">
 *  <tr>
 *   <td><code>masterDetail.getSelectedItems()</code></td>
 *   <td>Method to get selected items in the master grid.</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.getCurrentItemWrapper()</code></td>
 *   <td>Method to get the selected item wrapper that contain next attributes [originalItem ,currentItem, hasChanged ] .</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.undoChangeCurrentItem()</code></td>
 *   <td>Method to revert changes on the selected item.</td>
 *  </tr>
 * <tr>
 *   <td><code>masterDetail.getFilteredItems()</code></td>
 *   <td>Method to get displayed item after filter.</td>
 *  </tr>
 *  <tr>
 * <tr>
 *   <td><code>masterDetail.fillHeight()</code></td>
 *   <td>method refresh the master detail Height.</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.setCurrentItem(entity)</code></td>
 *   <td>Method to define the selected item, return promise</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.scrollToItem(item)</code></td>
 *   <td>Method to scroll to the entity row.</td>
 *  </tr>
 *  <tr>
 *   <td><code>$scope.$broadcast('unlockCurrentItem')</code></td>
 *   <td>unlock the selected item from the editing mode.</td>
 *  </tr>
 *  <tr>
 *   <td><code>$scope.$broadcast('lockCurrentItem',unlockOnEquals)</code></td>
 *   <td>lock the selected item from the editing mode. unlockOnEquals : default true | auto unlock the item if the changed item is equals to the original selected item, if set to false only the $scope.$broadcast('unlockCurrentItem') can unlock it.</td>
 *  </tr>
 *  <tr>
 *   <td><code>grid.appScope.itAppScope</code></td>
 *   <td>access to your application scope from the master-detail context, mainly for template binding</td>
 *  </tr>
 * </table>
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 *
 */
IteSoft
    .directive('itMaster',function(){
        return {
            restrict : 'EA',
            require : '^itMasterDetail',
            priority : -1,
            transclude : true,
            scope : {
                itMasterData : '=',
                itLang:'=',
                itCol:'=',
                itMasterDetailControl:'=',
                itLockOnChange: '=',
                itNoDataMsg: '@',
                itNoDetailMsg:'@'
            },
            template : '<div  ng-show="($parent.$parent.activeState == \'master\')" class=" it-master it-master-detail-slide-right col-md-{{itCol ? itCol : 6}} it-fill " ui-i18n="{{itLang}}">'+
                '<div class="row" ng-transclude>'+
                '</div>'+
                '<div class="row it-master-grid it-fill" >'+
                '<div class="col-md-12 it-master-detail-container it-fill">'+
                '<div ui-grid="gridOptions" ui-grid-selection ui-grid-resize-columns ui-grid-auto-resize ui-grid-move-columns  ui-grid-auto-resize class="it-master-detail-grid  it-fill">' +
                '<div class="it-watermark" ng-show="!gridOptions.data.length" >{{itNoDataMsg}}</div>'+
                '</div>'+
                '</div>'+
                '</div>'+
                '</div>',
            controller : ['$scope',
                '$filter',
                '$q',
                '$timeout',
                'itPopup',
                '$templateCache',
                '$route',
                '$window',
                function ($scope,
                          $filter,
                          $q,
                          $timeout,
                          itPopup,
                          $templateCache,
                          $route,
                          $window){

                    $templateCache.put('ui-grid/selectionRowHeaderButtons','<div class="it-master-detail-row-select"' +
                        ' ng-class="{\'ui-grid-row-selected\': row.isSelected}" >' +
                        '<input type="checkbox" ng-disabled="grid.appScope.$parent.currentItemWrapper.hasChanged && grid.appScope.itLockOnChange " tabindex="-1" ' +
                        ' ng-checked="row.isSelected"></div>');

                    $templateCache.put('ui-grid/selectionSelectAllButtons','<div class="it-master-detail-select-all-header" ng-click="(grid.appScope.$parent.currentItemWrapper.hasChanged && grid.appScope.itLockOnChange  )? \'return false\':headerButtonClick($event)">' +
                        '<input type="checkbox" ' +
                        ' ng-change="headerButtonClick($event)" ng-disabled="grid.appScope.$parent.currentItemWrapper.hasChanged  && grid.appScope.itLockOnChange" ng-model="grid.selection.selectAll"></div>');

                    function ItemWrapper(item){
                        var _self = this;
                        angular.forEach($scope.itMasterData,function(entry,index){

                            if(angular.equals(entry,item)) {
                                _self.index = index;
                            }
                        });
                        _self.originalItem = item;
                        _self.currentItem = angular.copy(item);
                        _self.hasChanged = false;
                        _self.isWatched = false;
                        _self.unlockOnEquals = true;
                    }

                    $scope.$parent.$masterCol = $scope.itCol;
                    ItemWrapper.prototype.unlockCurrent = function(){
                        this.hasChanged = false;
                        this.isWatched = false;
                    };

                    ItemWrapper.prototype.lockCurrent = function(autoUnlock){
                        this.hasChanged = true;
                        this.isWatched = true;
                        this.unlockOnEquals = !autoUnlock;
                    };



                    $scope.$parent.currentItemWrapper = null;

                    function _selectionChangedHandler(row){
                        if(!$scope.itMasterDetailControl.disableMultiSelect){
                            if($scope.gridApi.selection.getSelectedRows().length > 1 ){
                                $scope.$parent.currentItemWrapper = null;
                            } else if($scope.gridApi.selection.getSelectedRows().length === 1) {
                                _displayDetail($scope.gridApi.selection.getSelectedRows()[0]);
                                _scrollToEntity($scope.gridApi.selection.getSelectedRows()[0]);
                            }
                            else if($scope.gridApi.selection.getSelectedRows().length === 0) {
                                $scope.$parent.currentItemWrapper = null;
                            }
                        }else {
//                            _displayDetail(row.entity);
//                            _scrollToEntity(row.entity);
                        }
                    }

                    $scope.$parent.$itNoDetail = $scope.itNoDetailMsg;


                    $scope.gridOptions  = {
                        rowHeight: 40,
                        data : $scope.itMasterData,
                        multiSelect: !$scope.itMasterDetailControl.disableMultiSelect,
                        enableSelectAll: !$scope.itMasterDetailControl.disableMultiSelect,
                        enableRowHeaderSelection:!$scope.itMasterDetailControl.disableMultiSelect,
                        showGridFooter: true,
                        enableMinHeightCheck :true,
                        enableColumnResizing: true,
                        enableHorizontalScrollbar : 0,
                        enableVerticalScrollbar : 2,
                        onRegisterApi : function(gridApi){
                            $scope.gridApi = gridApi;
                            gridApi.selection.on.rowSelectionChanged($scope,function(row){
                                _selectionChangedHandler(row);
                            });
                            gridApi.selection.on.rowSelectionChangedBatch($scope,function(row){
                                _selectionChangedHandler(row);
                            });

                        },
                        gridFooterTemplate: '<div class="ui-grid-footer-info ui-grid-grid-footer"> ' +
                            '<span class="ngLabel badge ">{{"search.totalItems" |t}}  {{grid.appScope.itMasterData.length}}</span> ' +
                            '<span ng-show="grid.appScope.filterText.length > 0 && grid.appScope.itMasterData.length != grid.renderContainers.body.visibleRowCache.length" class="ngLabel badge alert-info ">{{"search.showingItems" |t}}  {{grid.renderContainers.body.visibleRowCache.length}}</span> ' +
                            '<span ng-show="!grid.appScope.itMasterDetailControl.disableMultiSelect" class="ngLabel badge">{{"search.selectedItems" | t}} {{grid.appScope.gridApi.selection.getSelectedRows().length}}</span>' +
                            '</div>',
                        rowTemplate: '<div ng-click="grid.appScope.onRowClick(col,row)" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell>' +
                            '</div>'
                    };

                    if(typeof $scope.itMasterDetailControl.columnDefs !== 'undefined'){
                        angular.forEach($scope.itMasterDetailControl.columnDefs, function(columnDef){
                            columnDef['headerCellTemplate'] = '<div ng-class="{ \'sortable\': sortable }"> <!-- <div class="ui-grid-vertical-bar">&nbsp;</div> --> ' +
                                '<div class="ui-grid-cell-contents" col-index="renderIndex" title="TOOLTIP"> ' +
                                '<span>{{ col.displayName CUSTOM_FILTERS }}</span> ' +
                                '<span ui-grid-visible="col.sort.direction" ' +
                                'ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }"> &nbsp; ' +
                                '</span> </div> <div class="ui-grid-column-menu-button" ng-if="grid.options.enableColumnMenus && !col.isRowHeader && col.colDef.enableColumnMenu !== false" ' +
                                'ng-click="toggleMenu($event)" ng-class="{\'ui-grid-column-menu-button-last-col\': isLastCol}"> <i class="fa fa-align-justify"></i>' +
                                ' </div> <div ui-grid-filter></div> </div>';
                        },true)
                    }

                    $scope.gridOptions.columnDefs =
                        $scope.itMasterDetailControl.columnDefs;

                    function _displayDetail(item) {
                        var deferred = $q.defer();
                        if($scope.$parent.currentItemWrapper != null){
                            if($scope.$parent.currentItemWrapper.hasChanged &&
                                $scope.itLockOnChange){
                                deferred.reject('undo or save before change');
                                return deferred.promise;
                            }
                        }
                        $scope.$parent.currentItemWrapper  = new ItemWrapper(item);
                        deferred.resolve('');
                        return deferred.promise;
                    }

                    $scope.onRowClick = function(row,col) {
                        if (col.entity != undefined && typeof row.providedHeaderCellTemplate != 'undefined') {
                            _displayDetail(col.entity).then(function (msg) {
                                if (row.providedHeaderCellTemplate !== 'ui-grid/selectionHeaderCell') {
                                    $scope.gridApi.selection.clearSelectedRows();
                                    if ($scope.$parent.$parent.mobile) {
                                        $scope.$parent.$parent.goToDetail();
                                    }
                                }
                                $scope.gridApi.selection.toggleRowSelection(col.entity);
                            }, function (msg) {
                                itPopup.alert($scope.itMasterDetailControl.navAlert);
                                $scope.gridApi.selection.selectRow($scope.$parent.currentItemWrapper.originalItem);
                            });
                        }
                    };


                    function _scrollToEntity(entity){
                        $scope.gridApi.core.scrollTo(entity);
                    }

                    $scope.itMasterDetailControl.selectItem =function (item){
                        $scope.onRowClick(null,{entity:item});
                    };

                    /**
                     * Method to filter rows
                     */
                    $scope.refreshData = function() {
                        var renderableEntities = $filter('itUIGridGlobalFilter')
                        ($scope.gridOptions.data, $scope.gridOptions, $scope.filterText);

                        angular.forEach($scope.gridApi.grid.rows, function( row ) {
                            var match = false;
                            renderableEntities.forEach(function(entity){

                                if(angular.equals(row.entity,entity)){
                                    match  = true;
                                }
                            });
                            if ( !match ){
                                $scope.gridApi.core.setRowInvisible(row);
                            } else {
                                $scope.gridApi.core.clearRowInvisible(row);
                            }
                        });
                    };


                    function _unlockCurrent(){
                        $scope.$applyAsync(function(){
                            if($scope.$parent.currentItemWrapper!==null){
                                $scope.$parent.currentItemWrapper.hasChanged = false;
                                $scope.$parent.currentItemWrapper.isWatched = false;
                            }
                        });

                    }

                    $scope.itMasterDetailControl.getCurrentItem = function(){
                        return   $scope.$parent.currentItemWrapper.currentItem;
                    };

                    $scope.itMasterDetailControl.undoChangeCurrentItem = function(){
                        if($scope.$parent.currentItemWrapper!= null){
                            _displayDetail($scope.$parent.currentItemWrapper.originalItem)
                            $scope.$parent.currentItemWrapper.currentItem =
                                angular.copy($scope.$parent.currentItemWrapper.originalItem);
                            _unlockCurrent();
                        }
                    };

                    $scope.$on('unlockCurrentItem',function(){
                        _unlockCurrent();
                    });

                    /**
                     * Method to scroll to specific item.
                     * @param entity item to scroll to.
                     */
                    $scope.itMasterDetailControl.scrollToItem =function (entity){
                        _scrollToEntity(entity);
                    };

                    /**
                     * Method to get Selected items.
                     * @returns {Array} of selected items
                     */
                    $scope.itMasterDetailControl.getSelectedItems = function(){
                        if(typeof $scope.gridApi !== 'undefined' ) {
                            if (typeof $scope.gridApi.selection.getSelectedRows === 'function') {
                                return $scope.gridApi.selection.getSelectedRows();
                            }
                        }
                        return [];
                    };

                    /**
                     * Method to get Current item.
                     * @returns {$scope.$parent.currentItemWrapper.currentItem|*}
                     * @deprecated
                     */
                    $scope.itMasterDetailControl.getCurrentItem = function(){
                        return   $scope.$parent.currentItemWrapper.currentItem;
                    };

                    /**
                     * Method to get Current item.
                     * @returns {$scope.$parent.currentItemWrapper.currentItem|*}
                     */
                    $scope.itMasterDetailControl.getCurrentItemWrapper = function(){
                        return   $scope.$parent.currentItemWrapper;
                    };

                    /**
                     * Method to get filtered items.
                     * @returns {Array} of filtered items.
                     */
                    $scope.itMasterDetailControl.getFilteredItems = function(){
                        var rows = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);
                        var entities  = [];
                        angular.forEach(rows,function(row){
                            entities.push(row.entity);
                        });
                        return entities;
                    };


                    /**
                     * Method to select the current Item.
                     * @param entity item to select.
                     * @returns {deferred.promise|*} success if the item is found.
                     */
                    $scope.itMasterDetailControl.setCurrentItem = function(entity){

                        var deferred = $q.defer();
                        $scope.gridApi.selection.clearSelectedRows();
                        _displayDetail(entity).then(function(){
                            $timeout(function() {
                                var entityIndex = $scope.itMasterData.indexOf(entity);
                                if(entityIndex>=0) {

                                    $scope.gridApi.selection.selectRow(entity);
                                    _scrollToEntity(entity);
                                    if( $scope.$parent.$parent.mobile){
                                        $scope.$parent.$parent.goToDetail();
                                    }
                                    deferred.resolve();
                                } else {
                                    deferred.reject();
                                }

                            });
                        },function(){
                            deferred.reject();
                        });
                        return deferred.promise;
                    };

                    /**
                     * Method to undo changes on the current item.
                     */
                    $scope.itMasterDetailControl.undoChangeCurrentItem = function(){
                        if($scope.$parent.currentItemWrapper!= null){
                            _displayDetail($scope.$parent.currentItemWrapper.originalItem)
                            $scope.$parent.currentItemWrapper.currentItem =
                                angular.copy($scope.$parent.currentItemWrapper.originalItem);
                            $scope.$parent.currentItemWrapper.unlockCurrent();
                        }
                    };

                    /**
                     * Method to fill windows height to the master part.
                     */
                    $scope.itMasterDetailControl.fillHeight = function(){
                        //  evalLayout.fillHeight();
                    };


                    /**
                     * Handler to unlock the current item.
                     */
                    $scope.$on('unlockCurrentItem',function(){
                        $timeout(function(){
                            $scope.$parent.currentItemWrapper.unlockCurrent();
                        });
                    });

                    /**
                     * Handler to lock the current item.
                     */
                    $scope.$on('lockCurrentItem',function(unlockOnEquals){
                        $timeout(function(){
                            $scope.$parent.currentItemWrapper.lockCurrent(unlockOnEquals);
                        });
                    });

                    function confirmLeavePage(e) {
                        if($scope.$parent.currentItemWrapper!=null){
                            if ( $scope.$parent.currentItemWrapper.hasChanged
                                && $scope.itLockOnChange ) {
                                itPopup.alert( $scope.itMasterDetailControl.navAlert);
                                e.preventDefault();
                            }
                        }
                    }
                    $scope.itAppScope = $scope.$parent;

                    //  $scope.itAppScope.$navAlert = {};

                    $scope.itAppScope.$navAlert = $scope.itMasterDetailControl.navAlert;

                    var w = angular.element($window);
                    w.bind('resize', function () {
                        $scope.gridApi.core.handleWindowResize();
                    });

                    $scope.itMasterDetailControl.initState = true;
                    $scope.$on("$locationChangeStart", confirmLeavePage);
                    $scope.itMasterDetailControl = angular.extend({navAlert:{
                        text:'Please save or revert your pending change',
                        title:'Unsaved changes',
                        buttons: [
                            {
                                text: 'OK',
                                type: 'btn-info',
                                onTap: function () {
                                    return false;
                                }
                            }]
                    }}, $scope.itMasterDetailControl );


                    /*  watchers */
                    $scope.$watch('itLang',function(){
                        $scope.gridApi.grid.refresh();
                    });

                    $scope.$watch('itMasterData',function(){
                        $scope.gridOptions.data = [];
                        $scope.itMasterData.forEach(function(entry){
                            $scope.gridOptions.data.push(entry);
                        });

                        if( typeof $scope.itMasterData === 'undefined' || $scope.itMasterData === null){
                            $scope.$parent.currentItemWrapper = null;
                        } else {
                            if( $scope.itMasterData.length === 0){
                                $scope.$parent.currentItemWrapper = null;
                            }
                        }
                        $scope.gridApi.grid.refresh();
                        if($scope.itMasterDetailControl !== null){
                            if(typeof  $scope.itMasterDetailControl.getCurrentItemWrapper() !== 'undefined'
                                && $scope.itMasterDetailControl.getCurrentItemWrapper()!= null){

                                $scope.$applyAsync(function(){
                                    _scrollToEntity($scope.itMasterDetailControl.getCurrentItemWrapper().originalItem);
                                });
                            }
                        }
                        $scope.refreshData();

                    },true);

                   $timeout(function(){
                        var event = document.createEvent('Event');
                        event.initEvent('resize', true /*bubbles*/, true /*cancelable*/);
                        $window.dispatchEvent(event);
                    },250);

                    $scope.$watch('$parent.currentItemWrapper.currentItem', function(newValue,oldValue){

                        if($scope.$parent.currentItemWrapper != null ){
                            if(!$scope.$parent.currentItemWrapper.isWatched)
                            {
                                $scope.$parent.currentItemWrapper.isWatched = true;
                            }
                            if($scope.$parent.currentItemWrapper.unlockOnEquals){
                                $scope.$parent.currentItemWrapper.hasChanged =
                                    !angular.equals(newValue,
                                        $scope.$parent.currentItemWrapper.originalItem);
                            } else   {
                                $scope.$parent.currentItemWrapper.hasChanged = true;
                            }
                        }
                    }, true);

                    $scope.$watch('filterText',function(){
                        $scope.refreshData();
                    },true);

                    $scope.$watch('itNoDetailMsg',function(){
                        $scope.$parent.$itNoDetail = $scope.itNoDetailMsg;

                    });
                }]


        }
    }).filter('itUIGridGlobalFilter',['$rootScope',function($rootScope) {
        return function(data, grid, query) {
            var matches = [];
            //no filter defined so bail
            if (query === undefined || query === '') {
                return data;
            }
            query = query.toLowerCase();

            function _deepFind(obj, path) {
                var paths = path.split('.')
                    , current = obj
                    , i;

                for (i = 0; i < paths.length; ++i) {
                    if (current[paths[i]] == undefined) {
                        return undefined;
                    } else {
                        current = current[paths[i]];
                    }
                }
                return current;
            }

            var scope = $rootScope.$new(true);
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < grid.columnDefs.length; j++) {
                    var dataItem = data[i];

                    var fieldName = grid.columnDefs[j].field;
                    var renderedData = _deepFind(dataItem,fieldName);
                    // apply cell filter
                    if (grid.columnDefs[j].cellFilter) {
                        scope.value = renderedData;
                        renderedData = scope.$eval('value | ' + grid.columnDefs[j].cellFilter);
                    }
                    //as soon as search term is found, add to match and move to next dataItem
                    if(typeof renderedData !== 'undefined' && renderedData != null){
                        if (renderedData.toString().toLowerCase().indexOf(query) > -1) {
                            matches.push(dataItem);
                            break;
                        }
                    }
                }
            }
            scope.$destroy();
            return matches;
        };
    }] );

'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itMasterDetail
 * @module itesoft
 * @restrict EA
 *
 * @description
 * A container element for master-detail main content.
 *
 * To use master details directive, add an `<it-master-detail>` parent element. This will encompass all master details content,
 * and have 2 child elements: 1 `<it-master>` for the list selectable content,
 * and `<it-detail>` that display the content of the selected item.
 *
 * You MUST pass an empty object  `<it-master it-master-detail-control="myMasterDetailControl"></it-master>`
 * this object will
 *
 * <table class="table">
 *  <tr>
 *   <td><code>myMasterDetailControl.navAlert = { <br/> text: 'my forbidden navigation text ', <br/> title : 'forbidden navigation title'  <br/>}</code></td>
 *   <td>Object passed to the navigation modal popup, when navigate triggered on unsaved item.</td>
 *  </tr>
 *  <tr>
 *   <td><code>myMasterDetailControl.disableMultiSelect  = true | false</code></td>
 *   <td>Disable | Enable  multiple row selection for entire grid .</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.getSelectedItems()</code></td>
 *   <td>Method to get selected items in the master grid.</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.getCurrentItemWrapper()</code></td>
 *   <td>Method to get the selected item wrapper that contain next attributes [originalItem ,currentItem, hasChanged ] .</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.undoChangeCurrentItem()</code></td>
 *   <td>Method to revert changes on the selected item.</td>
 *  </tr>
 * <tr>
 *   <td><code>masterDetail.getFilteredItems()</code></td>
 *   <td>Method to get displayed item after filter.</td>
 *  </tr>
 *  <tr>
 * <tr>
 *   <td><code>masterDetail.fillHeight()</code></td>
 *   <td>method refresh the master detail Height.</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.setCurrentItem(entity)</code></td>
 *   <td>Method to define the selected item, return promise</td>
 *  </tr>
 *  <tr>
 *   <td><code>masterDetail.scrollToItem(item)</code></td>
 *   <td>Method to scroll to the entity row.</td>
 *  </tr>
 *  <tr>
 *   <td><code>$scope.$broadcast('unlockCurrentItem')</code></td>
 *   <td>unlock the selected item from the editing mode.</td>
 *  </tr>
 *  <tr>
 *   <td><code>$scope.$broadcast('lockCurrentItem',unlockOnEquals)</code></td>
 *   <td>lock the selected item from the editing mode. unlockOnEquals : default true | auto unlock the item if the changed item is equals to the original selected item, if set to false only the $scope.$broadcast('unlockCurrentItem') can unlock it.</td>
 *  </tr>
 *  <tr>
 *   <td><code>grid.appScope.itAppScope</code></td>
 *   <td>access to your application scope from the master-detail context, mainly for template binding</td>
 *  </tr>
 *
 *   <tr>
 *   <td><code><pre><it-master it-col="3"></it-master></pre></code></td>
 *   <td>number of bootstrap columns of the master element, detail element automatically take  (12 - it-col), if undefined = 6</td>
 *  </tr>
 * </table>
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 * @example
    <example module="itesoft">
         <file name="index.html">
             <div ng-controller="MasterDetailController">
                 <it-master-detail >
                 <it-master it-col="4" it-master-data="data" it-lang="'fr'" it-no-data-msg="No data available"  it-no-detail-msg="{{( masterDetails.initState ? (masterDetails.getSelectedItems().length > 0 ?  masterDetails.getSelectedItems().length +' items selected' :  'no item selected') : '') | translate}}"  it-master-detail-control="masterDetails"  it-lock-on-change="true">
                 <it-master-header it-search-placeholder="Recherche" >
                 <button class="btn btn-primary" title="Add" ng-disabled="currentItemWrapper.hasChanged" ng-click="addNewItem()"><span class="fa fa-plus fa-lg"></span></button>
                 <button class="btn btn-danger" title="Delete" ng-disabled="currentItemWrapper.hasChanged" ng-click="deleteSelectedItems()"><span class="fa fa-trash fa-lg"></span></button>
                 <button class="btn btn-success" ng-disabled="currentItemWrapper.hasChanged" title="Down"><span class="fa fa-chevron-down fa-lg"></span></button>
                 <button class="btn btn-success" ng-disabled="currentItemWrapper.hasChanged" title="Up"><span class="fa fa-chevron-up fa-lg"></span></button>
                 </it-master-header>
                 </it-master>
                 <it-detail>
                 <it-detail-header>
                 <button class="btn btn-warning" title="Save"  ng-disabled="!currentItemWrapper.hasChanged" ng-click="saveCurrentItem()">
                 <span class="fa fa-floppy-o fa-lg"></span>
                 </button>
                 <button class=" btn btn-info" title="Check">
                 <span class="fa fa-file-code-o fa-lg"></span>
                 </button>
                 <button class="btn btn-success" title="Undo" ng-click="undoChange()">
                 <span class="fa fa-undo fa-lg"></span>
                 </button>

                 </it-detail-header>
                 <it-detail-content>
                 <it-modal-full-screen>
                      <div class="row">
                             <div class="form-group">
                                 <input it-input type="text" class="form-control floating-label" id="priorityDescription"
                                     it-text="code"
                                     ng-model="currentItemWrapper.currentItem.code"
                                     name=""
                                     ng-required="true"/>
                             </div>
                             <div class="form-group">
                             <input it-input type="text" class="form-control floating-label" id="priorityCategory"
                                 it-text="description"
                                 ng-model="currentItemWrapper.currentItem.description" name=""/>
                             </div>
                             <div class="form-group">
                             <input type="checkbox"
                                 it-toggle
                                 ng-model="currentItemWrapper.currentItem.enabledde"
                                 it-text="tete"/>
                             </div>
                    </div>
                 </it-modal-full-screen>
                 </it-detail-content>
                 </it-detail>
                 </it-master-detail>
             </div>
         </file>
         <file name="controller.js">
             angular.module('itesoft')
              .controller('MasterDetailController', ['$scope', function($scope) {

                                            $scope.data =
                                               [
                                                    {
                                                        "code" : "Code 1",
                                                        "description": "Description 1",
                                                        "enabledde" : true
                                                    },
                                                    {
                                                        "code" : "Code 2",
                                                        "description": "Description 2",
                                                        "enabledde" : false
                                                    },
                                                    {
                                                        "code" : "Code 3",
                                                        "description": "Description 3",
                                                        "enabledde" : true
                                                    },
                                                    {
                                                        "code" : "Code 4",
                                                        "description": "Description 4",
                                                        "enabledde" : false
                                                    },
                                                    {
                                                        "code" : "Code 5",
                                                        "description": "Description 5",
                                                        "enabledde" : true
                                                    }
                                                ];

                                            $scope.masterDetails = {};

                                            $scope.masterDetails = {
                                                columnDefs : [{ field: 'code', displayName: 'My value 1',  sortable:true},
                                                    { field: 'description', displayName: 'My value 2',  sortable:true},
                                                    { field: 'enabledde', displayName: 'My value 3',   sortable:false}]

                                            };

                                             $scope.masterDetails.disableMultiSelect = false;
                                            $scope.masterDetails.navAlert = {
                                                text:'{{\'BUTTON_LANG_EN\' | translate}}',
                                                title:'{{\'FOO\' | translate}}',
                                                buttons: [
                                                        {
                                                            text:  '<span class="fa fa-floppy-o fa-lg"></span>',
                                                            type:  'btn-warning',
                                                            onTap: function() {
                                                                $scope.saveCurrentItem();
                                                                return true;
                                                            }
                                                        },
                                                        {
                                                            text: '<span  class="fa fa-file-code-o fa-lg"></span>',
                                                            type: 'btn-primary',
                                                            onTap: function () {
                                                                $scope.saveCurrentItem();
                                                                return true;

                                                            }
                                                        },
                                                        {
                                                            text: '<span class="fa fa-undo fa-lg"></span>',
                                                            type: 'btn-success',
                                                            onTap: function () {
                                                                $scope.undoChange();
                                                                return true;

                                                            }
                                                        }
                                                    ]
                                            };

                                            function _removeItems(items,dataList){
                                                angular.forEach(items,function(entry){
                                                    var index = dataList.indexOf(entry);
                                                    dataList.splice(index, 1);
                                                })
                                            }

                                            $scope.deleteSelectedItems = function(){
                                                _removeItems($scope.masterDetails.getSelectedItems(), $scope.data);
                                            };


                                            $scope.saveCurrentItem = function(){
                                                   angular.copy( $scope.masterDetails.getCurrentItemWrapper().currentItem,$scope.data[$scope.masterDetails.getCurrentItemWrapper().index])

                                                    $scope.$broadcast('unlockCurrentItem');
                                                };

                                            $scope.undoChange = function(){
                                                $scope.masterDetails.undoChangeCurrentItem();
                                                $scope.masterDetails.fillHeight();
                                            };

                                            $scope.addNewItem = function(){
                                                var newItem =  {
                                                    "code" : "Code " + ($scope.data.length+1) ,
                                                    "description": "Description " + ($scope.data.length+1),
                                                    "enabledde" : true
                                                };
                                                $scope.data.push(newItem);
                                                $scope.masterDetails.setCurrentItem(newItem).then(function(success){
                                                    $scope.$broadcast('lockCurrentItem',false);
                                                },function(error){

                                                });
                                            };

                                            $scope.hasChanged = function(){
                                                if($scope.masterDetails.getCurrentItemWrapper() != null){
                                                    return $scope.masterDetails.getCurrentItemWrapper().hasChanged;
                                                } else {
                                                    return false;
                                                }
                                            }
                                        }]);
          </file>
         <file src="test.css">
         </file>
    </example>
 */
IteSoft
    .directive('itMasterDetail',['itPopup','$timeout','$window',function(itPopup,$timeout,$window){
        return {
            restrict: 'EA',
            transclude : true,
            scope :true,
            template : '<div it-bottom-glue="" class="it-master-detail-container jumbotron "> <div class="it-fill row " ng-transclude></div></div>',
            controller : [
                '$scope',
                'screenSize',
                function(
                    $scope,
                    screenSize
                    )
                {
                    $scope.activeState = 'master';
                    $scope.desktop = screenSize.on('md, lg', function(match){
                        $scope.desktop = match;

                    });

                    $scope.mobile = screenSize.on('xs, sm', function(match){
                        $scope.mobile = match;
                    });

                    $scope.goToDetail = function(){
                        $scope.activeState = 'detail';
                    };

                    $scope.$watch('mobile',function(){
                        if($scope.mobile &&
                            (typeof $scope.$$childHead.currentItemWrapper !== 'undefined'
                                &&  $scope.$$childHead.currentItemWrapper != null )){
                            $scope.activeState = 'detail';
                        } else {
                            $scope.activeState = 'master';
                        }
                    });

                    $scope.$watch('$$childHead.currentItemWrapper',function() {
                        if($scope.mobile &&
                            (typeof $scope.$$childHead.currentItemWrapper === 'undefined'
                                ||  $scope.$$childHead.currentItemWrapper === null )){
                            $scope.activeState = 'master';
                        } else {
                            if($scope.mobile &&
                                (typeof $scope.$$childHead.currentItemWrapper.currentItem === 'undefined'
                                    ||  $scope.$$childHead.currentItemWrapper.currentItem === null )) {
                                $scope.activeState = 'master';
                            }
                        }
                    });

                    $scope.goToMaster = function(){

                        if($scope.mobile &&
                            (typeof $scope.$$childHead.currentItemWrapper !== 'undefined'
                                &&  $scope.$$childHead.currentItemWrapper != null )){
                            if($scope.$$childHead.currentItemWrapper.hasChanged &&
                                $scope.$$childHead.$$childHead.itLockOnChange){
                                itPopup.alert(  $scope.$$childHead.$navAlert);
                            } else {
                                $scope.activeState = 'master';
                                $timeout(function(){
                                    $window.dispatchEvent(new Event('resize'));
                                },300)

                            }
                        } else {
                            $scope.activeState = 'master';
                            $timeout(function(){
                                $window.dispatchEvent(new Event('resize'));
                            },300)

                        }

                    };
                }]
        }
    }]);
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itMasterHeader
 * @module itesoft
 * @restrict EA
 *
 * @description
 * A container element for master headers, MUST be include in {@link itesoft.directive:itMaster `<it-master>`},
 * can contain the action buttons of selected items.
 * for more information see {@link itesoft.directive:itMasterDetail `<it-master-detail>`}.
 *
 * ```html
 * <it-master-detail>
 *   <!-- Master Content content -->
 *
 *   <it-master>
 *       <it-master-header>
 *             <button class="btn btn-primary" title="Add" ng-disabled="currentItemWrapper.hasChanged" ng-click="myAction()"><span class="fa fa-plus fa-lg"></span></button>
 *       </it-master-header>
 *   </it-master>
 *
 *   <!-- menu -->
 *   <it-detail>
 *        <it-detail-header>
 *
 *       </it-detail-header>
 *
 *       <it-detail-content>
 *       </it-detail-content>
 *   </it-detail>
 *
 * </it-master-detail>
 * ```
 */
IteSoft
    .directive('itMasterHeader',function() {
        return {
            restrict: 'EA',
            require: '^itMaster',
            scope : false,
            transclude : true,
            template :'<div class="fuild-container">   <div class="row it-fill">   <div class="it-md-header col-xs-12 col-md-12">'+
                                '<div class="btn-toolbar it-fill" ng-transclude>'+
                                '</div>'+
                            '</div>'+
                            '<div class="col-xs-12 col-md-12 pull-right">'+
                                '<div>'+
                                    '<form>'+
                                        '<div class="form-group has-feedback it-master-header-search-group  col-xs-12 col-md-{{$parent.itCol < 4 ? 12 :6 }} pull-right" >'+
                                            '<span class="glyphicon glyphicon-search form-control-feedback"></span>'+
                                            '<input  class="form-control " type="text" ng-model="$parent.filterText" class="form-control floating-label"  placeholder="{{placeholderText}}"/>'+
                                        '</div>'+
                                    '</form>'+
                                '</div>'+
                            '</div>'+
                '</div>'+
                        '</div>',
            link : function (scope, element, attrs ) {
                scope.placeholderText = attrs.itSearchPlaceholder;
            }
        }

    });
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itCheckbox
 * @module itesoft
 * @restrict A
 *
 * @description
 * The checkbox is no different than the HTML checkbox input,
 * except it's styled differently.
 *
 *
 * @example
    <example module="itesoft">
        <file name="index.html">
            <div>
                 <input it-checkbox type="checkbox" it-label="Checkbox">
            </div>
        </file>
    </example>
 */
IteSoft
    .directive('itCheckbox',function(){
        return {
            restrict: 'A',
            transclude : true,
            replace : true,
            link : function (scope, element, attrs ) {
                var input = angular.element(element[0]);
                input.wrap('<div class="checkbox"></div>');
                input.wrap('<label></label>');
                input.after('<span class="checkbox-material"><span class="check" style="margin-right:16px;width: '+attrs.width+';height:'+ attrs.height+';"></span></span>&nbsp;'+(attrs.itLabel || ''));
            }
        }
});
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itInput
 * @module itesoft
 * @restrict ECA
 *
 * @description
 * Floating labels are just like Stacked Labels,
 * except that their labels animate, or "float" up whe
 * n text is entered in the input.
 *
 *
 * ```html
 *   <form class="form-group"  novalidate name="myForm" ng-submit="submit(myForm)">
 *       <input it-input
 *              class="form-control floating-label"
 *              type="text"
 *              name="Email"
 *              ng-minlength="5"
 *              ng-maxlength="10"
 *              required=""
 *              it-text="Email"
 *              ng-model="user.email">
 *              <div class="form-errors" ng-messages="myForm.Email.$error" style="color: red;">
         *            <div class="form-error" ng-message="required">This field is required.</div>
         *            <div class="form-error" ng-message="minlength">This field is must be at least 5 characters.</div>
         *            <div class="form-error" ng-message="maxlength">This field is must be less than 50 characters</div>
 *             </div>
 *   </form>
 * ```
 * @example
    <example module="itesoft-showcase">
        <file name="index.html">
            <div ng-controller="HomeCtrl">
               <form class="form-group"  novalidate name="myForm" ng-submit="submit(myForm)">
                <div class="form-group">
                        <input it-input class="form-control floating-label" type="text" it-text="Email" ng-model="user.email">
                </div>
                <div class="form-group">
                        <input it-input class="form-control floating-label"   required="" ng-minlength="5"  ng-maxlength="10" type="text" it-text="Prénom" name="Prenom" ng-model="user.firstName">
                </div>
                  <div class="form-errors" ng-messages="myForm.Prenom.$error" style="color: red;">
                      <div class="form-error" ng-message="required">This field is required.</div>
                      <div class="form-error" ng-message="minlength">This field is must be at least 5 characters.</div>
                      <div class="form-error" ng-message="maxlength">This field is must be less than 50 characters</div>
                  </div>
                  <button class="btn btn-primary" type="submit">submit</button>
               </form>
            </div>
        </file>
         <file name="Module.js">
         angular.module('itesoft-showcase',['ngMessages','itesoft']);
         </file>
        <file name="controller.js">
            angular.module('itesoft-showcase').controller('HomeCtrl',['$scope', function($scope) {
                  $scope.user = {
                      email : 'test@itesoft.com',
                      firstName :''
                     };

                  $scope.submit = function(form){
                       if(form.$valid){
                         console.log('submit');
                       }
                  }
            }]);
        </file>

    </example>
 */
IteSoft
    .directive('itInput',function(){
        return {
            restrict: 'A',
            replace : true,
            require: '?ngModel',
            link : function (scope, element, attrs, ngModel ) {
                // Check if ngModel is there else go out
                if (!ngModel)
                    return;
                // Fix on input element
                var input = angular.element(element[0]);
                //If there is no floating-lbal do nothing
                if (input.hasClass('floating-label')) {
                    // Wrapper for material design
                    input.wrap('<div class="form-control-wrapper"></div>');
                    // If there is astatic placeholder use it
                    var placeholder = input.attr('placeholder');
                    if (placeholder) {
                        input.after('<div class="floating-label">' +  placeholder + '</div');
                    } else {
                        // Else user data binding text 
                        input.after('<div class="floating-label">' +  scope.itLabel + '</div');
                        scope.$watch('itLabel', function(value) {
                            scope.$applyAsync(function(){
                                if (!input[0].offsetParent) {
                                    return;
                                }
                                var elementDiv = input[0].offsetParent.children;
                                angular.forEach(elementDiv, function(divHtml) {
                                    var div = angular.element(divHtml);
                                    if (div.hasClass('floating-label')) {
                                        div.text(value);
                                    }
                                });
                            })

                        });
                    }
                    input.after('<span class="material-input"></span>');
                    input.attr('placeholder', '').removeClass('floating-label');
                }
                // Check if error message is set
                input.after('<small class="text-danger" style="display:none;"></small>');
                scope.$watch('itError', function(value) {
                    if (!input[0].offsetParent) {
                        return;
                    }
                    var elementDiv = input[0].offsetParent.children;
                    angular.forEach(elementDiv, function(divHtml) {
                        var div = angular.element(divHtml);
                        if (div.hasClass('text-danger')) {
                            div.text(value);
                            if (value != '' && value != undefined) {
                                div.removeClass('ng-hide');
                                div.addClass('ng-show');
                                div.css('display','block');
                            } else {
                                div.removeClass('ng-show');
                                div.addClass('ng-hide');
                                div.css('display','none');
                            }
                        }
                    });
                });
                if (input.val() === null || input.val() == "undefined" || input.val() === "") {
                    input.addClass('empty');
                }
                // Watch value and update to move floating label
                scope.$watch(function () {return ngModel.$modelValue; }, function(value,oldValue) {
                    if (value === null || value == undefined || value ==="" ) {
                        input.addClass('empty');
                    } else {
                        input.removeClass('empty');
                    }
                });

                // wait key input
                input.on('key change', function() {
                    if (input.val() === null || input.val() == "undefined" || input.val() === "") {
                        input.addClass('empty');
                    } else {
                        input.removeClass('empty');
                    }
                });
            },
            scope : {
                itError : '=',
                itLabel : '@'
            }
        }
});
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itSearch
 * @module itesoft
 * @restrict A
 *
 * @description
 * Attribute providing on an input a single filter box that searches across multiple columns in a grid (ui-grid) or a table.
 *
 * You MUST pass an object `<input it-search it-search-control="searchControl" ng-model="searchControl.filterText" ></input>`.
 * This object will be used as following:
 * <table class="table">
 *  <tr>
 *   <td><code>searchControl = { <br/> columnDefs : [{field:'field1'}, {field:'field2'}, {field:'field3'}]  <br/>}</code></td>
 *   <td>Object passed to the multicolumns function filter inside the component to let it know on which columns to apply the filter.
 *   <br>This object is based on the columnDefs defined for the UI-GRID. Only property field and cellFilter are used.
 *   </td>
 *  </tr>
 *  <tr>
 *   <td><code>searchControl.multicolumnsFilter(renderableRows)</code></td>
 *   <td>Method to filter in the grid or table according the choosen column fields.<br/>It returns the new rows to be displayed.</td>
 *  </tr>
 *  <tr>
 *   <td><code>searchControl.filterText</code></td>
 *   <td>This property of the scope has to be associated to the input<br/>(through ng-model).</td>
 *  </tr>
 * </table>
 * You MUST also pass a function `<input it-search ng-change="filter()"></input>`.
 * This function should call searchControl.multicolumnsFilter() to refresh the displayed data and has to be written in the application controller.
 *
 * @usage
 * <input it-search it-search-control="searchControl" ng-model="searchControl.filterText" ng-change="filter()">
 * </input>
 *
 * @example
 * <span><b>SEARCH IN UI-GRID</b></span>
 <example module="itesoft-showcase">
 <file name="index.html">
 <div ng-controller="SearchDemoControllerGrid">
 <div class="container-fluid">
 <div class="jumbotron">
 <div class="row">
 <button class="btn btn-primary" ng-click="loadDataGrid()">DISPLAY DATA IN UI-GRID</button>
 <form>
 <div class="form-group has-feedback" >
 <input it-search class="form-control" type="text" placeholder="Recherche multicolonnes dans UI-GRID" it-search-control="searchControl" ng-model="searchControl.filterText" ng-change="filter()"/>
 </div>
 </form>
 <div ui-grid="latinGrid" id="latinGrid"></div>
 </div>
 </div>
 </div>
 </div>
 </file>

 <file name="Module.js">
 angular.module('itesoft-showcase',['ngResource','itesoft']);
 </file>
 <file name="LatinService.js">
 angular.module('itesoft-showcase')
 .factory('Latin',['$resource', function($resource){
                                                    return $resource('http://jsonplaceholder.typicode.com/posts');
                                                }]);
 </file>
 <file name="Controller.js">
 angular.module('itesoft-showcase')
 .controller('SearchDemoControllerGrid',['$scope','Latin', function($scope,Latin) {
                            $scope.searchControl = {
                                columnDefs : [{field:'title'}, {field:'body'}]
                            };

                            $scope.dataSource = [];

                            //---------------ONLY UI-GRID--------------------
                            $scope.myDefs = [
                                    {
                                        field: 'id',
                                        width: 50
                                    },
                                    {
                                        field: 'title'
                                    },
                                    {
                                        field: 'body'
                                    }
                            ];
                            $scope.latinGrid = {
                                data: 'dataSource',
                                columnDefs: $scope.myDefs,
                                onRegisterApi: function (gridApi) {
                                    $scope.gridApi = gridApi;
                                    $scope.gridApi.grid.registerRowsProcessor($scope.searchControl.multicolumnsFilter, 200);
                                }
                            };
                            //---------------ONLY UI-GRID--------------------

                            $scope.filter = function () {
                                $scope.gridApi.grid.refresh();
                            };

                            $scope.loadDataGrid = function() {
                                $scope.dataSource = [];

                                Latin.query().$promise
                                .then(function(data){
                                    $scope.dataSource = data;
                                });
                            };
                     }]);
 </file>

 </example>

 * <span><b>SEARCH IN TABLE</b></span>
 <example module="itesoft-showcase1">
 <file name="index.html">
 <div ng-controller="SearchDemoControllerTable">
 <div class="container-fluid">
 <div class="jumbotron">
 <div class="row">
 <button class="btn btn-primary" ng-click="loadDataTable()">DISPLAY DATA IN TABLE</button>
 <form>
 <div class="form-group has-feedback" >
 <input it-search class="form-control" type="text" placeholder="Recherche multicolonnes dans TABLE" it-search-control="searchControl" ng-model="searchControl.filterText" ng-change="filter()"/>
 </div>
 </form>
 <table class="table table-striped table-hover ">
 <thead>
 <tr><th>id</th><th>title</th><th>body</th></tr>
 </thead>
 <tbody>
 <tr ng-repeat="dataItem in data">
 <td>{{dataItem.id}}</td>
 <td>{{dataItem.title}}</td>
 <td>{{dataItem.body}}</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </file>
 <file name="Module1.js">
 angular.module('itesoft-showcase1',['ngResource','itesoft']);
 </file>
 <file name="LatinService1.js">
 angular.module('itesoft-showcase1')
 .factory('Latin1',['$resource', function($resource){
                                            return $resource('http://jsonplaceholder.typicode.com/posts');
                                        }]);
 </file>
 <file name="Controller1.js">
 angular.module('itesoft-showcase1')
 .controller('SearchDemoControllerTable',['$scope','Latin1', function($scope,Latin1) {
                    $scope.searchControl = {};
                    $scope.searchControl = {
                        columnDefs : [{field:'title'}, {field:'body'}]
                    };

                    $scope.dataSource = [];
                    $scope.data = [];

                    $scope.filter = function () {
                        $scope.data = $scope.searchControl.multicolumnsFilter($scope.dataSource);
                    };

                    $scope.loadDataTable = function() {
                        $scope.dataSource = [];
                        $scope.data = [];

                        Latin1.query().$promise
                        .then(function(data){
                           $scope.dataSource = data;
                           $scope.data = data;
                        });
                    };
             }]);
 </file>

 </example>
 **/
IteSoft
    .directive('itSearch',function() {
        return {
            restrict: 'A',
            replace : true,
            scope: {
                itSearchControl:'='
            },
            link : function (scope, element, attrs ) {
                var input = angular.element(element[0]);

                input.after('<span class="glyphicon glyphicon-search form-control-feedback"/>');
            },
            controller : ['$scope',
                function ($scope) {
                    $scope.itSearchControl.multicolumnsFilter = function (renderableRows) {
                        var matcher = new RegExp($scope.itSearchControl.filterText, 'i');
                        var renderableRowTable = [];
                        var table = false;
                        if ($scope.itSearchControl.columnDefs) {
                            renderableRows.forEach(function (row) {
                                var match = false;
                                if (row.entity) {//UI-GRID
                                    $scope.itSearchControl.columnDefs.forEach(function (col) {
                                        if (!match && row.entity[col.field]) {
                                            var renderedData = row.entity[col.field].toString();
                                            if (col.cellFilter) {
                                                $scope.value = renderedData;
                                                renderedData = $scope.$eval('value | ' + col.cellFilter);
                                            }
                                            if(typeof renderedData !== 'undefined' && renderedData != null){
                                                if (renderedData.match(matcher)) {
                                                    match = true;
                                                }
                                            }
                                        }
                                    });
                                    if (!match) {
                                        row.visible = false;
                                    }
                                }
                                else {//TABLE
                                    table = true;
                                    $scope.itSearchControl.columnDefs.forEach(function (col) {
                                        if (!match && row[col.field] && row[col.field].toString().match(matcher)) {
                                            match = true;
                                        }
                                    });
                                    if (match) {
                                        renderableRowTable.push(row);
                                    }
                                }
                            });
                        }
                        if (table){
                            renderableRows = renderableRowTable;
                        }
                        return renderableRows;
                    };
                }]
        }
    });
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itToggle
 * @module itesoft
 * @restrict A
 *
 * @description
 * A toggle is an animated switch which binds a given model to a boolean.
 * Allows dragging of the switch's nub.
 *
 *
 * ```html
 *     <input  it-toggle type="checkbox" it-label="Toggle button">
 * ```
 *
 *
 * @example
    <example module="itesoft">
        <file name="index.html">
            <div>
                <input  it-toggle type="checkbox" ng-model="data" it-label="Toggle button">
            </div>
        </file>

    </example>
 */
IteSoft
    .directive('itToggle',['$compile',function($compile){
        return {
            restrict: 'A',
            transclude : true,
            link : function (scope, element, attrs ) {
                var input = angular.element(element[0]);
                input.wrap('<div class="togglebutton"></div>');
                if (scope.itLabel == undefined) {
                    input.wrap('<label></label>');
                    input.after('<span class="toggle"></span>');
                } else {
                    input.wrap('<label></label>');
                    input.after('<span class="toggle"></span><span>'+(scope.itLabel || '')+'</span>');

                    scope.$watch('itLabel', function(value) {
                        if ((value) && (input.context)) {
                            var label = angular.element(input.context.parentNode);
                            if ((label) && (attrs.itLabel)) {
                                var labelText = angular.element(label.get(0).firstChild);
                                labelText.get(0).textContent = value+'  ';
                            }
                        }
                    });
                }
            },
            scope: {
                itLabel: '@'
            }
        }
}]);
"use strict";
/**
 * @ngdoc directive
 * @name itesoft.directive:itPrettyprint

 * @module itesoft
 * @restrict EA
 * @parent itesoft
 *
 * @description
 * A container for display source code in browser with syntax highlighting.
 *
 * @usage
 * <it-prettyprint>
 * </it-prettyprint>
 *
 * @example
    <example module="itesoft">
        <file name="index.html">
             <pre it-prettyprint=""  class="prettyprint lang-html">
                 <label class="toggle">
                     <input type="checkbox">
                         <div class="track">
                         <div class="handle"></div>
                     </div>
                 </label>
             </pre>
        </file>
    </example>
 */
IteSoft
    .directive('itPrettyprint', ['$rootScope', '$sanitize', function($rootScope, $sanitize) {
        var prettyPrintTriggered = false;
        return {
            restrict: 'EA',
            terminal: true,  // Prevent AngularJS compiling code blocks
            compile: function(element, attrs) {
                if (!attrs['class']) {
                    attrs.$set('class', 'prettyprint');
                } else if (attrs['class'] && attrs['class'].split(' ')
                    .indexOf('prettyprint') == -1) {
                    attrs.$set('class', attrs['class'] + ' prettyprint');
                }
                return function(scope, element, attrs) {
                    var entityMap = {
                          "&": "&amp;",
                          "<": "&lt;",
                          ">": "&gt;",
                          '"': '&quot;',
                          "'": '&#39;',
                          "/": '&#x2F;'
                      };

                       function replace(str) {
                          return String(str).replace(/[&<>"'\/]/g, function (s) {
                              return entityMap[s];
                          });
                      }
                    element[0].innerHTML = prettyPrintOne(replace(element[0].innerHTML));

                };
            }

        };
    }]);
'use strict';

/**
 * @ngdoc directive
 * @name itesoft.directive:itBottomGue
 * @module itesoft
 * @restrict A
 *
 * @description
 * Simple directive to fill height.
 *
 *
 * @example
     <example module="itesoft">
         <file name="index.html">
             <div class="jumbotron " style="background-color: red; ">
                 <div class="jumbotron " style="background-color: blue; ">
                     <div class="jumbotron " style="background-color: yellow; ">
                         <div it-bottom-glue="" class="jumbotron ">
                            Resize the window height the component will  always fill the bottom !!
                         </div>
                     </div>
                 </div>
             </div>
         </file>
     </example>
 */
IteSoft
    .directive('itBottomGlue', ['$window','$timeout',
        function ($window,$timeout) {
    return function (scope, element) {

        function _onWindowsResize () {

            var currentElement = element[0];
            var elementToResize = angular.element(element)[0];
            var marginBottom = 0;
            var paddingBottom = 0;
            var  paddingTop = 0;
            var  marginTop =0;

            while(currentElement !== null && typeof currentElement !== 'undefined'){
                var computedStyles = $window.getComputedStyle(currentElement);
                var mbottom = parseInt(computedStyles['margin-bottom'], 10);
                var pbottom = parseInt(computedStyles['padding-bottom'], 10);
                var ptop = parseInt(computedStyles['padding-top'], 10);
                var mtop = parseInt(computedStyles['margin-top'], 10);
                marginTop += !isNaN(mtop)? mtop : 0;
                marginBottom += !isNaN(mbottom) ? mbottom : 0;
                paddingBottom += !isNaN(pbottom) ? pbottom : 0;
                paddingTop += !isNaN(ptop)? ptop : 0;
                currentElement = currentElement.parentElement;
            }

            var elementProperties = $window.getComputedStyle(element[0]);
            var elementPaddingBottom = parseInt(elementProperties['padding-bottom'], 10);
            var elementToResizeContainer = elementToResize.getBoundingClientRect();
            element.css('height', ($window.innerHeight
                - (elementToResizeContainer.top )-marginBottom -
                (paddingBottom - elementPaddingBottom)
                + 'px' ));
            element.css('overflow-y', 'auto');
        }

        $timeout(function(){
            _onWindowsResize();
            $window.addEventListener('resize', function () {
                _onWindowsResize();
            });
        },250)

    };

}]);
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itCollapsedItem
 * @module itesoft
 * @restrict E
 * @parent sideMenus
 *
 * @description
 * Directive to collapse grouped item in {@link itesoft.directive:itSideMenus `<it-side-menus>`}.
 *
 * <img src="../dist/assets/img/collapsed-item.gif" alt="">
 * @usage
 *  <li>
 *  </li>
 *  <li it-collapsed-item=""  >
 *    <a href=""><h5>Menu Title</h5></a>
 *    <ul  class=" nav navbar-nav  nav-pills nav-stacked it-menu-animated ">
 *        <li>
 *            <a  href="#/datatable">Normal</a>
 *        </li>
 *    </ul>
 *  </li>
 *  <li>
 *  </li>
 */
IteSoft
    .directive('itCollapsedItem', function() {
        return  {
            restrict : 'A',
            link : function ( scope,element, attrs) {
                var menuItems = angular.element(element[0]
                    .querySelector('ul'));
                var link = angular.element(element[0]
                    .querySelector('a'));
                menuItems.addClass('it-side-menu-collapse');
                element.addClass('it-sub-menu');
                var title = angular.element(element[0]
                    .querySelector('h5'));
                var i = angular.element('<i class="pull-right fa fa-angle-right" ></i>');
                title.append(i);
                link.on('click', function () {
                    if (menuItems.hasClass('it-side-menu-collapse')) {
                        menuItems.removeClass('it-side-menu-collapse');
                        menuItems.addClass('it-side-menu-expanded');
                        i.removeClass('fa-angle-right');
                        i.addClass('fa-angle-down');
                        element.addClass('toggled');
                    } else {
                        element.removeClass('toggled');
                        i.addClass('fa-angle-right');
                        i.removeClass('fa-angle-down');
                        menuItems.removeClass('it-side-menu-expanded');
                        menuItems.addClass('it-side-menu-collapse');

                    }
                });

            }
        }
    });


'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itNavActive
 * @module itesoft
 * @restrict A
 *
 * @description
 * Directive to set active view css class on side menu item {@link itesoft.directive:itSideMenus `<it-side-menus>`}.
 *
 *  <div class="jumborton ng-scope">
 *    <img src="../dist/assets/img/nav-active.gif" alt="">
 *  </div>
 *
 * ```html
 *     <it-side-menu>
 *            <ul it-nav-active="active" class="nav navbar-nav nav-pills nav-stacked list-group">
 *                <li>
 *                <a href="#"><h5><i class="fa fa-home fa-fw"></i>&nbsp; Content</h5></a>
 *                </li>
 *                <li>
 *                <a href="#/typo"><h5><i class="fa fa-book fa-fw"></i>&nbsp; Typography</h5></a>
 *                </li>
 *                <li>
 *                <a href=""><h5><i class="fa fa-book fa-fw"></i>&nbsp; Tables</h5></a>
 *                </li>
 *            </ul>
 *
 *     </it-side-menu>
 * ```
 *
 */

IteSoft.
    directive('itNavActive', ['$location', function ($location) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element,attrs) {
                var clazz = attrs.itActive || 'active';
                function setActive() {
                    var path = $location.path();
                    if (path) {
                        angular.forEach(element.find('li'), function (li) {
                            var anchor = li.querySelector('a');
                            if (anchor.href.match('#' + path + '(?=\\?|$)')) {
                                angular.element(li).addClass(clazz);
                            } else {
                                angular.element(li).removeClass(clazz);
                            }
                        });
                    }
                }

                setActive();

                scope.$on('$locationChangeSuccess', setActive);
            }
        }
    }]);
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itSideMenu
 * @module itesoft
 * @restrict E
 * @parent sideMenus
 *
 * @description
 * A container for a side menu, sibling to an {@link itesoft.directive:itSideMenuContent} Directive.
 * see {@link itesoft.directive:itSideMenus `<it-side-menus>`}.
 *
 * @usage
 * <it-side-menu>
 * </it-side-menu>
 */
IteSoft
    .directive('itSideMenu',function(){
        return {
            restrict: 'E',
            require : '^itSideMenus',
            transclude : true,
            scope:true,
            template :
                '<div class="it-side-menu it-side-menu-left it-side-menu-hide it-menu-animated" ng-class="{\'it-side-menu-hide\':!showmenu,\'it-side-menu-slide\':showmenu}">' +
                   '<div class="it-sidebar-inner">'+
                        '<div class="nav navbar navbar-inverse">'+
                        '<nav class="" ng-transclude ></nav>' +
                        '</div>'+
                    '</div>'+
                '</div>'


        }
});
'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itSideMenuContent

 * @module itesoft
 * @restrict E
 * @parent itesoft/sideMenus
 *
 * @description
 * A container for a side menu, sibling to an directive.
 * see {@link itesoft.directive:itSideMenus `<it-side-menus>`}.
 * @usage
 * <it-side-menu>
 * </it-side-menu>
 */
IteSoft

    .directive('itSideMenuContent',function(){
        return {
            restrict : 'ECA',
            require : '^itSideMenus',
            transclude : true,
            scope : true,
            template :
                '<div class="it-menu-content" ng-class="{\'it-side-menu-overlay\':showmenu}">' +
                    '<div class="it-container it-fill" ng-transclude></div>'+
                '</div>'
        }
    });
'use strict';

IteSoft
    .controller("$sideMenuCtrl",[
        '$scope',
        '$document',
        '$timeout'
        ,'$window',
        function($scope,
                 $document,
                 $timeout,
                 $window){
        var _self = this;
        _self.scope = $scope;

        _self.scope.showmenu = false;
        _self.toggleMenu = function(){

            _self.scope.showmenu=(_self.scope.showmenu) ? false : true;

            $timeout(function(){
                var event = document.createEvent('Event');
                event.initEvent('resize', true /*bubbles*/, true /*cancelable*/);
                $window.dispatchEvent(event);
            },300)
        };
        _self.hideSideMenu = function(){
            _self.scope.showmenu= false;
        }
    }]);

'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itSideMenuHeader
 * @module itesoft
 * @restrict E
 * @parent sideMenus
 *
 * @description
 * A container for a side menu header.
 * see {@link itesoft.directive:itSideMenus `<it-side-menus>`}
 *
 * <table class="table">
 *  <tr>
 *   <td><code>it-animate="true | false"</code></td>
 *   <td>Static or animated button.</td>
 *  </tr>
 *  <tr>
 *   <td><code>it-button-menu="true | false"</code></td>
 *   <td>show or hide side menu button</td>
 *  </tr>
 *</table>
 *
 * @usage
 * <it-side-menu-header it-animate="true | false" it-hide-button-menu="true | false">
 * </it-side-menu-header>
 */
IteSoft
    .directive('itSideMenuHeader',['$rootScope',function($rootScope){
        return {
            restrict: 'E',
            require : '^itSideMenus',
            transclude : true,
            scope: true,
            link : function (scope, element, attrs ,sideMenuCtrl) {

                var child = angular.element(element[0]
                    .querySelector('.it-material-design-hamburger__layer'));
                var button = angular.element(element[0]
                    .querySelector('.it-material-design-hamburger__icon'));

                scope.toggleMenu = sideMenuCtrl.toggleMenu;
                if(attrs.itAnimate === "true") {
                    scope.$watch('showmenu', function (newValue, oldValue) {
                        if (newValue != oldValue) {
                            if (!newValue) {
                                child.removeClass('it-material-design-hamburger__icon--to-arrow');
                                child.addClass('it-material-design-hamburger__icon--from-arrow');
                                $rootScope.$broadcast('it-sidemenu-state', 'opened');
                            } else {
                                child.removeClass('it-material-design-hamburger__icon--from-arrow');
                                child.addClass('it-material-design-hamburger__icon--to-arrow');
                                $rootScope.$broadcast('it-sidemenu-state', 'closed');
                            }
                        }
                    }, true);
                }

                if(attrs.itHideButtonMenu){
                    scope.itHideButtonMenu = scope.$eval(attrs.itHideButtonMenu);

                }
                scope.$watch(attrs.itHideButtonMenu, function(newValue, oldValue) {
                    scope.itHideButtonMenu = newValue;
                    if(newValue){
                        sideMenuCtrl.hideSideMenu();
                    }
                });

            },
            template :
                '<nav id="header" class="it-side-menu-header nav navbar navbar-fixed-top navbar-inverse">' +
                    '<section class="it-material-design-hamburger" ng-hide="itHideButtonMenu">' +
                        '<button  ng-click="toggleMenu()" class="it-material-design-hamburger__icon">' +
                            '<span class="it-menu-animated it-material-design-hamburger__layer"> ' +
                            '</span>' +
                        '</button>' +
                    ' </section>' +
                    '<div class="container-fluid" ng-transclude>' +
                    '</div>' +
                '</nav>'
        }
    }]);

'use strict';
/**
 * @ngdoc directive
 * @name itesoft.directive:itSideMenus
 * @module itesoft
 * @restrict ECA
 *
 * @description
 * A container element for side menu(s) and the main content. Allows the left and/or right side menu
 * to be toggled by dragging the main content area side to side.
 *
 * To use side menus, add an `<it-side-menus>` parent element. This will encompass all pages that have a
 * side menu, and have at least 2 child elements: 1 `<it-side-menu-content>` for the center content,
 * and `<it-side-menu>` directives
 *

 *
 * ```html
 * <it-side-menus>
 *
 *  <it-side-menu-header it-animate="true"  it-hide-button-menu="true">
 *  </it-side-menu-header>
 *
 *   <!-- Center content -->
 *
 *   <it-side-menu-content>
 *   </it-side-menu-content>
 *
 *   <!-- menu -->
 *
 *
 *   <it-side-menu >
 *   </it-side-menu>
 *
 * </it-side-menus>
 * ```
 * @example
    <example module="itesoft">
        <file name="index.html">

         <it-side-menus>
             <it-side-menu-header it-animate="true"  it-button-menu="true">


             </it-side-menu-header>

             <it-side-menu>
                     <ul it-nav-active="active" class="nav navbar-nav nav-pills nav-stacked list-group">


                     <li it-collapsed-item=""   >
                     <a href=""><h5>Menu</h5></a>
                     <ul  class="nav navbar-nav nav-pills nav-stacked it-menu-animated">
                     <li >
                     <a href="#/widget/itloader">SubMenu1</a>
                     </li>
                     <li >
                     <a href="#/widget/itBottomGlue">SubMenu2</a>
                     </li>
                     </ul>
                     </li>
                     </ul>
              </it-side-menu>


             <it-side-menu-content>

                 <h1>See on Plunker !</h1>

             </it-side-menu-content>
         </it-side-menus>

    </file>
  </example>
 */
IteSoft
    .directive('itSideMenus',function(){
        return {
            restrict: 'ECA',
            transclude : true,
            controller : '$sideMenuCtrl',
            template : '<div class="it-side-menu-group" ng-transclude></div>'
        }
});
'use strict';
IteSoft
    .directive('itSidePanel', ['FilterViewService', function (FilterViewService) {
        function _link(scope) {
            scope.filterViewService = FilterViewService;
        }
        return {
            scope: {
                changeHandler: '&clear'
            },
            link: _link,
            restrict: 'AE',
            transclude: true,
            template: '<div class="side-panel panel-filters animate-show" ng-class="{\'side-panel-show\': filterViewService.getShowFilter() && filterViewService.needFilters}"> </div> <div class="side-panel-top panel-filters vertical-text animate-show" ng-class="{\'side-panel-right\':filterViewService.getShowFilter() && filterViewService.needFilters,\'side-panel-right-collapse\':!filterViewService.getShowFilter() && filterViewService.needFilters}" ng-click="filterViewService.setShowFilter()"> <span class="fa fa-search"></span> </div> <div class="side-panel-top panel-refresh animate-show" ng-class="{\'side-panel-right-collapse\': filterViewService.needRefresh}" ng-click="filterViewService.setRefresh(!filterViewService.isRefreshAutoActive)"> <span class="fa-stack"> <i class="fa fa-refresh fa-stack-1x" ng-class="{\'fa-spin\':filterViewService.filterOptions.autoRefresh && filterViewService.isRefreshAutoActive,\'\':!filterViewService.isRefreshAutoActive || !filterViewService.filterOptions.autoRefresh }"> </i> <i class="fa fa-ban fa-stack-2x text-danger" ng-show="!filterViewService.filterOptions.autoRefresh"> </i> </span> </div>'
        };
    }]);


'use strict';

IteSoft
    .directive('itFillHeight', ['$window', '$document', function($window, $document) {
        return {
            restrict: 'A',
            scope: {
                footerElementId: '@',
                additionalPadding: '@'
            },
            link: function (scope, element, attrs) {

                angular.element($window).on('resize', onWindowResize);

                onWindowResize();

                function onWindowResize() {
                    var footerElement = angular.element($document[0].getElementById(scope.footerElementId));
                    var footerElementHeight;

                    if (footerElement.length === 1) {
                        footerElementHeight = footerElement[0].offsetHeight
                            + getTopMarginAndBorderHeight(footerElement)
                            + getBottomMarginAndBorderHeight(footerElement);
                    } else {
                        footerElementHeight = 0;
                    }

                    var elementOffsetTop = element[0].offsetTop;
                    var elementBottomMarginAndBorderHeight = getBottomMarginAndBorderHeight(element);

                    var additionalPadding = scope.additionalPadding || 0;

                    var elementHeight = $window.innerHeight
                        - elementOffsetTop
                        - elementBottomMarginAndBorderHeight
                        - footerElementHeight
                        - additionalPadding;

                    element.css('height', elementHeight + 'px');
                }

                function getTopMarginAndBorderHeight(element) {
                    var footerTopMarginHeight = getCssNumeric(element, 'margin-top');
                    var footerTopBorderHeight = getCssNumeric(element, 'border-top-width');
                    return footerTopMarginHeight + footerTopBorderHeight;
                }

                function getBottomMarginAndBorderHeight(element) {
                    var footerBottomMarginHeight = getCssNumeric(element, 'margin-bottom');
                    var footerBottomBorderHeight = getCssNumeric(element, 'border-bottom-width');
                    return footerBottomMarginHeight + footerBottomBorderHeight;
                }

                function getCssNumeric(element, propertyName) {
                    return parseInt(element.css(propertyName), 10) || 0;
                }
            }
        };

    }]);


'use strict';

IteSoft
    .directive('itViewMasterHeader',function(){
        return {
            restrict: 'E',
            transclude : true,
            scope:true,
            template :  '<div class="row">' +
                            '<div class="col-md-6">' +
                                '<div class="btn-toolbar" ng-transclude>' +
                                '</div>' +
                            '</div>' +
                            '<div class="col-md-6 pull-right">' +
                                '<div>' +
            '<form>' +
            '<div class="form-group has-feedback">' +
            '<span class="glyphicon glyphicon-search form-control-feedback"></span>' +
            '<input it-input class="form-control" type="text" placeholder="Rechercher"/>' +
            '</div>' +
            '</form>' +
            '</div>' +
            '</div>' +
            '</div>'
        }
    });

'use strict';

IteSoft
    .directive('itViewPanel',function(){
        return {
            restrict: 'E',
            transclude : true,
            scope:true,
            template : '<div class="jumbotron" ng-transclude></div>'
        }
    });

'use strict';

IteSoft
    .directive('itViewTitle',function(){
        return {
            restrict: 'E',
            transclude : true,
            scope:true,
            template : '<div class="row"><div class="col-xs-12"><h3 ng-transclude></h3><hr></div></div>'
        }
    });

/**
 * @ngdoc filter
 * @name itesoft.filter:itUnicode
 * @module itesoft
 * @restrict EA
 *
 * @description
 * Simple filter that escape string to unicode.
 *
 *
 * @example
    <example module="itesoft">
        <file name="index.html">
             <div ng-controller="myController">
                <p ng-bind-html="stringToEscape | itUnicode"></p>

                 {{stringToEscape | itUnicode}}
             </div>
        </file>
         <file name="Controller.js">
            angular.module('itesoft')
                .controller('myController',function($scope){
                 $scope.stringToEscape = 'o"@&\'';
            });

         </file>
    </example>
 */
IteSoft
    .filter('itUnicode',['$sce', function($sce){
        return function(input) {
            function _toUnicode(theString) {
                var unicodeString = '';
                for (var i=0; i < theString.length; i++) {
                    var theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
                    while (theUnicode.length < 4) {
                        theUnicode = '0' + theUnicode;
                    }
                    theUnicode = '&#x' + theUnicode + ";";

                    unicodeString += theUnicode;
                }
                return unicodeString;
            }
            return $sce.trustAsHtml(_toUnicode(input));
        };
}]);


'use strict';
/**
 * @ngdoc service
 * @name itesoft.service:itPopup
 * @module itesoft
 * @requires $uibModal
 * @requires $uibModalStack
 * @requires $rootScope
 * @requires $q
 *
 * @description
 * The Itesoft Popup service allows programmatically creating and showing popup windows that require the user to respond in order to continue.
 * The popup system has support for more flexible versions of the built in alert(),
 * prompt(), and confirm() functions that users are used to,
 * in addition to allowing popups with completely custom content and look.
 *
 * @example
    <example module="itesoft">

        <file name="Controller.js">
             angular.module('itesoft')
             .controller('PopupCtrl',['$scope','itPopup', function($scope,itPopup) {

                  $scope.showAlert = function(){
                      var alertPopup = itPopup.alert({
                          title: "{{'POPUP_TITLE' | translate}}",
                          text: "{{'POPUP_CONTENT' | translate}}"
                      });
                      alertPopup.then(function() {
                         alert('alert callback');
                      });
                  };

                  $scope.showConfirm = function(){
                      var confirmPopup = itPopup.confirm({
                          title: "{{'POPUP_TITLE' | translate}}",
                          text: "{{'POPUP_CONTENT' | translate}}",
                          buttons: [

                              {
                                  text: 'Cancel',
                                  type: '',
                                  onTap: function () {
                                      return false;
                                  }
                              },
                              {
                                  text: 'ok',
                                  type: '',
                                  onTap: function () {
                                      return true;
                                  }
                              }
                             ]
                      });
                      confirmPopup.then(function(res) {

                          alert('confirm validate');
                      },function(){
                          alert('confirm canceled');
                      });
                  };

              $scope.data = {};
              $scope.data.user =  '';

              $scope.showCustomConfirm = function(){
              var customPopup = itPopup.custom({
                  title: 'My Custom title',
                  scope: $scope,
                  backdrop:false,
                  text: '<h3 id="example_my-custom-html-content">My custom html content</h3> <p>{{data.user}} </p>  <input it-input class="form-control floating-label" type="text" it-label="Email Required!!" ng-model="data.user">',
                  buttons: [{
                          text: 'My Custom Action Button',
                          type: 'btn-danger',
                          onTap: function (event,scope) {
                               console.log(scope.data );
                               if(typeof scope.data.user === 'undefined' ||scope.data.user ==='' ){
                                    event.preventDefault();
                               }
                              return true;
                          }
                      }
                  ]
              });
              customPopup.then(function(res) {
                 console.log(res);
                  alert('confirm validate');
              },function(){
                  alert('confirm canceled');
              });
              };

              $scope.showPrompt = function(){
                  var promptPopup = itPopup.prompt({
                      title: "{{'POPUP_TITLE' | translate}}",
                      text: "{{'POPUP_CONTENT' | translate}}",
                      inputLabel : "{{'POPUP_LABEL' | translate}}",
                      inputType: 'password'
                  });
                  promptPopup.then(function(data) {
                      alert('prompt validate with value ' + data.response);
                  },function(){
                      alert('prompt canceled');
                  });
              };

              }]);

         </file>
         <file name="index.html">
             <div ng-controller="PopupCtrl">
                 <button class="btn btn-info" ng-click="showAlert()">
                 Alert
                 </button>
                 <button class="btn btn-danger" ng-click="showConfirm()">
                 Confirm
                 </button>
                 <button class="btn btn-warning" ng-click="showPrompt()">
                 Prompt
                 </button>

                 <button class="btn btn-warning" ng-click="showCustomConfirm()">
                 My Custom popup
                 </button>
             </div>
         </file>
     </example>
 */

IteSoft
    .factory('itPopup',['$uibModal','$uibModalStack','$rootScope','$q','$compile',function($modal,$modalStack,$rootScope,$q,$compile){

        var MODAL_TPLS = '<div class="modal-header it-view-header">' +
                             '<h3 it-compile="options.title"></h3>'+
                         '</div>'+
                         '<div class="modal-body">'+
                            '<p it-compile="options.text"></p>'+
                         '</div>'+
                         '<div class="modal-footer">'+
                              '<button ng-repeat="button in options.buttons" class="btn btn-raised {{button.type}}" ng-click="itButtonAction($event,button)" it-compile="button.text"></button>'+
                         '</div>';

        var MODAL_TPLS_PROMT = '<div class="modal-header it-view-header">' +
            '<h3 it-compile="options.title"></h3>'+
            '</div>'+
            '</div>'+
            '<div class="modal-body">'+
            '<p it-compile="options.text"></p>'+
            '   <div class="form-group">'+
            '<div class="form-control-wrapper"><input type="{{options.inputType}}" class="form-control" ng-model="data.response"  placeholder="{{options.inputPlaceholder}}"></div>'+
            '</div>'+
            '</div>'+
            '<div class="modal-footer">'+
            '<button ng-repeat="button in options.buttons" class="btn btn-raised {{button.type}}" ng-click="itButtonAction($event,button)" it-compile="button.text"></button>'+
            '</div>';

        var itPopup = {
            alert : _showAlert,
            confirm :_showConfirm,
            prompt : _showPromt,
            custom : _showCustom
        };

        function _createPopup(options){
            var self = {};
            self.scope = (options.scope || $rootScope).$new();

            self.responseDeferred = $q.defer();
            self.scope.$buttonTapped= function(event, button ) {
                var result = (button.onTap || noop)(event);
                self.responseDeferred.resolve(result);
            };

            function _noop(){
                return false;
            }

            options = angular.extend({
                scope: self.scope,
                template : MODAL_TPLS,

                controller :['$scope' ,'$modalInstance',function($scope, $modalInstance) {
                   // $scope.data = {};
                    $scope.itButtonAction= function(event, button ) {
                        var todo = (button.onTap || _noop)(event,$scope);

                        var result = todo;
                        if (!event.isDefaultPrevented()) {
                            self.responseDeferred.resolve(result ? close() : cancel());
                        }
                    };

                    function close(){
                        $modalInstance.close($scope.data);
                    }
                    function cancel() {
                        $modalInstance.dismiss('cancel');
                    }
                }],
                buttons: []
            }, options || {});

            options.scope.options = options;


            self.options = options;

            return self;

        }

        function _showPopup(options){
            $modalStack.dismissAll();
            var popup = _createPopup(options);

            return  $modal.open(popup.options).result;
        }

        function _showAlert(opts){
            $modalStack.dismissAll();

            return _showPopup(angular.extend({

                buttons: [{
                    text: opts.okText || 'OK',
                    type: opts.okType || 'btn-info',
                    onTap: function() {
                        return true;
                    }
                }]
            }, opts || {}));
        }

        function _showConfirm(opts){
            $modalStack.dismissAll();

            return _showPopup(angular.extend({
                buttons: [
                    {
                        text: opts.okText || 'OK',
                        type: opts.okType || 'btn-info',
                        onTap: function() { return true; }
                    },{
                        text: opts.cancelText || 'Cancel',
                        type: opts.cancelType || '',
                        onTap: function() { return false; }
                    }]
            }, opts || {}));
        }


        function _showCustom(opts){
            $modalStack.dismissAll();
         return   _showPopup(opts);
        }

        function _showPromt(opts){
            $modalStack.dismissAll();

            var scope = $rootScope.$new(true);
            scope.data = {};
            var text = '';
            if (opts.template && /<[a-z][\s\S]*>/i.test(opts.template) === false) {
                text = '<span>' + opts.template + '</span>';
                delete opts.template;
            }

            return _showPopup(angular.extend({
                template : MODAL_TPLS_PROMT,
                inputLabel : opts.inputLabel || '',
                buttons: [
                    {
                        text: opts.okText || 'OK',
                        type: opts.okType || 'btn-info',
                        onTap: function() {
                            return true;
                        }
                    },
                    {
                        text: opts.cancelText || 'Cancel',
                        type: opts.cancelType || '',
                        onTap: function() {}
                    } ]
            }, opts || {}));
        }
        return itPopup;
    }]);