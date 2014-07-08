/*global angular,xyz, Class*/

(function(angular) {

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */

var Class;

// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){
      xyz; //jshint ignore:line
  }) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();

var BaseDirective = Class.extend({
    init: function() {
        var config;
        if(( config = this.config )) {
            angular.forEach(['link', 'compile'], function(fn) {
                if(config[fn]) 
                    config[fn] = angular.bind(this, config[fn]);
            }, this);
        } else if(this.link) {
            this.restrict = 'A';
            this.link = angular.bind(this, this.link || angular.noop);
        }
    }
});

/**
*  Controller to manage expand / collapse of 
*  a DOM element that is partially shown while collapsed
*  and fully shown while expanded
*/
var MoreableController = Class.extend({
    /**
    *  The fixed height of the element when it is partially shown
    */
    fixedHeight: null
    /**
    *  The calculated height of the element when it is fully shown
    */
    , autoHeight: null
    /**
    *  The element we are managing
    */
    , el: null
    /**
    *  Track the current state 
    */
    , expanded: false

    /**
    *  Get the state of the panel
    */
    , isExpanded: function() {
        return this.expanded;
    }

    /**
    *  @param {boolean} animate Whether or not to animate the height transition
    *  @param {height} the height to transition to
    */
    , updateHeight: function(animate, height) {
        var $el = angular.element(this.el);
        $el.css('overflow', 'hidden');

        if(animate && $el.animate) {
            $el.stop().animate({
                height: height
            });
        } else {
            $el.css('height', height);
        }
    }
    /**
    *  @param {boolean} animate Whether or not to animate the height transition
    */
    , expand: function(animate) {
        var height = (this.autoHeight = this.getAutoHeight(this.el));

        this.expanded = true;
        this.updateHeight(animate, height);
    }
    /**
    *  @param {boolean} animate Whether or not to animate the height transition
    */
    , collapse: function(animate) {
        var height = Math.min(( this.autoHeight = this.getAutoHeight(this.el) ), this.fixedHeight);

        this.expanded = false;
        this.updateHeight(animate, height);
    }
    /**
    *  @param {boolean} animate Whether or not to animate the height transition
    */
    , refresh: function(animate) {
        this[this.expanded ? 'expand' : 'collapse'](animate);
    }
    /**
    * Toggles the state of the panel
    *
    *  @param {boolean} animate Whether or not to animate the height transition
    */
    , toggle: function(animate) {
        this[this.expanded ? 'collapse' : 'expand'](animate);
    }
    /**
    *  Set the element whose height is being managed
    *
    *  @param {angular.element} The element to control
    */
    , setEl: function(el) {
        this.el = el;
    }
    /**
    *  Set the fixed height when the panel is collapsed
    *
    *  @param {integer} The fixed height to use
    */
    , setFixedHeight: function(height) {
        this.fixedHeight = height;
    }
    /**
    *  Update the display of all elements and parents
    *
    *  @protected
    *  @param {Node} The element to start at
    *  @param {string/array} If a string, update all css to display: <string>. 
    *                        If an array, shift each element off the array and update as 
    *                        if a string was provided.
    */
    , setDisplay: function(elem, val) {
        var i = elem
        , prev = []
        ;

        do { 
            prev.push(i.css('display')); 
            i.css('display', angular.isArray(val) ? val.shift() : val); 
        } while(( i = i.parent() )[0] && i[0].ownerDocument);

        return prev;
    }
    /**
    *  Calculate the auto height of an element
    *
    *  @protected
    *  @param {angular.element} The element to calculate for
    */
    , getAutoHeight: function($el) {
        var el      = $el[0]
        , origHeight = $el.css('height')
        , heightStr, heightArr, prev
        ;

        $el.css('height', 'auto');

        //make $elents visible to calculate full height
        prev = this.setDisplay($el, 'block');

        heightStr = el.ownerDocument.defaultView.getComputedStyle(el,null).height;
        heightArr = heightStr.match(/(\d+)px$/);

        this.setDisplay($el, prev);

        $el.css('height', origHeight);

        return heightArr ? parseInt(heightArr[1],10) : null;
    }
});

/**
*  @ngdoc directive
*  @name MoreableItem
*  @restrict A
*
*  Identifies the element that should expand / collapse
*  when the trigger is clicked. @see {@link MoreableDirective}
*/
var MoreableItem = BaseDirective.extend({
    config: {
        restrict: 'A'
        , require: '^diMoreable'
        , link: function(scope, elem, attrs, ctrl) {
            ctrl.setEl(angular.element(elem));
        }
    }
});

/**
*  @ngdoc directive
*  @name Moreable
*  @restrict A
*
*  The Moreable directive allows you to have a fixed
*  height div that can be triggered to slide to auto
*  height on the click of a trigger @see {@link MoreableTrigger}
*
*  Use the tv-moreable-api to expose important functions from the controller:
*  - refresh
*  - expand
*  - collapse
*  - toggle
*  - isExpanded
*
*  @example

<div tv-moreable="200" tv-moreable-api="advancedListMoreableApi">
<p tv-moreable-item>
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce sit amet tristique elit. 
Aenean justo nunc, commodo ut tincidunt quis, commodo non est. Ut sem elit, rutrum a elit
at, ultricies malesuada eros. Nullam accumsan, ligula in dignissim ullamcorper, urna erat
fermentum elit, sagittis laoreet ante orci eget turpis.  Duis semper eleifend dui. Etiam 
odio ligula, viverra sed dictum non, ornare a erat.  Phasellus pulvinar metus velit, ut 
pulvinar nisi volutpat sed. Quisque vitae ultricies purus. Vestibulum orci mi, vulputate
eu elit in, interdum pulvinar nisl. Integer lorem tellus, lacinia vel arcu interdum, 
venenatis suscipit mi. Morbi eu diam a nibh adipiscing ultrices ut tempor tellus. Quisque
luctus tortor lorem, ac vestibulum erat bibendum pretium.
</p>
<div>
<a tv-moreable-trigger href="javascript:void()" 
ng-bind="advancedListMoreableApi.isExpanded() ? 'See Less' : 'See More'">See More</a>
</div>
</div>

*/
var MoreableDirective = BaseDirective.extend({
    config: {
        restrict: 'A'
        , controller: MoreableController
        , scope: {
            moreableApi: '='
        }
        , compile: function(tElem, tAttrs) {
            var self = this;
            return function(scope, elem, attrs, ctrl) {
                ctrl.setFixedHeight(parseInt(attrs.diMoreable, 10));
                ctrl.collapse();

                if(scope.moreableApi) {
                    angular.extend(scope.moreableApi, {
                        expand       : angular.bind(ctrl, ctrl.expand)
                        , collapse   : angular.bind(ctrl, ctrl.collapse)
                        , toggle     : angular.bind(ctrl, ctrl.toggle)
                        , refresh    : angular.bind(ctrl, ctrl.refresh)
                        , isExpanded : angular.bind(ctrl, ctrl.isExpanded)
                    });
                }
            };
        }
    }
});

/**
*  @ngdoc directive
*  @name MoreableTrigger
*  @restrict A
*
*  The trigger directive that identifies the element
*  used for toggling / expanding the state of the moreable
*  panel @see {@link MoreableDirective}
*/
var MoreableTrigger = BaseDirective.extend({
    config: {
        restrict: 'A'
        , require: '^diMoreable'
        , scope: { }
        , link: function(scope, elem, attrs, ctrl) {
            var handler;

            elem.on('click', handler = function() {
                scope.$apply(function() {
                    ctrl.toggle(true);
                });
                return false;
            });

            scope.$on('$destroy', function() {
                elem.off('click', handler); 
            });

            scope.needsRoom = function() {
                return ctrl.autoHeight > ctrl.fixedHeight;
            };

            //determine if the auto height is actually greater than the 
            //fixed height. If not, hide the trigger.
            scope.$watch('needsRoom()', function(newValue, oldValue) {
                if(newValue) {
                    angular.element(elem).css('display', '');
                } else {
                    angular.element(elem).css('display', 'none');
                }
            });
        }
    }
});

function directiveFactory(Cls) {
    return function() {
        return ( new Cls() ).config; 
    };
}

angular.module('di.moreable', [])
  .directive('diMoreable',        directiveFactory(MoreableDirective))
  .directive('diMoreableItem',    directiveFactory(MoreableItem))
  .directive('diMoreableTrigger', directiveFactory(MoreableTrigger))
;    

})(angular);
