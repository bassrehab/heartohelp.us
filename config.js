var path = require('path');

global.application_root = __dirname;

var nconf = require('nconf');
nconf.argv().env();
nconf.file({ file: 'config.json' });
nconf.defaults({
    'http': {
        //'port': unset
    }
});


config.twitter = {};
config.redis = {};
config.web = {};
config.twitter.user_name = process.env.TWITTER_USER || 'username';
config.twitter.password=  process.env.TWITTER_PASSWORD || 'password';


var config = {
    hostname  : 'localhost'
  , port      : 3000
  , database  : {
        mongo : {
            servers : [ // if your Mongo requires authentication change accordingly
                'localhost:27017/h2h'
            ]
          
        }
      , redis : { /// if your REDIS requires authentication change accordingly
            host: 'localhost'
          , port: 6379
        }
    }
  ,  session : {
        secret  : 'your_secret_key_here'
      , key     : 'express.sid'
      , cookie  : {
            maxAge    : 24 * 3600 * 1000
          , path      : '/'
          , httpOnly  : false
        }
      , engine  : 'mongo'
    }
  , socketio : {
        store   : 'redis'
      , enable  : [
            'browser client minification'
          , 'browser client etag'
        ]
      , set     : {
            'log level'   : 1
          , 'transports'  : [
                'websocket'
              , 'flashsocket'
              , 'htmlfile'
              , 'xhr-polling'
              , 'jsonp-polling'
            ]
          
        }
    }
};



module.exports = function(userconfig) {
    return (userconfig) ? mergeRecursive(config, userconfig) : config;
}


