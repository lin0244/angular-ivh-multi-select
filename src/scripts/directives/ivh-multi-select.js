
/**
 * The Multi Select directive
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelect', function() {
    'use strict';
    return {
      scope: {
        items: '=ivhMultiSelectItems',
        labelAttr: '=ivhMultiSelectLabelAttribute',

        /**
         * Options for selection model
         */
        selType: '=selectionModelType',
        selMode: '=selectionModelMode',
        selAttr: '=selectionModelSelectedAttribute',
        selClass: '=selectionModelSelectedClass',
        selCleanup: '=selectionModelCleanupStrategy'
      },
      restrict: 'AE',
      templateUrl: 'src/views/ivh-multi-select.html',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', '$injector', 'filterFilter', 'selectionModelOptions',
          function($document, $scope, $injector, filterFilter, selectionModelOptions) {
        var ms = this;

        /**
         * @todo Forward options to ivh-pager
         */
        var pagerPageSize = 10
          , pagerUsePager = true;

        /**
         * We're embedding selection-model
         *
         * Forward supported `selection-model-*` attributes to the underlying
         * directive.
         */
        ms.sel = angular.extend({},
          // Global defaults
          selectionModelOptions.get(),
          // Our defaults
          {
            type: 'checkbox',
            mode: 'multi-additive'
          });

        // Fold inline props over everything if provided
        angular.forEach([
          // [ **selection model prop**, **value** ]
          ['type', 'selType'],
          ['mode', 'selMode'],
          ['selectedAttribute', 'selAttr'],
          ['selectedClass', 'selClass'],
          ['cleanupStategy', 'selCleanup']
        ], function(p) {
          if($scope[1]) {
            ms.sel[p[0]] = $scope[1];
          }

          var unwatch = $scope.$watch(p[1], function(newVal) {
            if(newVal) {
              ms.sel[p[0]] = newVal;
            }
          });

          $scope.$on('$destroy', unwatch);
        });

        /**
         * The collection item attribute to display as a label
         */
        ms.labelAttr = $scope.labelAttr || 'label';

        /**
         * Whether or not the dropdown is displayed
         *
         * Toggled whenever the user clicks the ol' button
         */
        ms.isOpen = false;

        /**
         * Attach the passed items to our controller for consistent interface
         *
         * Will be updated from the view as `$scope.items` changes
         */
        ms.items = $scope.items;

        /**
         * The filter string entered by the user into our input control
         */
        ms.filterString = '';

        /**
         * We optionally suppor the ivh.pager module
         *
         * If it is present your items will be paged otherwise all are displayed
         */
        ms.hasPager = pagerUsePager && $injector.has('ivhPaginateFilter');
        ms.ixPage = 0;
        ms.sizePage = pagerPageSize;

        /**
         * Select all (or deselect) *not filtered out* items
         *
         * Note that if paging is enabled items on other pages will still be
         * selected as normal.
         */
        ms.selectAllVisible = function(isSelected) {
          isSelected = angular.isDefined(isSelected) ?  isSelected : true;
          var selectedAttr = ms.sel.selectedAttribute;
          angular.forEach(ms.items, function(item) {
            item[selectedAttr] = isSelected;
          });
        };

        /**
         * Clicks on the body should close this multiselect
         *
         * ... unless the element has been tagged with
         * ivh-multi-select-stay-open... ;)
         *
         * Be a good doobee and clean up this click handler when our scope is
         * destroyed
         */
        var $bod = $document.find('body');

        var collapseMe = function($event) {
          var evt = $event.originalEvent || $event;
          if(!evt.ivhMultiSelectIgnore) {
            ms.isOpen = false;
            $scope.$digest();
          }
        };

        $bod.on('click', collapseMe);

        $scope.$on('$destroy', function() {
          $bod.off('click', collapseMe);
        });
      }]
    };
  });
