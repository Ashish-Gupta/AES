angular.module('aes.services', ['ionic', 'ngCordova', 'aes.constants'])
// DB wrapper
.factory('DB', function($q, DB_CONFIG, $cordovaSQLite) {
    var self = this;
    self.db = null;

    self.init = function() {
        var defered = $q.defer();
        
        if(window.cordova) {
            self.db = $cordovaSQLite.openDB({name: DB_CONFIG.name, location: 'default'});
        } else {
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }
        var promises = null;
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];

            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            
            if(promises === null) {
                promises = $cordovaSQLite.execute(self.db, query).then(function(data) {
                    console.log('Table ' + table.name + ' initialized');
                }, function(error){
                    defered.reject(error)
                });
            } else {
                promises.then(function(data) {
                    return $cordovaSQLite.execute(self.db, query).then(function(data) {
                        console.log('Table ' + table.name + ' initialized');
                    });
                }, function(error){
                    defered.reject(error)
                })
            }
            promises.then(function(data) {
                defered.resolve(data);
            })
        });
        return defered.promise;
    };
    
    
    self.getDb = function() {
        return self.db;
    }
    
    return self;
})

.factory('AffiliationService', function(DB, $cordovaSQLite, AffiliationDTO, $q, $http, AFFILIATION_SERVICE_URL) {
    var self = this;
    
    self.getStored = function() {
        console.log("Going to fetch stored properties");
        var query = 'SELECT affiliationCode, schoolName, schoolAddress, school_logo, ip FROM affiliation';
        return $cordovaSQLite.execute(DB.getDb(), query).then(function(result){
            console.log("found result "+result);
            if(result.rows.length>0) {
                var affiliationData = new Object();
                affiliationData.affiliationCode = result.rows.item(0).affiliationCode;
                affiliationData.schoolName = result.rows.item(0).schoolName;
                affiliationData.schoolAddress = result.rows.item(0).schoolAddress;
                affiliationData.school_logo = result.rows.item(0).school_logo;
                affiliationData.ip = result.rows.item(0).ip;

                return affiliationData;
            } else {
                console.log('No result found in DB');
            }
        }, function (error) {
            console.error(error);
            return $q.reject(error);
        });
    }

    self.fetchRemote = function(affiliationCode) {
        var affiliationResource = AFFILIATION_SERVICE_URL+affiliationCode;
        return $http.get(affiliationResource).then(function(response) {
            if(response.data["error:"]) {
                var errorObj = new Object();
                errorObj.error = response.data["error:"];
                return errorObj;
            }
            var affiliationData = new Object();
            affiliationData.affiliationCode = response.data.affiliationCode;
            affiliationData.schoolName = response.data.schoolName;
            affiliationData.schoolAddress = response.data.schoolAddress;
            affiliationData.school_logo = response.data.school_logo;
            affiliationData.ip = response.data.ip;

            return affiliationData;
        }, function(error) {
            console.error(error);
            return $q.reject(error);
        })
    }
    
    self.store = function(data) {
        console.log("going to insert affiliation data: "+data);
        var query = "INSERT INTO affiliation (affiliationCode, schoolName, schoolAddress, school_logo, ip) "+
            "VALUES (?, ?, ?, ?, ?)";
        return $cordovaSQLite.execute(DB.getDb(), query, 
            [
                data.affiliationCode,
                data.schoolName,
                data.schoolAddress, 
                data.school_logo, 
                data.ip
            ]).then(function(res) {
                console.log("affiliation inserted");
                return true;
            }, function (err) {
                console.error(err);
                return false;
            });
    }
    
    return self;
})

.factory('AffiliationDTO', function(){
    var self = this;
    var affiliationData = null;
    
    self.setAffiliationData = function(data) {
        affiliationData = data;
    };
    
    self.getAffiliationData = function() {
        return affiliationData;
    }
    
    return self;
})

.factory('MenuDetailService', function(AffiliationDTO, MENU_RESOURCE, $q, $http){
    var self = this;
    
    self.fetchMenuDetails = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var menuService = "http://"+urlBase + MENU_RESOURCE + studentId;

        $http.get(menuService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }

            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        })

        return defered.promise;
    }

    self.fetchMenuDetails2 = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var menuService = "http://"+urlBase + MENU_RESOURCE + studentId;

        var menuObject = {
            "studentName":"Hardik jain  ",
            "classname":"Vii-A",
            "classTeacher":"Bela  Kakkar ",
            "photo":"http:\/\/www.candoursystems.com\/application\/upload\/LPISKN\/photo\/index.jpg",
            "menuDetails":[
                {
                    "menu_id":"240",
                    "menu_name":"Docs and Syllabus",
                    "url":"getDownloadHeads\/{un}",
                    "mobile_menu_id":"1"
                },
                {
                    "menu_id":"408",
                    "menu_name":"Home Work",
                    "url":"getHWDtls\/{un}\/{hwDate}",
                    "mobile_menu_id":"2"
                },
                {
                    "menu_id":"238",
                    "menu_name":"My Inbox",
                    "url":"getInboxDtls\/{un}\/{initCounter}",
                    "mobile_menu_id":"3"
                },
                {
                    "menu_id":"411",
                    "menu_name":"Time Table",
                    "url":"getTimetable\/{un}",
                    "mobile_menu_id":"4"
                },
                {
                    "menu_id":"998",
                    "menu_name":"PTI",
                    "url":"getPtiDetails\/{un}",
                    "mobile_menu_id":"5"
                },
                {
                    "menu_id":"997",
                    "menu_name":"Attendance",
                    "url":"getAttendanceDtl\/{un}\/{month}",
                    "mobile_menu_id":"6"
                },
                {
                    "menu_id":"995",
                    "menu_name":"Exam Marks",
                    "url":"getExamMarks\/{un}\/{examCode}",
                    "mobile_menu_id":"7"
                },
                {
                    "menu_id":"1996",
                    "menu_name":"Achievements",
                    "url":"getAchievements\/{un}",
                    "mobile_menu_id":"8"
                },
                {
                    "menu_id":"1995",
                    "menu_name":"Discipline",
                    "url":"getStudentDisciplineTckt\/{un}",
                    "mobile_menu_id":"9"
                },
                {
                    "menu_id":"996",
                    "menu_name":"Thought of the day",
                    "url":"getThoughtOfDay\/{un}",
                    "mobile_menu_id":"10"
                },
                {
                    "menu_id":"1999",
                    "menu_name":"Fees",
                    "url":"getFeeDetails\/{un}",
                    "mobile_menu_id":"11"
                },
                {
                    "menu_id":"2000",
                    "menu_name":"School Website",
                    "url":"getSchoolWebsite\/{un}",
                    "mobile_menu_id":"12"
                },
                {
                    "menu_id":"2001",
                    "menu_name":"Location",
                    "url":"getLocationCoordinates\/{un}",
                    "mobile_menu_id":"13"
                },
                {
                    "menu_id":"2002",
                    "menu_name":"Transport",
                    "url":"userTransportDtl\/{un}",
                    "mobile_menu_id":"14"
                },
                {
                    "menu_id":"2003",
                    "menu_name":"Library",
                    "url":"libBookDtl\/{un}",
                    "mobile_menu_id":"15"
                },
                {
                    "menu_id":"2004",
                    "menu_name":"Planner",
                    "url":"getSchoolPlanner\/{monthName}",
                    "mobile_menu_id":"16"
                },
                {
                    "menu_id":"2005",
                    "menu_name":"School News",
                    "url":"getSchoolNews\/{monthName}",
                    "mobile_menu_id":"17"
                },
                {
                    "menu_id":"2006",
                    "menu_name":"Online Feedback",
                    "url":"saveFeedback",
                    "mobile_menu_id":"18"
                }
            ]
        };

        defered.resolve(menuObject);

        return defered.promise;
    }
    
    return self;
});
