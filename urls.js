
module.exports = function(app) {

    var express = app.libs.express;
    
    return {
        urls : [
            ["/",                               "index.index",          "get"  ],
            ["/listen",                   "index.listen",     "get" , express.bodyParser()],
            ["/vent",                     "index.vent",       "all" , express.bodyParser()],
            ["/r/:roomid",                      "chat.index",           "get"  ],
            ["/r/:roomid/report/:messagenum",                      "chat.report",           "get"  ],
            ["/r/:roomid/report/:messagenum/confirm",                      "chat.reportConfirm",           "get"  ],

        ]
        
      , ios : [
            ["/chat",                           "chat.socket",          "io"   ],
        ]
    };

}

