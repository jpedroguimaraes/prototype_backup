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
      //$httpProvider.defaults.useXDomain = true;
      //delete $httpProvider.defaults.headers.common["X-Requested-With"];
  });

  app.filter('capitalize', function() {
      return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
  });

  app.factory('marking', function () {
      return {
          mark: function(params) { //put target color in params
              console.log("directive");
              var begin = parseInt(params['begin'].split('a')[1]);
              var end = parseInt(params['end'].split('a')[1]);
              var color = params['color'];
              console.log("changed: " + begin + " to " + end + " : " + color);
              if(end > begin) {
                  for (i = begin; i <= end; i++) {
                      document.querySelector("#a"+i).style.backgroundColor = color;
                  }
              } else {
                  var temp = begin;
                  begin = end;
                  end = temp;
                  for (i = begin; i <= end; i++) {
                      document.querySelector("#a"+i).style.backgroundColor = color;
                  }
              }
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
    function Defect(type, begin, end, code, description) {
      this.id = 'd' + defectID;
      this.type = type;
      this.begin = begin;
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

  function loginCtrl ($scope, $location, cacheService, $http) {
      try {
          if(cacheService.getData("user") && (cacheService.getData("user") != null) || (cacheService.getData("user") != undefined)) {
              $location.path("/");
          }
      } catch (err) { }
      $scope.login = function () {
          if($scope.username != undefined && $scope.username != null && $scope.password != undefined && $scope.password != null) {
              var req = {
                  method: 'POST',
                  url: 'http://revision-jpguimaraes.rhcloud.com/login',
                  data: { username: $scope.username, pw: $scope.password}
              }
              $http(req).then(function(res) 
                  {
                      console.log(res.data);
                      if(res.data >= 0) {
                          cacheService.setData("user", res.data);
                          $location.path("/");
                      } else {
                          console.log("Login errado!");
                      }
                  }, function(){
                      console.log("Error");
                  }
              );
          }
      }
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
      $scope.ticking = true;
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
          if ($scope.ticking) {
              $scope.time = $scope.time + $scope.wayOfTime;
              $scope.setClock();
              if ($scope.time == 0) {
                  $scope.end();
              }
          }
      };
      $interval($scope.timer, 1000);
      $scope.defects = defectList.get();
      var newdefect = new Defect(0,10,20,"batatas",'lol');
      defectList.add(newdefect);
      $scope.toggleSelectionDefect = function (defectID) {
          defectList.toggleSelection(defectID);
      }
      $scope.upVoted = function (defectID) {
          return ($scope.upVotedDefects.indexOf(defectID) >= 0);
      }
      $scope.downVoted = function (defectID) {
          return ($scope.downVotedDefects.indexOf(defectID) >= 0);
      }
      $scope.voteDefectUp = function (defectID) {
          if($scope.upVotedDefects.indexOf(defectID) < 0) {
              defectList.getByID(defectID).upVotes++;
              $scope.upVotedDefects.push(defectID);
              if($scope.downVotedDefects.indexOf(defectID) >= 0) {
                  defectList.getByID(defectID).downVotes--;
                  $scope.downVotedDefects.splice($scope.downVotedDefects.indexOf(defectID),1);
              }
          }
      }
      $scope.voteDefectDown = function (defectID) {
          if($scope.downVotedDefects.indexOf(defectID) < 0) {
              defectList.getByID(defectID).downVotes++;
              $scope.downVotedDefects.push(defectID);
              if($scope.upVotedDefects.indexOf(defectID) >= 0) {
                  defectList.getByID(defectID).upVotes--;
                  $scope.upVotedDefects.splice($scope.upVotedDefects.indexOf(defectID),1);
              }
          }
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
          $scope.ticking = false;
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

  function gameCtrl ($scope, $interval, $routeParams, $location, $window, $http, gameSetup, defectList, Defect, cacheService, marking) {
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
      $scope.firstchar = 'a1';
      var codetext = $('#code').text();
      alert(codetext);
      var newcodetext = "";
      for (i = 1; i <= codetext.length; i++) {
          var tempchunk = '<smartchar id="a' + i + '">' + codetext[i-1] + '</smartchar>';
          $scope.lastchar = 'a' + i;
          newcodetext += tempchunk;
      }
      document.getElementById("code").innerHTML = newcodetext;

      $scope.gameID = $routeParams.id;
      $scope.gameMode = $routeParams.gamemode;
      $scope.gameDescription = gameSetup.load(2);
      $scope.wayOfTime = 0;
      $scope.ticking = true;
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
          if ($scope.ticking) {
              $scope.time = $scope.time + $scope.wayOfTime;
              $scope.setClock();
              if ($scope.time == 0) {
                  $scope.end();
              }
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
                      var stw = $scope.getSelectionTextWrapper();
                      if(stw != undefined && stw != null) {
                          var newdefect = new Defect($scope.defectType,stw.begin,stw.end,selectedText.text,$scope.selectedType);
                          //$scope.markText(selectedText, newdefect.id);
                          //$scope.$broadcast('text-was-selected', stw);
                          defectList.add(newdefect);
                          $scope.markDefects();
                      }
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
      $scope.getSelectionTextWrapper = function () {
          var wrapperElements = null, selection;
          if (window.getSelection) {
              selection = window.getSelection();
              if (selection.rangeCount) {
                  wrapperElements = {begin:selection.anchorNode.parentNode.id, end: selection.focusNode.parentNode.id, color: 'rgba(0, 255, 255, 0.3)'};
              }
          } else if (document.selection && document.selection.type != "Control") {
              //Tratar deste caso
              wrapperElements = document.selection.createRange().parentElement();
          }
          return wrapperElements;
      }
      $scope.clearDefects = function () {
          marking.mark({begin: $scope.firstchar, end: $scope.lastchar, color: ''});
      }
      $scope.removeDefect = function (defectID) {
          marking.mark({begin: defectList.getByID(defectID).begin, end: defectList.getByID(defectID).end, color: ''});
          defectList.remove(defectID);
          $scope.markDefects();
      }
      $scope.markDefects = function () {
          $scope.clearDefects();
          var i = 0;
          while (i < defectList.get().length) {
              marking.mark({begin: defectList.get()[i].begin, end: defectList.get()[i].end, color: 'rgba(0, 255, 255, 0.3)'});
              i++;
          }
      }
      $scope.jumpToDefect = function (defectID) {
          $scope.markDefects();
          marking.mark({begin: defectList.getByID(defectID).begin, end: defectList.getByID(defectID).end, color: 'orange'});
          //TODO: jump.
          document.getElementById(defectList.getByID(defectID).begin).scrollIntoView();
      }
      $scope.confirmEnd = function () {
          if (confirm("Do you want to end?")) {
              $scope.end();
          }
      }
      $scope.end = function () {
          $scope.wayOfTime = 0;
          $scope.ticking = false;
          if($scope.gameMode == "challenge") {
              $location.path("/" + $scope.gameMode + "/result/" + $scope.gameID); //perhaps use the solution atempt id here
          } else if($scope.gameMode == "team") {
              $location.path("/" + $scope.gameMode + "/meeting/" + $scope.gameID); //perhaps use the solution atempt id here
          }
      }
      $scope.hoverRemoveButton = function (defectID) {
          $("#"+defectID).find("#removedefectcell").css("background-color", "white");
      }
      $scope.leaveRemoveButton = function (defectID) {
          $("#"+defectID).find("#removedefectcell").css("background-color", "#6495ed");
      }
  }