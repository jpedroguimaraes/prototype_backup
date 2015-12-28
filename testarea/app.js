var gamesApp = angular.module('prototype', []);

gamesApp.directive('smartchar', function () {
    return {
        scope: true,
        controller: ['$scope', '$element', function ($scope, $element) {
            console.log("ola");
            $scope.id = parseInt($element.attr('id').split('a')[1]);
            $scope.$on('text-was-selected', function(event, params){
            console.log("ola2");
                var begin = parseInt(params['begin'].split('a')[1]);
                var end = parseInt(params['end'].split('a')[1]);
                if(end>begin) {
                    if ($scope.id >= begin && $scope.id <= end) {
                        $element.css('color', 'red');
                    }
                }else{
                    if ($scope.id <= begin && $scope.id >= end) {
                        $element.css('color', 'red');
                    }
                }
            });
        }]
    }
});

gamesApp.controller('selectorCtrl', ['$scope', function($scope){
        $(document).on('selectionchange', function (e) {
            console.log("ola0");
            $scope.$broadcast('text-was-selected', $scope.getSelectionTextWrapper());
        });
        $scope.getSelectionTextWrapper = function () {
            var wrapperElements = null, selection;
            if (window.getSelection) {
                selection = window.getSelection();
                if (selection.rangeCount) {
                    wrapperElements = {begin:selection.anchorNode.parentNode.id, end: selection.focusNode.parentNode.id};
                }
            } else if (document.selection && document.selection.type != "Control") {
                //Tratar deste caso
                wrapperElements = document.selection.createRange().parentElement();
            }
            return wrapperElements;
        };
}]);