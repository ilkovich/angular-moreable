angular-moreable
================

angular module to hide/reveal long content by clicking a trigger button

Usage
================

See example/index.html for full source. In a nutshell:

```html
<div ng-controller="DemoController">
   <div di-moreable="200" moreable-api="moreableApi">
        <p style="width: 200px" di-moreable-item>
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
            <a href="javascript:void()" di-moreable-trigger 
               ng-bind="moreableApi.isExpanded() ? 'See Less' : 'See More'"
               ></a>
        </div>
   </div>
</div>
```

```js
angular.module('app'. ['di.moreable'])
 .controller('DemoController', function($scope) {
    $scope.moreableApi = {};
 });
```
