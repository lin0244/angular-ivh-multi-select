
describe('Directive: ivhMultiSelect', function() {
  'use strict';

  beforeEach(module('ivh.multiSelect'));

  var ng = angular
    , $ = jQuery
    , scope
    , c; // compile

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    c = function(tpl, s) {
      s = s || scope;
      tpl = ng.isArray(tpl) ? tpl.join('\n') : tpl;
      var $el = $compile(ng.element(tpl))(s);
      s.$apply();
      return $el;
    };
  }));

  it('should create a button with text as the transcluded content', function() {
    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="[]">',
        'Blargus',
      '</div>'
    ]);

    var tText = $el.text().trim();
    expect(tText).toBe('Blargus');
  });

  it('Its watcher count should be invariant in the number of list items while collapsed', function() {
    scope.items1 = [{label: 'foo'}];
    scope.items2 = [{label: 'foo'}, {label: 'bar'}, {label: 'wowza'}];

    var $el1 = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items1">',
        'Blargus',
      '</div>'
    ]);

    var $el2 = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items2">',
        'Blargus',
      '</div>'
    ]);

    var numWatchers1 = countWacthers($el1);
    var numWatchers2 = countWacthers($el2);

    expect(numWatchers1).toBe(numWatchers2);
  });

  it('should display items when the button is clicked', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var liText = $el.find('li.ms-item').first().text().trim();

    expect(liText).toBe('foo');
  });

  it('should add items to the menu when added later', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    scope.items.push({label: 'bar'});
    scope.$apply();
    var numLis = $el.find('li.ms-item').length;

    expect(numLis).toBe(2);
  });

  it('should update the list when it changes reference', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    scope.items = [{label: 'a'}, {label: 'b'}, {label: 'c'}];

    scope.$apply();
    var numLis = $el.find('li.ms-item').length;

    expect(numLis).toBe(3);
  });

  it('should allow a custom label expression', function() {
    scope.items = [{
      name: 'Foo',
      num: 5
    }, {
      name: 'Bar',
      num: 9
    }];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items"',
          'ivh-multi-select-label-expression="\'{{item.num}}: {{item.name}}\'">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var t = $el.find('li.ms-item').first().text().trim();
    expect(t).toBe('5: Foo');
  });

  it('should allow variable label expressions', function() {
    scope.items = [{
      name: 'Foo',
      num: 5
    }, {
      name: 'Bar',
      num: 9
    }];

    // But... it will change later ;)
    scope.labelExpr = '{{item.name}}';

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items"',
          'ivh-multi-select-label-expression="labelExpr">',
        'Blargus',
      '</div>'
    ]);

    // Oh nos! It's different!
    scope.labelExpr = '{{item.num}}: {{item.name}}';
    scope.$apply();

    $el.find('button').click();

    var t = $el.find('li.ms-item').first().text().trim();
    expect(t).toBe('5: Foo');
  });

  it('should allow functions that return a label expression', function() {
    scope.items = [{
      name: 'Foo',
      num: 5
    }, {
      name: 'Bar',
      num: 9
    }];

    scope.getLabelExpr = function() {
      return '{{item.num}}: {{item.name}}';
    };

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items"',
          'ivh-multi-select-label-expression="getLabelExpr()">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    var t = $el.find('li.ms-item').first().text().trim();
    expect(t).toBe('5: Foo');
  });

  it('should allow a variable which holds the list of selected items', function() {
    scope.items = [{label: 'foo'}];
    scope.selectedItems = [];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items"',
          'selection-model-selected-items="selectedItems">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();
    $el.find('li.ms-item').first().click();

    expect(scope.selectedItems.length).toBe(1);
  });

  it('should show the all/none buttons when multi-select is enabled', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    expect($el.find('button:contains("All")').length).toBe(1);
    expect($el.find('button:contains("None")').length).toBe(1);
  });

  it('should not show the all/none buttons when multi-select is disabled', function() {
    scope.items = [{label: 'foo'}];

    var $el = c([
      '<div ivh-multi-select',
          'ivh-multi-select-items="items"',
          'selection-model-mode="\'single\'">',
        'Blargus',
      '</div>'
    ]);

    $el.find('button').click();

    expect($el.find('button:contains("All")').length).toBe(0);
    expect($el.find('button:contains("None")').length).toBe(0);
  });

  describe('filtering', function() {
    var doFilter = function($el, str) {
      var $msFilter = $el.find('input[type=text]');
      $msFilter.val(str);
      $msFilter.change();
      inject(function($timeout) {
        $timeout.flush();
      });
    };

    it('should filter by label attribute', function() {
      scope.items = [{label: 'foo'}, {label: 'bar'}];

      var $el = c([
        '<div ivh-multi-select',
            'ivh-multi-select-items="items">',
          'Blargus',
        '</div>'
      ]);

      $el.find('button').click();

      doFilter($el, 'foo');

      var msItems = $el.find('li.ms-item');
      expect(msItems.length).toBe(1);
    });

    it('should filter by label expression', function() {
      scope.items = [{name: 'foo'}, {name: 'bar'}];

      var $el = c([
        '<div ivh-multi-select',
            'ivh-multi-select-items="items"',
            'ivh-multi-select-label-expression="\'{{item.name}}ey\'">',
          'Blargus',
        '</div>'
      ]);

      $el.find('button').click();

      doFilter($el, 'fooey');

      var msItems = $el.find('li.ms-item');
      expect(msItems.length).toBe(1);
    });

    it('should not consider other attributes when filtering', function() {
      scope.items = [{label: 'foo', secret: 'wow'}, {label: 'bar'}];

      var $el = c([
        '<div ivh-multi-select',
            'ivh-multi-select-items="items">',
          'Blargus',
        '</div>'
      ]);

      $el.find('button').click();

      doFilter($el, 'wow');

      var msItems = $el.find('li.ms-item');
      expect(msItems.length).toBe(0);
    });

  });
});
