/*global describe,beforeEach,inject,angular,it,expect */

describe('Unit: diMoreable', function() {
   beforeEach(module('di.moreable'));

   var directive, scope, compiled, elem
     , html = [
         '<div di-moreable="200" moreable-api="moreableApi">',
            '<div di-moreable-item>',
            '</div>',
            '<div>',
                '<a href="javascript:void()" di-moreable-trigger>See More</a>',
            '</div>',
         '</div>'
     ].join('')
   ;

   beforeEach(inject(function($compile, $rootScope) {
       scope = $rootScope;
       scope.moreableApi = {};
       elem = angular.element(html);
       $compile(elem)(scope);
       scope.$digest();
   }));

   it('should expose api', function() {
        expect(scope.moreableApi.refresh).toBeDefined();
        expect(scope.moreableApi.expand).toBeDefined();
        expect(scope.moreableApi.collapse).toBeDefined();
        expect(scope.moreableApi.toggle).toBeDefined();
        expect(scope.moreableApi.isExpanded).toBeDefined();
        expect(typeof scope.moreableApi.refresh).toBe('function');
   });

   it('should be collapsed to start', function() {
       expect(scope.moreableApi.isExpanded()).toBe(false);
   });
});
