var app = angular.module('prototype', ['ngRoute'])

  app.config(function ($routeProvider, $httpProvider) {
      $routeProvider.when('/home', {
          controller: homeCtrl,
          templateUrl: 'templates/home.html'
      });
      $routeProvider.when('/login', {
          controller: loginCtrl,
          templateUrl: 'templates/login.html'
      });
      $routeProvider.when('/:gamemode/game/:id', {
          controller: gameCtrl,
          templateUrl: 'templates/game.html'
      });
      $routeProvider.when('/:gamemode/meeting/:id', {
          controller: meetingCtrl,
          templateUrl: 'templates/meeting.html'
      });
      $routeProvider.when('/:gamemode/result/:id', {
          controller: resultCtrl,
          templateUrl: 'templates/result.html'
      });
      $routeProvider.when('/ranking/:id', {
          controller: rankingCtrl,
          templateUrl: 'templates/ranking.html'
      });
      $routeProvider.otherwise({
          redirectTo : '/home'
      });
      $httpProvider.defaults.useXDomain = true;
      delete $httpProvider.defaults.headers.common["X-Requested-With"];
  });

  app.filter('capitalize', function() {
      return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
  });

  app.directive('smartchar', function () {
    return {
        scope: true,
        link: function (scope, element) {
            scope.id = parseInt(element.attr('id').split('a')[1]);
            scope.$on('text-was-selected', function(event, params){
                var begin = parseInt(params['begin'].split('a')[1]);
                var end = parseInt(params['end'].split('a')[1]);
                if(end>begin) {
                    if (scope.id >= begin && scope.id <= end) {
                        element.css('color', 'red');
                    }
                }else{
                    if (scope.id <= begin && scope.id >= end) {
                        element.css('color', 'red');
                    }
                }
            });
        }
    }
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
          setData: function (key, data) {
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
          getByID: function(id) {
              for (var i = 0; i < listofdefects.length; i++) {
                if (listofdefects[i].id === id) { 
                    return listofdefects[i];
                }
              }
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
          },
          toggleSelection: function(id) {
              for (var i = 0; i < listofdefects.length; i++) {
                if (listofdefects[i].id === id) { 
                    var newstate = !(listofdefects[i].active);
                    listofdefects[i].active = newstate;
                    break;
                }
              }
          },
          clear: function() {
              listofdefects.clear();
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
      this.active = true;
      this.upVotes = 0;
      this.downVotes = 0;
      defectID++;
    }
    return Defect;
  });

  function homeCtrl ($scope, $location, cacheService, $http) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $scope.user = cacheService.getData("user");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.testConnection = function() {
          var req = {
           method: 'GET',
           url: 'http://revision-jpguimaraes.rhcloud.com/',
           data: { test: 'teste'}
          }
          $http(req).then(function(res) 
            {
              alert("Connected");
            }, function(){
              alert("Error");
            });
      };
      $scope.goToChallengeGame = function(id) {
          $location.path("/challenge/game/" + id);
      };
      $scope.goToTeamGame = function(id) {
          $location.path("/team/game/" + id);
      };
      $scope.goToChallengeRanking = function(id) {
          $location.path("/ranking/" + id);
      };
      $scope.goToTeamRanking = function(id) {
          $location.path("/ranking/" + id);
      };
      $scope.logout = function() {
          cacheService.clearAll();
          $location.path("/");
      };
  }     

  function loginCtrl ($scope, $location, cacheService) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $location.path("/");
          }
      } catch (err) { }
      $scope.login = function() {
          if($scope.username == "teste" && $scope.username == "teste") {
              cacheService.setData("user", "1");
              $location.path("/");
          } else {
              alert("Login errado!");
          }
      };
  }  

  function meetingCtrl ($scope, $interval, $routeParams, $location, $window, $http, gameSetup, defectList, Defect, cacheService) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $scope.user = cacheService.getData("user");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.gameID = $routeParams.id;
      $scope.gameMode = $routeParams.gamemode;
      $scope.gameDescription = gameSetup.load(2);
      $scope.upVotedDefects = [];
      $scope.downVotedDefects = [];
      $scope.wayOfTime = 0;
      if (true) { //check if countdown
          $scope.time = 900;
          $scope.timeGoal = 0;
          $scope.wayOfTime = -1;
      } else {
          $scope.time = 0;
          $scope.timeGoal = 900;
          $scope.wayOfTime = 1;
      }
      $scope.setClock = function () { //passar para factory
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
      var newdefect = new Defect(0,10,20,"batatas",'lol');
      defectList.add(newdefect);
      $scope.toggleSelectionDefect = function (defectID) {
          defectList.toggleSelection(defectID);
      }
      $scope.voteDefectUp = function (defectID) {
          defectList.getByID(defectID).upVotes++; //add id to array of already upvoted. work like youtube ratings
      }
      $scope.voteDefectDown = function (defectID) {
          defectList.getByID(defectID).downVotes++;
      }
      $scope.role = true;
      $scope.confirmEnd = function () {
          /*if (confirm("Do you want to end?")) {
              $scope.end();
          }*/
          $scope.role = !($scope.role);
      }
      $scope.end = function () {
          $scope.wayOfTime = 0;
          alert("Ended");
          $location.path("/" + $scope.gameMode + "/result/" + $scope.gameID); //perhaps use the solution atempt id here
      }
  }

  function resultCtrl ($scope, $routeParams, $location, cacheService) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $scope.user = cacheService.getData("user");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.resultValue = "100";
      $scope.goToRanking = function () {
          $location.path("/ranking/" + $routeParams.id);
      }
      $scope.goToHome = function () {
          $location.path("/home");
      }
  }

  function rankingCtrl ($scope, $routeParams, $location, cacheService) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $scope.user = cacheService.getData("user");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.gameID = $routeParams.id;
      $scope.goToHome = function () {
          $location.path("/home");
      }
      $scope.logout = function() {
          cacheService.clearAll();
          $location.path("/");
      };
  }

  function gameCtrl ($scope, $interval, $routeParams, $location, $window, $http, gameSetup, defectList, Defect, cacheService) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $scope.user = cacheService.getData("user");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      if (!($routeParams.gamemode == "challenge" || $routeParams.gamemode == "team")) {
          $location.path("/");
      }
      $scope.gameID = $routeParams.id;
      $scope.gameMode = $routeParams.gamemode;
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

      // DUMP FUNCTION ===================
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
      // DUMP FUNCTION ===================

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

      // PINPOINT DEFECT ==========================
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
      // PINPOINT DEFECT ==========================

      $scope.jumpToDefect = function (defectID) {
          //TODO
      }
      $scope.confirmEnd = function () {
          if (confirm("Do you want to end?")) {
              $scope.end();
          }

      }
      $scope.end = function () {
          $scope.wayOfTime = 0;
          if($scope.gameMode == "challenge") {
              $location.path("/" + $scope.gameMode + "/result/" + $scope.gameID); //perhaps use the solution atempt id here
          } else if($scope.gameMode == "team") {
              $location.path("/" + $scope.gameMode + "/meeting/" + $scope.gameID); //perhaps use the solution atempt id here
          }
      }
      $scope.hoverRemoveButton = function () {
          $("#removedefectcell").css("background-color", "white");
      }
      $scope.leaveRemoveButton = function () {
          $("#removedefectcell").css("background-color", "#6495ed");
      }

      /*$(document).on('selectionchange', function (e) {
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
      };*/
  }