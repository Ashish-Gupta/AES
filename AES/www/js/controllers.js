angular.module('aes.controllers', ['ionic', 'ngCordova', 'aes.services', 'ui.calendar', 'ui.bootstrap'])
.controller('rootController', function(DB, $ionicLoading, $state, $ionicPlatform, 
        AffiliationService, AffiliationDTO){
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
	$ionicPlatform.ready(function() {
		DB.init().then(function(data) {
            console.log("DB initialized");
			AffiliationService.getStored().then(function(data) {
				console.log(data);
				if(!data) {
					$state.go('nonAffiliated');
				} else {
                    AffiliationDTO.setAffiliationData(data);
					$state.go('affiliated');
				}
				$ionicLoading.hide();
			}, function(error){
                console.error(error);
                $ionicLoading.hide();
            });
            
		}, function(error){
            console.error(error);
            $ionicLoading.hide();
        });
	});
})

.controller('affiliationController', function($scope, $state, $ionicLoading, 
        $ionicHistory, $ionicPopup, AffiliationService, AffiliationDTO) {
    $ionicHistory.clearHistory();
    $scope.error = null;
    $scope.affiliationNumber = null;
    $scope.saveAffiliation = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        AffiliationService.fetchRemote(this.affiliationNumber).then(function(data) {
            if(data.error) {
                //$scope.error = data.error;
                $scope.showAlert(data.error);
            } else {
                $scope.affiliationData = data;
                AffiliationService.store(data).then(function(success){
                    if(success) {
                        AffiliationDTO.setAffiliationData(data);
                        $state.go('affiliated');
                    }
                    $ionicLoading.hide();
                })
            }
        }, function(error) {
            console.error(error)
            $ionicLoading.hide();
        });
    }
    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            template: '<i class="fa fa-exclamation-circle" aria-hidden="true">'+message+'</i>'
        });

        alertPopup.then(function(res) {
            this.affiliationNumber = '';
        });
    };
})

.controller('successController', function($scope, $rootScope, $state, AffiliationDTO) {
    $scope.affiliationData = AffiliationDTO.getAffiliationData();
    $scope.home = function() {
        $rootScope.studentId = "A14990";
        $state.go("menu.home")
    }
})

.controller('MenuController', function(){

})

.controller('HomeController', function($scope, $rootScope, $ionicLoading, 
        MenuDetailService, MENU_ITEM_MASTER) {
    var studentId = $rootScope.studentId;
    var menuItems = [];
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    MenuDetailService.fetchMenuDetails(studentId).then(function(menuData){
        console.log(menuData);
        $scope.menuData = menuData;
        
        for(var idx in menuData.menuDetails) {
            var menuDetail = menuData.menuDetails[idx];
            var menuDetailMaster = MENU_ITEM_MASTER[menuDetail.mobile_menu_id];
            if(menuDetailMaster.title) {
                menuDetailMaster.url = menuDetail.url;
                menuItems.push(menuDetailMaster);
            }
        }

        $scope.entries = menuItems;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    })

})

// .controller('DocsAndSyllabusController', function($scope, $stateParams))

.controller('TimeTableController', function($scope) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];
    
    $scope.eventSources = [$scope.events];
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        defaultView: 'month',
        minTime: "07:00:00",
        maxTime: "14:00:00",
        allDaySlot:false,
        header:{
          left: 'prev',
          center: 'day',
          right: 'next today'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

     /* event source that calls a function on every view switch */
    /*$scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };*/

    $scope.calEventsExt = {
       color: '#f00',
       textColor: 'yellow',
       events: [ 
          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
        alert($cope.alertMessage)
    };
})

.controller('ThoughtOfTheDayController', function($scope, menuItems) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [
      {title: 'All Day Event',start: new Date(y, m, 1)},
      {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
      {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
      {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
      {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
    ];
    
    $scope.eventSources = [$scope.events];
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        defaultView: 'agendaWeek',
        minTime: "07:00:00",
        maxTime: "14:00:00",
        aspectRatio:1,
        slotLabelInterval:"00:30:00",
        header:{
          left: 'prev',
          center: 'title',
          right: 'next today'
        },
        eventClick: $scope.alertOnEventClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize,
        eventRender: $scope.eventRender
      }
    };

     /* event source that calls a function on every view switch */
    /*$scope.eventsF = function (start, end, timezone, callback) {
      var s = new Date(start).getTime() / 1000;
      var e = new Date(end).getTime() / 1000;
      var m = new Date(start).getMonth();
      var events = [{title: 'Feed Me ' + m,start: s + (50000),end: s + (100000),allDay: false, className: ['customFeed']}];
      callback(events);
    };*/

    $scope.calEventsExt = {
       color: '#f00',
       textColor: 'yellow',
       events: [ 
          {type:'party',title: 'Lunch',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Lunch 2',start: new Date(y, m, d, 12, 0),end: new Date(y, m, d, 14, 0),allDay: false},
          {type:'party',title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
        ]
    };
    /* alert on eventClick */
    $scope.alertOnEventClick = function( date, jsEvent, view){
        $scope.alertMessage = (date.title + ' was clicked ');
        alert($cope.alertMessage)
    };
});