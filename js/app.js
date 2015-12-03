var app = angular.module('prototype', ['ngRoute'])

  app.config(function ($routeProvider) {
      $routeProvider.when('/home', {
          controller: homeCtrl,
          templateUrl: 'templates/home.html'
      });
      $routeProvider.when('/login', {
          controller: loginCtrl,
          templateUrl: 'templates/login.html'
      });
      $routeProvider.when('/game/:id', {
          controller: gameCtrl,
          templateUrl: 'templates/game.html'
      });
      $routeProvider.when('/result/:id', {
          controller: resultCtrl,
          templateUrl: 'templates/result.html'
      });
      $routeProvider.otherwise({
          redirectTo : '/home'
      });
  });

  app.factory('storageService', function ($rootScope) {
      return { 
          get: function (key) {
             return JSON.parse(localStorage.getItem(key));
          },
          save: function (key, data) {
             localStorage.setItem(key, JSON.stringify(data));
          },
          remove: function (key) {
              localStorage.removeItem(key);
          },
          clearAll : function () {
              localStorage.clear();
          }
      };
  });

  app.factory('cacheService', function ($http, storageService) {
      return {
          getData: function (key) {
              return storageService.get(key);
          },
          setData: function (key,data) {
              storageService.save(key, data);
          },
          removeData: function (key) {
              storageService.remove(key);
          },
          clearAll: function () {
              storageService.clearAll();
          }
      };
  });

  app.factory('gameSetup', function () {
      return {
          load: function(id) { // load exercise from database
              return 'Teacher - Class' + id;
          }
      }
  });

  app.factory("defectList", function (Defect) {
      var listofdefects = [];
      return {
          get: function() {
              return listofdefects;
          },
          add: function(def) {
              listofdefects.push(def);
          },
          remove: function(id) {
              for (var i = 0; i < listofdefects.length; i++) {
                if (listofdefects[i].id === id) { 
                    listofdefects.splice(i, 1);
                    break;
                }
              }
          }
      }
  });   

  app.factory('Defect', function () {
    var defectID = 0;
    function Defect(type, start, end, code, description) {
      this.id = 'd' + defectID;
      this.type = type;
      this.start = start;
      this.end = end;
      this.code = code;
      this.description = description;
      this.active = false;
      defectID++;
    }
    return Defect;
  });

  /*app.directive('scrollIf', function () {
    return function (scope, element, attributes) {
      setTimeout(function () {
        if (scope.$eval(attributes.scrollIf)) {
          window.scrollTo(0, element[0].offsetTop - 100)
        }
      });
    }
  });*/

  function homeCtrl ($scope, $location, cacheService) {
      $scope.goToGame = function() {
          $location.path("/game/1");
      };
    //cacheService.setData('city', city);
  }     

  function loginCtrl ($scope) {
      $scope.cenas = "LOL123";
  }  

  function resultCtrl ($scope, $routeParams) {
      $scope.resultValue = "100";
  }

  function gameCtrl ($scope, $interval, $routeParams, $window, $http, gameSetup, defectList, Defect, cacheService) {
      
      $scope.gameID = $routeParams.id;
      $scope.gameDescription = gameSetup.load(2);
      $scope.wayOfTime = 0;

      if (true) { //check if countdown
          $scope.time = 3600;
          $scope.timeGoal = 0;
          $scope.wayOfTime = -1;
      } else {
          $scope.time = 0;
          $scope.timeGoal = 3600;
          $scope.wayOfTime = 1;
      }

      $scope.setClock = function () {
          var s = $scope.time % 60;
          if (s < 10) {
            s = '0' + s;
          }
          $scope.seconds = s;
          var m = Math.floor($scope.time / 60);
          var h = Math.floor(m / 60);
          m = m % 60;
          if (m < 10) {
            m = '0' + m;
          }
          $scope.minutes = m;
          $scope.hours = h;
      };
      $scope.setClock();
      $scope.timer = function () {
          $scope.time = $scope.time + $scope.wayOfTime;
          $scope.setClock();
          if ($scope.time == 0) {
            $scope.end();
          }
      };
      $interval($scope.timer, 1000);

      $scope.defects = defectList.get();
      $scope.selectedType = "";

      $scope.defectType = -1;
      $scope.minorDefect = 'unselectedMenuOption';
      $scope.majorDefect = 'unselectedMenuOption';

      $scope.setMinor = function () {
          $scope.defectType = 0;
          $scope.minorDefect = 'selectedMinorDefect';
          $scope.majorDefect = 'unselectedMenuOption';
      }
      $scope.setMajor = function () {
          $scope.defectType = 1;
          $scope.majorDefect = 'selectedMajorDefect';
          $scope.minorDefect = 'unselectedMenuOption';
      }

      $scope.selectType = function (type) {
          $scope.selectedType = type;
      }

      $scope.dump = function (obj) {
          var out = '';
          for (var i in obj) {
              out += i + ": " + obj[i] + "\n";
          }

          alert(out);

          // or, if you wanted to avoid alerts...

          var pre = document.createElement('pre');
          pre.innerHTML = out;
          document.body.appendChild(pre)
      }

      $scope.pinpointDefect = function () {
          if ($scope.defectType == 0 || $scope.defectType == 1) {
              if($scope.selectedType != "" && $scope.selectedType != null) {
                  var selectedText = $scope.getSelectionPosition();
                  if (selectedText.text != "" && selectedText.text != null && selectedText.text != undefined) {
                      var newdefect = new Defect($scope.defectType,selectedText.start,selectedText.end,selectedText.text,$scope.selectedType);
                      $scope.markText(selectedText, newdefect.id);
                      defectList.add(newdefect);
                  } else {
                      alert('No selection');
                  }
              } else {
                  alert('No selected type');
              }
          } else {
              alert('None');
          }
      }

      $scope.removeDefect = function (defectID) {
          defectList.remove(defectID);
          $('#' + defectID).attr("class", "");
      }

      $scope.getSelectionPosition = function () {
          var range = window.getSelection().getRangeAt(0);
          var preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(document.getElementById("code"));
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          var start = preSelectionRange.toString().length;
          return {
              start: start,
              end: start + range.toString().length,
              text: range.toString()
          }
      }
      
      $scope.markText = function(markInfo, defectID) {
          var selection = window.getSelection().getRangeAt(0);
          var selectedText = selection.extractContents();
          if (markInfo.text != "" && markInfo.text != null && markInfo.text != undefined) {
              var span = document.createElement("span");
              span.className = "mark";
              span.setAttribute("id", defectID);
              span.setAttribute("PosStart", markInfo.start);
              span.setAttribute("PosEnd", markInfo.end);
              span.appendChild(selectedText);
              selection.insertNode(span);
              $('#' + defectID).attr("class", "mark");
              return markInfo.text;
          } else {
              return null;
          }
      };
  
      $scope.removeMarks = function() {
          $('.mark').each(function () {
              $(this).contents().unwrap();
          });
          $('.currentmark').each(function () {
              $(this).contents().unwrap();
          });
      }

      $scope.jumpToDefect = function (defectID) {
          
      }

      $scope.confirmEnd = function () {
          $http.get('http://127.0.0.1:8000/users', { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}})
            .success(function (data){
                alert("Success");
            }).error(function (data, status){
                alert("Error status : " + status);
            });
      }

      $scope.end = function () {
          $scope.wayOfTime = 0;
      }
      
  }