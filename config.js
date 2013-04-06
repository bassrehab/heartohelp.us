
var path = require('path');

global.application_root = __dirname;

var config = {
    hostname  : 'localhost'
  , port      : 3000
  , database  : {
        mongo : {
            servers : [ // if your Mongo requires authentication change accordingly
                'localhost:27017/h2hdb'
            ]
          , options : {
                server : {
                    auto_reconnect: true
                }
              , db : {
                    safe          : true
                }
            }
        }
      , redis : { /// if your REDIS requires authentication change accordingly
            host: 'localhost'
          , port: 6379
        }
    }
  , views : {
        type    : 'html'
      , engine  : 'plates'
      , cache   : 'enable'
    }
  , paths : {
          root        : application_root
        , routes      : path.join(application_root, 'urls.js')
        , app         : path.join(application_root, 'app')
        , public_root : path.join(application_root, 'public')
        , public_lib  : path.join(application_root, 'public', 'lib')
        , models      : path.join(application_root, 'app', 'models')
        , views       : path.join(application_root, 'app', 'views')
        , libs        : path.join(application_root, 'app', 'libs')
        , controllers : path.join(application_root, 'app', 'controllers')
        , crons       : path.join(application_root, 'app', 'crons')
        , favicon     : path.join(application_root, 'public', 'favicon.ico')
        , statics     : {
            '/static'           : path.join(application_root, 'public')
          , '/static/server_lib': path.join(application_root, 'app', 'libs')
        }
    }
  , session : {
        secret  : 'rgkervdasdfrbcxvfezf'
      , key     : 'express.sid'
      , cookie  : {
            maxAge    : 24 * 3600 * 1000
          , path      : '/'
          , httpOnly  : false
        }
      , reapInterval  : 15 * 60 * 1000
      , engine  : 'mongo'
    }
  , socketio : {
        store   : 'redis'
      , enable  : [
            'browser client minification'
          , 'browser client etag'
        ]
      , set     : {
            'log level'   : 2
          , 'transports'  : [
                'websocket'
              , 'flashsocket'
              , 'htmlfile'
              , 'xhr-polling'
              , 'jsonp-polling'
            ]
          //, 'browser client gzip' 
         // There is an opened unresolved issue : https://github.com/LearnBoost/socket.io/issues/932
        }
    }
  , limits : { //For upload supports in Chat and Banckend Maintenance. Not to be changed, unless you know what you are doing. 
        maxMessageLength  : 3000
      , maxUsernameLength : 50
      , minMessageInterval: 3000 //ms
      , maxTotalUp        : 200  // files
      , maxTotalDown      : 2000 // files
      , maxSimulUp        : 1
      , maxSimulDown      : 3
      , maxUpMB           : 1000
      , maxDownMB         : 10000
      , uploadSpeedKBs    : 500
      , downloadSpeedKBs  : 500
      , reloadTimeMin     : 6 * 60
    }
};

module.exports = function(userconfig) {
    return (userconfig) ? mergeRecursive(config, userconfig) : config;
}
// Donot Change below this, normally
function mergeRecursive(obj1, obj2) {
    for(var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if(obj2[p].constructor==Object) {
                obj1[p] = mergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
  return obj1;
}


