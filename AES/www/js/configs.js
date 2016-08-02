angular.module('aes.configs', [])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('root', {
    url: '/',
    templateUrl: 'templates/start.htm',
    controller: 'rootController'
  })

  .state('nonAffiliated', {
    url: '/non-affiliated',
    templateUrl: 'templates/affiliation-form.htm',
    controller: 'affiliationController'
  })
  
  .state('affiliated', {
    url: '/affiliated',
    templateUrl: 'templates/affiliated.htm',
    controller: 'successController'
  })

  .state('menu', {
    url: '/menu',
    abstract: true,
    templateUrl: 'templates/menu.htm',
    controller: 'MenuController'
  })

  .state('menu.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.htm',
        controller: 'HomeController'
      }
    }
  })
  
  .state('menu.docsAndSyllabus', {
    url: '/docs-syllabus',
    params: {
        url: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/docsAndSyllabus.htm',
        controller: 'DocsAndSyllabusController'
      }
    }
  })
  
  .state('menu.timeTable', {
    url: '/time-table',
    views: {
      'menuContent': {
        templateUrl: 'templates/timeTable.htm',
        controller: 'TimeTableController'
      }
    }
  })
  
  .state('menu.thoughtOfTheDay', {
    url: '/thought-of-the-day',
    views: {
      'menuContent': {
        templateUrl: 'templates/thoughtOfTheDay.htm',
        controller: 'ThoughtOfTheDayController'
      }
    }
  })
  
  $urlRouterProvider.otherwise('/');
})