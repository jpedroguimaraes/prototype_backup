var app = angular.module('revision', ['ngRoute'])

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
      $routeProvider.when('/:gamemode/ranking/:id', {
          controller: rankingCtrl,
          templateUrl: 'templates/ranking.html'
      });
      $routeProvider.when('/team/:nextstep/wait/:id', {
          controller: waitingCtrl,
          templateUrl: 'templates/waiting.html'
      });
      $routeProvider.otherwise({
          redirectTo : '/home'
      });
  });

  app.filter('capitalize', function() {
      return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
      }
  });

  app.factory('marking', function () {
      return {
          mark: function(params) {
              var target = params['target'];
              var begin = parseInt(params['begin']);
              var end = parseInt(params['end']);
              var color = params['color'];
              if(end > begin) {
                  for (i = begin; i <= end; i++) {
                      document.getElementById(target).querySelector("#a"+i).style.backgroundColor = color;
                  }
              } else {
                  var temp = begin;
                  begin = end;
                  end = temp;
                  for (i = begin; i <= end; i++) {
                      document.getElementById(target).querySelector("#a"+i).style.backgroundColor = color;
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

  app.factory("jaccardIndex", function (Defect) {
      return {
          common: function(a,b) {
              var low = -1;
              var high = -1;
              for (i = a.begin; i <= a.end; i++) {
                  for (j = b.begin; j <= b.end; j++) {
                      if (i == j) {
                          if ((low == -1) || (i < low)) {
                              low = i;
                          }
                          if ((high == -1) || (i > high)) {
                              high = i;
                          }
                      }
                  }
              }
              if ((low == -1) || (high == -1)) {
                  return 0;
              } else {
                  return ((high - low) + 1);
              }
          },
          union: function(a,b) {
              return (((a.end - a.begin + 1) + (b.end - b.begin + 1)) - this.common(a,b));
          },
          calculate: function(a, b) {
              return this.common(a,b) / this.union(a,b);
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
          clearAll: function() {
              listofdefects = [];
          }
      }
  });   

  app.factory('Defect', function () {
    var defectID = 0;
    function Defect(type, begin, end, code, description, finder) {
      this.id = 'd' + defectID;
      this.type = type;
      this.begin = parseInt(begin);
      this.end = parseInt(end);
      this.code = code;
      this.description = description;
      this.active = true;
      this.upVotes = 0;
      this.downVotes = 0;
      this.finder = finder;
      defectID++;
    }
    return Defect;
  });

  function homeCtrl ($scope, $location, cacheService, $http) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.testConnection = function() {
          var req = {
           method: 'GET',
           url: 'http://revision-jpguimaraes.rhcloud.com/test'//,
           //data: { test: 'teste'}
          }
          $http(req).then(function(res) {
              var stuff = res.data;
              console.log("Connected: " + stuff[0].id + " " + stuff[0].username + " " + stuff[0].password);
            }, function(){
              console.log("Error");
          });
      };
      $scope.goToChallengeGame = function(id) {
          $location.path("/challenge/game/" + id);
      };
      $scope.goToTeamGame = function(id) {
          $location.path("/team/game/" + id);
      };
      $scope.goToChallengeRanking = function(id) {
          $location.path("/challenge/ranking/" + id);
      };
      $scope.goToTeamRanking = function(id) {
          $location.path("/team/ranking/" + id);
      };
      $scope.logout = function() {
          cacheService.clearAll();
          $location.path("/");
      };
  } 

  function waitingCtrl ($scope, $routeParams, $interval, $window, $location, cacheService, marking) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.gameID = $routeParams.id;
      $scope.nextStep = $routeParams.nextstep;
      $scope.goToNextStep = function () {
          $location.path("/team/" + $scope.nextStep + "/" + $routeParams.id);
      }
  }    

  function loginCtrl ($scope, $location, cacheService, $http) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $location.path("/");
          }
      } catch (err) { }
      $scope.login = function () { console.log($scope.username + " : " + $scope.password);
          if($scope.username != undefined && $scope.username != null && $scope.password != undefined && $scope.password != null) {
              var req = {
                  method: 'POST',
                  url: 'http://revision-jpguimaraes.rhcloud.com/login',
                  data: { username: $scope.username, pw: $scope.password}
              }
              $http(req).then(function(res) {
                  var userinfo = res.data;
                  if (userinfo.length > 0) {
                      cacheService.setData("userid", userinfo[0].id);
                      cacheService.setData("nameuser", userinfo[0].username);
                      var myteam = 0;
                      switch(userinfo[0].id) {
                          case 1: myteam = 1;
                            break;
                          case 2: myteam = 2;
                            break;
                          case 3: myteam = 1;
                            break;
                          case 4: myteam = 2;
                            break;
                          case 5: myteam = 3;
                            break;
                          case 6: myteam = 3;
                            break;
                      }
                      cacheService.setData("team", myteam); console.log(cacheService.getData("team"));
                      $location.path("/");
                  } else {
                      $scope.error = "Login error";
                  }
              }, function(){
                  $scope.error = "Connection error";
              });
          }
      }
  } 

  function rankingCtrl ($scope, $routeParams, $location, $http, cacheService) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
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
      $scope.getResults = function () {
          var ranking = [];
          var req = {
              method: 'GET',
              url: 'http://revision-jpguimaraes.rhcloud.com/getteamranking'
          }
          $http(req).then(function(res) {
              var userinfo = res.data;
              if (userinfo.length > 0) {
                  for (var i = 0; i < userinfo.length; i++) {
                      var tempposision = [];
                      tempposision.id_team = userinfo[i].id_team;
                      tempposision.hits = userinfo[i].hits;
                      tempposision.misses = userinfo[i].misses;
                      tempposision.incomplete = userinfo[i].incomplete;
                      tempposision.wrong = userinfo[i].wrong;
                      tempposision.seconds = userinfo[i].seconds;
                      tempposision.classification = userinfo[i].classification;
                      ranking.push(tempposision);
                  }
              } else {
                  return "error";
              }
          }, function(){
              return "error";
          });
          return ranking;
      }
      $scope.results = $scope.getResults();
      $scope.goToHome = function () {
          $location.path("/home");
      }
      $scope.logout = function() {
          cacheService.clearAll();
          $location.path("/");
      };
  } 

  function resultCtrl ($scope, $routeParams, $interval, $window, $http, $location, cacheService, marking) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      if (!($routeParams.gamemode == "challenge" || $routeParams.gamemode == "team")) {
          $location.path("/");
      }
      $scope.$watch(function(){
          var bordercorrection = 0;
          var tempbordercorrection = getComputedStyle(document.getElementById('cellshowsolutiondefects'),null).getPropertyValue('border-width').replace('px','');
          if(!(isNaN(tempbordercorrection))) {
              bordercorrection = parseInt(tempbordercorrection);
          }
          var newheight = window.innerHeight - $("#rating").outerHeight(true) - (bordercorrection * 2);
          document.getElementById('comparison').style.height = newheight + 'px';
          document.getElementById('showsolutiondefects').style.height = newheight + 'px';
          document.getElementById('showanswereddefects').style.height = newheight + 'px';
          console.log(window.innerHeight + " : " + $("#rating").outerHeight(true) + " : " + newheight);
      }, true);
      $scope.firstchar = 'a1';
      var codetext = $('#showsolutiondefects').text();
      var newcodetext = "";
      for (i = 1; i <= codetext.length; i++) {
          var tempchunk = '<smartchar id="a' + i + '">' + codetext[i-1] + '</smartchar>';
          $scope.lastchar = 'a' + i;
          newcodetext += tempchunk;
      }
      document.getElementById("showsolutiondefects").innerHTML = newcodetext;
      document.getElementById("showanswereddefects").innerHTML = newcodetext;
      $scope.clearDefects = function () {
          marking.mark({target: 'showsolutiondefects', begin: $scope.firstchar, end: $scope.lastchar, color: ''});
          marking.mark({target: 'showanswereddefects', begin: $scope.firstchar, end: $scope.lastchar, color: ''});
      }
      $scope.markDefects = function () { // green ok, yellow incomplete, red wrong on the right. maybe have colored solutions on the left (like meeting page)
          $scope.clearDefects();
          /*var i = 0;
          while (i < defectList.get().length) {
              var activemark = '0.2';
              if (defectList.get()[i].active) {
                  activemark = '0.5';
              }
              var markcolor = 'rgba(0, 255, 255, 0.3)';
              if (defectList.get()[i].type == 0) {
                  markcolor = 'rgba(255, 255, 0, ' + activemark + ')';
              } else if (defectList.get()[i].type == 1) {
                  markcolor = 'rgba(255, 0, 0, ' + activemark + ')';
              }
              marking.mark({target: 'code', begin: defectList.get()[i].begin, end: defectList.get()[i].end, color: markcolor});
              i++;
          }*/
      }
      $scope.markDefects();
      $scope.getRating = function () {
          var req = {
              method: 'POST',
              url: 'http://revision-jpguimaraes.rhcloud.com/getteamresult',
              data: { attempt: $scope.myteam}
          }
          $http(req).then(function(res) {
              var userinfo = res.data;
              if (userinfo.length > 0) {
                  return userinfo[0].classification;
              } else {
                  return "error";
              }
          }, function(){
              return "error";
          });
      }
      $scope.resultValue = $scope.getRating();
      $scope.goToRanking = function () {
          $location.path("/ranking/" + $routeParams.id);
      }
      $scope.goToHome = function () {
          $location.path("/home");
      }
  }

  function meetingCtrl ($scope, $interval, $routeParams, $location, $window, $http, gameSetup, defectList, Defect, cacheService, marking, jaccardIndex) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
              //console.log("a: " + cacheService.getData("team") + " : " + $scope.myteam);
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      $scope.$watch(function(){
         var newheight = window.innerHeight;
         document.getElementById('code').style.height = newheight + 'px';
         document.getElementById('sidemenu').style.height = newheight + 'px';
         var newlistheight = newheight - $("#gameinfo").outerHeight(true) - $("#chat").outerHeight(true) - $("#showtime").outerHeight(true) - $("#finishbutton").outerHeight(true) - $("#foundtitle").outerHeight(true) - 30;
         document.getElementById('listofdefects').style.height = newlistheight + 'px';
         //console.log(window.innerHeight + " = " + $("#chat").outerHeight(true) + " + " + $("#gameinfo").outerHeight(true) + " + " + $("#showtime").outerHeight(true) + " + " + $("#finishbutton").outerHeight(true) + " + " + $("#foundtitle").outerHeight(true) + " + " + $("#listofdefects").outerHeight(true));
      });
      $scope.firstchar = 'a1';
      var codetext = $('#code').text();
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
      //console.log(jaccardIndex.common(newdefect,newdefect2));
      //console.log(jaccardIndex.union(newdefect,newdefect2));
      //console.log(jaccardIndex.calculate(newdefect,newdefect2));
      $scope.clearDefects = function () {
          marking.mark({target: 'code', begin: $scope.firstchar, end: $scope.lastchar, color: ''});
      }
      $scope.markExistingDefects = function (activemark, value) {
          var i = 0;
          while (i < defectList.get().length) {
              if (defectList.get()[i].active == activemark) {
                  var markcolor = 'rgba(0, 255, 255, 0.3)';
                  if (defectList.get()[i].type == 0) {
                      markcolor = 'rgba(255, 255, 0, ' + value + ')';
                  } else if (defectList.get()[i].type == 1) {
                      markcolor = 'rgba(255, 0, 0, ' + value + ')';
                  } 
                  marking.mark({target: 'code', begin: defectList.get()[i].begin, end: defectList.get()[i].end, color: markcolor});
              }
              i++;
          }
      }
      $scope.markDefects = function () {
          $scope.clearDefects();
          $scope.markExistingDefects(false,0.2);
          $scope.markExistingDefects(true,0.5);
      }
      $scope.jumpToDefect = function (defectID) {
          $scope.markDefects();
          document.getElementById('a' + defectList.getByID(defectID).begin).scrollIntoView();
      }
      $scope.toggleSelectionDefect = function (defectID) {
          defectList.toggleSelection(defectID);
          $scope.markDefects();
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
      $scope.loadDefects = function () {
          defectList.clearAll();
          var req = {
                  method: 'POST',
                  url: 'http://revision-jpguimaraes.rhcloud.com/getdefectsmulti',
                  data: { attempt: $scope.myteam }
          }
          $http(req).then(function(res) {
              var userinfo = res.data;
              if (userinfo.length > 0) {
                  for (var i = 0; i < userinfo.length; i++) {
                      var newdefect = new Defect(userinfo[i].defecttype,userinfo[i].dbegin,userinfo[i].dend,"",userinfo[i].description,$scope.myid);
                      defectList.add(newdefect);
                  }
                  console.log("loaded " + defectList.get().length + " defects");
                  $scope.markDefects();
              } else {
                  console.log("no defects");
              }
          }, function(){
              console.log("Connection error");
          });
      }
      $scope.loadDefects();
      $scope.defects = defectList.get();

      $scope.captain = true;
      $scope.confirmEnd = function () {
          if (confirm("Do you want to end?")) {
              $scope.end();
          }
          //$scope.captain = !($scope.captain);
      }
      $scope.calculateResults = function () {
          for(i = 0; i < defectList.get().length; i++) {
              if(!defectList.get()[i].active) {
                  defectList.remove(defectList.get()[i].id);
                  i--;
              }
          }
          var solutionDefects = [];
          var foundDefects = [];
          var incompleteDefects = [];
          var correctDefects = [];
          var newdefect0 = new Defect(0,'39','274',"",'Documentation',$scope.user);
          var newdefect1 = new Defect(0,'375','388',"",'Assignment/Initialization',$scope.user);
          var newdefect1 = new Defect(0,'919','923',"",'Checking',$scope.user);
          var newdefect1 = new Defect(0,'1144','1148',"",'Checking',$scope.user);
          var newdefect1 = new Defect(0,'1319','1319',"",'Assignment/Initialization',$scope.user);
          var newdefect1 = new Defect(0,'1400','1400',"",'Assignment/Initialization',$scope.user);
          var newdefect1 = new Defect(0,'1400','1400',"",'Assignment/Initialization',$scope.user);
          var newdefect1 = new Defect(0,'1574','1575',"",'Assignment/Initialization',$scope.user);
          var newdefect1 = new Defect(0,'1615','1655',"",'Checking',$scope.user);
          var newdefect1 = new Defect(0,'1721','1721',"",'Algorythm',$scope.user);
          var newdefect1 = new Defect(0,'1759','1833',"",'Documentation',$scope.user);
          solutionDefects.push(newdefect0);
          solutionDefects.push(newdefect1);
          var timebonus = (solutionDefects.length * 2) * 0.25;
          var perfectscore = (solutionDefects.length * 2) + timebonus;
          var currentscore = 0;
          for (var i = 0; i < solutionDefects.length; i++) {
              var matchedID = null;
              var matchedPoints = -1;
              for (var j = 0; j < defectList.get().length; j++) {
                  var tempindex = jaccardIndex.calculate(solutionDefects[i],defectList.get()[j]);
                  if (tempindex > 0 && tempindex > matchedPoints) {
                      matchedID = defectList.get()[j].id;
                      if (solutionDefects[i].type == defectList.get()[j].type) {
                          tempindex += 0.5;
                      }
                      if (solutionDefects[i].description == defectList.get()[j].description) {
                          tempindex += 0.5;
                      }
                      matchedPoints = tempindex;
                  }
              }
              if (matchedID != null) {
                  foundDefects.push(solutionDefects[i]);
                  solutionDefects.splice(i, 1);
                  if (matchedPoints == 2) {
                      correctDefects.push(defectList.getByID(matchedID));
                  } else {
                      incompleteDefects.push(defectList.getByID(matchedID));
                  }
                  defectList.remove(matchedID);
                  currentscore += matchedPoints;
                  i--;
              }
          }
          var percRemainingTime = $scope.time / $scope.initialTime;
          var timespent = $scope.initialTime - $scope.time;
          if (percRemainingTime <= 0.5) {
              timebonus = timebonus * percRemainingTime * 2;
          }
          var finalscore = (currentscore + timebonus) / perfectscore; console.log(finalscore + " = " + currentscore + " + " + timebonus + " / " + perfectscore);
          finalscore = finalscore * 100;
          /*var req = {
                  method: 'POST',
                  url: 'http://revision-jpguimaraes.rhcloud.com/submitresults',
                  data: { team: $scope.myteam, classification: finalscore, seconds: timespent, hits: correctDefects.lentgh, missed: solutionDefects.length, incompleted: incompleteDefects.length, wrong: defectList.length}
          }
          $http(req).then(function(res) {
              var userinfo = res.data;
              if (userinfo.length > 0) {
                  console.log("submited");
              } else {
                  console.log("no defects");
              }
          }, function(){
              console.log("Connection error");
          });*/
      }
      $scope.end = function () {
          $scope.wayOfTime = 0;
          $scope.ticking = false;
          if($scope.captain) {
            $scope.calculateResults();
          }
          //defectList.clearAll();
          $location.path("/" + $scope.gameMode + "/result/wait/" + $scope.gameID); //perhaps use the solution atempt id here
      } 
  }

  function gameCtrl ($scope, $interval, $routeParams, $location, $window, $http, gameSetup, defectList, Defect, cacheService, marking, jaccardIndex) {
      try {
          if(cacheService.getData("userid") && (cacheService.getData("userid") != null) || (cacheService.getData("userid") != undefined)) {
              $scope.myid = cacheService.getData("userid");
              $scope.myname = cacheService.getData("nameuser");
              $scope.myteam = cacheService.getData("team");
          } else {
              $location.path("/login");
          }
      } catch (err) {
          $location.path("/login");
      }
      if (!($routeParams.gamemode == "challenge" || $routeParams.gamemode == "team")) {
          $location.path("/");
      }
      $scope.$watch(function(){
         var newheight = window.innerHeight - $("#gamemenu").outerHeight(true);
         document.getElementById('code').style.height = newheight + 'px';
         document.getElementById('sidemenu').style.height = newheight + 'px';
         var newlistheight = newheight - $("#selectedtypetitle").outerHeight(true) - $("#selectedtype").outerHeight(true) - $("#gameinfo").outerHeight(true) - $("#showtime").outerHeight(true) - $("#finishbutton").outerHeight(true) - $("#foundtitle").outerHeight(true) - 30;
         document.getElementById('listofdefects').style.height = newlistheight + 'px';
         //console.log(document.getElementById('listofdefects').style.height);
         //console.log(window.innerHeight + " = " + $("#gamemenu").outerHeight(true) + " + " + $("#selectedtypetitle").outerHeight(true) + " + " + $("#selectedtype").outerHeight(true) + " + " + $("#gameinfo").outerHeight(true) + " + " + $("#showtime").outerHeight(true) + " + " + $("#finishbutton").outerHeight(true) + " + " + $("#foundtitle").outerHeight(true));
      });
      $scope.firstchar = 'a1';
      var codetext = $('#code').text();
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
      $scope.initialTime = 1800;
      if (true) { //check if countdown
          $scope.time = 1800;
          $scope.timeGoal = 0;
          $scope.wayOfTime = -1;
      } else {
          $scope.time = 0;
          $scope.timeGoal = 1800;
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
                  if (selectedText.start != undefined && selectedText.start != null && selectedText.start > -1 && selectedText.end != undefined && selectedText.end != null && selectedText.end > -1 && selectedText.text != "" && selectedText.text != null && selectedText.text != undefined) {
                      var stw = $scope.getSelectionTextWrapper();
                      if(stw != undefined && stw != null && stw.begin != undefined && stw.begin != null && parseInt(stw.begin) > -1 && stw.end != undefined && stw.end != null && parseInt(stw.end) > -1) {
                          if(stw.begin > stw.end) {
                              var temp = stw.begin;
                              stw.begin = stw.end;
                              stw.end = temp;
                          } console.log($scope.defectType + " : " + stw.begin + " : " + stw.end + " : " + $scope.selectedType);
                          if (stw.end > parseInt($scope.lastchar.split('a')[1])) { stw.end = parseInt($scope.lastchar.split('a')[1]); }
                          var newdefect = new Defect($scope.defectType,stw.begin,stw.end,selectedText.text,$scope.selectedType,$scope.user);
                          defectList.add(newdefect);
                          $scope.markDefects();
                      } else {
                        alert('No selection');
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
                  wrapperElements = {begin: parseInt(selection.anchorNode.parentNode.id.split('a')[1]), end: parseInt(selection.focusNode.parentNode.id.split('a')[1]), color: 'rgba(0, 255, 255, 0.3)'};
              }
          } else if (document.selection && document.selection.type != "Control") {
              //Tratar deste caso
              wrapperElements = document.selection.createRange().parentElement();
          }
          return wrapperElements;
      }
      $scope.clearDefects = function () { console.log($scope.firstchar+":"+$scope.lastchar);
          marking.mark({target: 'code', begin: $scope.firstchar, end: $scope.lastchar, color: ''});
      }
      $scope.removeDefect = function (defectID) {
          marking.mark({target: 'code', begin: defectList.getByID(defectID).begin, end: defectList.getByID(defectID).end, color: ''});
          defectList.remove(defectID);
          $scope.markDefects();
      }
      $scope.markDefects = function () {
          $scope.clearDefects();
          var i = 0;
          while (i < defectList.get().length) {
              marking.mark({target: 'code', begin: defectList.get()[i].begin, end: defectList.get()[i].end, color: 'rgba(0, 255, 255, 0.3)'});
              i++;
          }
      }
      $scope.jumpToDefect = function (defectID) {
          $scope.markDefects();
          marking.mark({target: 'code', begin: defectList.getByID(defectID).begin, end: defectList.getByID(defectID).end, color: 'orange'});
          document.getElementById('a' + defectList.getByID(defectID).begin).scrollIntoView();
      }
      $scope.confirmEnd = function () {
          if (confirm("Do you want to end?")) {
              $scope.end();
          }
      }
      $scope.sendResults = function () {
          var chosendefects = defectList.get();
          var itsok = true;
          for (var i = 0; i < chosendefects.length; i++) {
              console.log("Sending defect " + chosendefects[i].id);
              var req = {
                  method: 'POST',
                  url: 'http://revision-jpguimaraes.rhcloud.com/adddefect',
                  data: { attempt: $scope.myteam, defecttype: chosendefects[i].type, description: chosendefects[i].description, dbegin: chosendefects[i].begin, dend: chosendefects[i].end }
              }
              $http(req).then(function(res) {
                  itsok = true;
              }, function(){
                  itsok = false;
              });
          }
          return itsok;
      }
      $scope.end = function () {
          $scope.wayOfTime = 0;
          $scope.ticking = false;
          //$scope.sendResults();
          //defectList.clearAll();
          //$scope.defects = defectList.get();
          if($scope.gameMode == "challenge") {
              $location.path("/" + $scope.gameMode + "/result/" + $scope.gameID); //perhaps use the solution atempt id here
          } else if($scope.gameMode == "team") {
              var sent = false;
              do {
                  sent = $scope.sendResults();
              } while (sent != true);
              $location.path("/" + $scope.gameMode + "/meeting/wait/" + $scope.gameID); //perhaps use the solution atempt id here
          }
      }
      $scope.hoverRemoveButton = function (defectID) {
          $("#"+defectID).find("#removedefectcell").css("background-color", "white");
      }
      $scope.leaveRemoveButton = function (defectID) {
          $("#"+defectID).find("#removedefectcell").css("background-color", "#6495ed");
      }
  }