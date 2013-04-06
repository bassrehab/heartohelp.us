
module.exports = function(app, model) {

    var Room = model.mongoose.model('Room')
      , Message = model.mongoose.model('Message')
      , Counter = model.mongoose.model('Counter')
      , IP = model.mongoose.model('IP')
      , Report = model.mongoose.model('Report')
      , Step = app.libs.Step;
    
    var anonCounter = new Counter({_id: "Anon"});

    var MAX_MESSAGE_LEN     = app.config.limits.maxMessageLength;
    var MAX_USERNAME_LEN    = app.config.limits.maxUsernameLength;

    var chatIOUrl     = app.routes.io("chat.socket");
    
    var actions = {};


    actions.index = function(req, res, next) {
        var roomid = req.params.roomid;
        var ip_address = req.connection.remoteAddress;

        Room.findOne({_id: roomid}, function(err, room) {
            if(err || !room) {
                res.redirect(app.routes.url("index.index"));
                return;
            }
            
              
          var canEnterRoom = Report.findOne()
                            .where('roomid').equals(roomid)
                            .where('userip').equals(ip_address);
            
           canEnterRoom.exec(function(err, unauthorised) { 
                           if (err) { console.log(err); }
                           if (unauthorised) {
                               res.send("Unauthorized Access: You are Banned from room: " +roomid);
                            }
                           else {
                             var roomName = room.title || "Room "+room.id;
                             res.render('chat.html', { data: { title : roomName } });
                           }
             });
          });

        };

    
   actions.report = function(req, res){
 
                          res.render('reportdialog.html', { data: { title : 'Confirm Abuse Report' } });
                            //TODO: create a nice dialog box or Report page landing
    };




   actions.reportConfirm = function(req, res){
      var in_roomid = req.params.roomid;
      var message_num = req.params.messagenum;
      var ip_address = req.connection.remoteAddress; // IP of user reporting abuse. try for x-forwarded, later
       


     if (in_roomid == 'undefined' || message_num == 'undefined')
          res.send("Oops! Can't Report Abuse a System Message");


     else {
              //Scenario: When an existing banned/reported member tries to Ban/report someone else
              var checkReporterPrivilege = Report.findOne()
                                .where('roomid').equals(in_roomid)
                                .where('userip').equals(ip_address);

              checkReporterPrivilege.exec(function(err, banner) { 
                           if (err) { console.log(err); }
                           if (!banner) { 

                              var pullIPFromMessage = Message.findOne() // find corresponding user.ip of message, as user ip is masked from public
                                                 .where('roomid').equals(in_roomid)
                                                 .where('num').equals(message_num);
                              

                                  pullIPFromMessage.exec(function(err, msg) { 
                                         if (err) { console.log(err); }
                                         if (msg.userip == ip_address) {
                                            res.send ("Error: You cannot REPORT yourself");
                                           }
 
                                         else {
                                           var report = new Report({
                                                    userip: msg.userip,
                                                    roomid: in_roomid,
                                                    //unbandate: Date.now(), //1 hour, defined crudely..
                                                    //TODO :reiterate based on the number of repeated infractions
                                                    reportingip: ip_address,
                                                    reportedmsg : msg.body
                                                    });
                                            report.save(function(err) {
                                                 if(err) console.log(err);
                                                 });
                                            console.log("Report abuse received from: " +in_roomid+ "for message number: " + message_num);
                                            res.send("Thank you, Report abuse received from Room ID: " +in_roomid+ " for message number: " + message_num);
                                            }
                                      });

                                

                            }
                        else {  
                            res.send("Permission Denied: Banned Members cannot report other members in same room");
                        }

                 });



             
        } 
          
    };


    actions.socket = function(socket) {
        var hs = socket.handshake;
        
        var sroomid = null;
        if(!hs.session.rooms) {
            hs.session.rooms = {};
        }
        
        socket.on('join room', function(roomid, lastMessageNum, callback) {
            if(typeof callback !== "function") {
                return;
            }
            if(typeof roomid !== "string" || roomid.length > 64) {
                callback('roomid invalid');
                return;
            }
            if(typeof lastMessageNum !== "number" || lastMessageNum < 0) {
                callback('lastMessageNum invalid');
                return;
            }
            
            sroomid = roomid;
            Step(
                function reloadSession() {
                    hs.session.reload(this);
                },
                function userExists() {
                    var next = this;
                    // TODO: verify when this case happens
                    // if the session of the user contains an object for this room
                    // we reuse this object (the page was probably refreshed)
                    // and try to force disconnect the previous socket
                    if(hs.session.rooms[roomid]) {
                        var userinfo = hs.session.rooms[roomid];
                        var username = userinfo.username;
                        var sid = userinfo.sid;
                        if(sid && sid != socket.id && app.io.sockets[sid]) { // disconnect previous socket
                            app.io.sockets[sid].disconnect();
                        }
                        next(null, username);
                    } else {
                        next(null, false);
                    }
                },
                function generateUsername(err, username) {
                    var next = this;
                    if(username) {
                        next(null, username);
                        return;
                    }
                    Counter.getNextValue(roomid, function(errc, value) {
                        if(errc || value == null) {
                            callback('server could not generate a username : '+errc.message);
                            return;
                        }
                        if(value == 1) username = "OP";
                        else username = "Anonymous "+value;
                        next(null, username);
                    });
                },
                function sendUsername(err, username) {
                    var next = this;
                    hs.session.rooms[roomid] = {
                        username  : username
                      , sid       : socket.id
                    };
                    callback(null, username);
                    socket.broadcast.to(roomid).json.emit('user joined', username);
                    next(null, username);
                },
                function addUser(err, username) {
                    var next = this;
                    Room.findByIdAndUpdate(roomid, {"$addToSet": {users: username}}, function(err) {
                        next(); // next even if error
                    });
                },
                function sendMessagesAndUsers() {
                    var messageCallback = this.parallel();
                    var userCallback = this.parallel();
                    Message.allFrom(roomid, lastMessageNum+1, function(err, messages) {
                        if(!err && messages) {
                            messages.forEach(function(msg) {
                                socket.emit("new message", msg.publicFields()); 
                            });
                        }
                        messageCallback();
                    });
                    Room.findById(roomid, "users", function(err, room) {
                        if(!err && room) {
                            socket.emit('users', room.users);
                        }
                        userCallback();
                    });
                },
                function joinRoom() {
                    var next = this;
                    socket.join(roomid);
                    hs.session.save(next);
                },
                function ready() {
                    socket.emit('ready');
                }
            );
        });

        socket.on('message', function(data) {
            if(typeof data !== "string" || data.length > MAX_MESSAGE_LEN) {
                return;
            }
            if(!hs.session.rooms || !hs.session.rooms[sroomid]) {
                return;
            }
            Step(//include BAN CHECK for immediate effect. Stop Banned User from further posting

                function canChat() {
                    var nextstep = this;
                    IP.loadFromSocket(socket, function(err, ip) {
                        if(!ip.canChat()) {
                            socket.emit('new message', { username: "system", body: "No flood !"});
                        } else {
                        var checkip = ip.ip;
                        var query = Report.findOne() // search for badIP in the IP database for current room
                                          .where('userip').equals(checkip)
                                          .where('roomid').equals(sroomid);

                        query.exec(function(err, badip) { 
                        if (err) { console.log(err); }
                        if (badip){
                            socket.emit('new message', { username: "system", body: "You have been Banned from this room"});
                           }
                         else
                             ip.chat(nextstep); //proceed with message

                        });
  
                        }
                    });
                },
                function chat() {
                    var userinfo = hs.session.rooms[sroomid];
                    var username = userinfo.username;
                    var message = new Message({
                        roomid: sroomid,
                        username: username,
                        body: data,
                        userip: socket.handshake.address.address
                    });
                    message.save(function(err) {
                        if(err) console.log(err);
                        app.io.of(chatIOUrl).in(sroomid).emit('new message', message.publicFields());
                    });
                }
            );
        });

       
        socket.on('myEvent', function() {
             
             console.log('"myEvent" event received for roomid: '+ sroomid + 'and IP Address:' + socket.handshake.address.address);
              
             /*var query = Room.findOne() 
                             .where('roomid').equals(sroomid);
            query.exec(function(err, room) { 
                        if (err) { console.log(err); }
                        room.remove(function(err) {
                        app.io.of(chatIOUrl).in(sroomid).emit('new message', { username: "system", body: "Messages in this room are no longer saved. This room URL cannot be used to reconnect."}); 
                                 });

                        });

            /*Room.remove(function(err) {
                      app.io.of(chatIOUrl).in(sroomid).emit('new message', { username: "system", body: "Messages in this room are no longer saved. This room URL cannot be used to reconnect."}); 
                    });*/
          app.io.of(chatIOUrl).in(sroomid).emit('new message', { username: "system", body: "Messages in this room are no longer saved. This room URL cannot be used to reconnect. This just a dummy message."}); 
              
       });


        socket.on('change name', function(data, callback) {
            if(typeof callback !== "function") {
                return;
            }
            if(typeof data !== "string" || data.length > MAX_USERNAME_LEN) {
                callback('username invalid');
                return;
            }
            var newname = data;
            Step(
                function reloadSession() {
                    hs.session.reload(this);
                },
                function checkUsername() {
                    var next = this;
                    if(!hs.session.rooms || !hs.session.rooms[sroomid]) {
                        callback('user info not found');
                        return;
                    }
                    Room
                    .findById(sroomid)
                    .where('users', newname)
                    .limit(1)
                    .exec(function(err, doc) {
                        if(!err && doc) {
                            callback('username exist');
                        } else next();
                    });
                },
                function updateUsername() {
                    Room.findByIdAndUpdate(sroomid, {"$addToSet": {users: newname}}, this);
                },
                function updateUserInfo() {
                    var next = this;
                    var oldname = hs.session.rooms[sroomid].username;
                    hs.session.rooms[sroomid].username = newname;
                    hs.session.save(function(err) {
                        next(err, oldname);
                    });
                },
                function notifyUsernameChange(err, oldname) {
                    var renameObj = {oldname: oldname, newname: newname};
                    socket.broadcast.to(sroomid).json.emit('user renamed', renameObj);
                    callback(null, renameObj);
                }
            );
        });
        
        socket.on('disconnect', function () {
            if(hs.session.rooms && hs.session.rooms[sroomid]) {
                var username = hs.session.rooms[sroomid].username;

               /* Case: when venter/listener is awaiting to be connected, flush 'unpaired' flag.
                possibility of strengthening this code sub case : when the new socket id matches
               old socket id and we don't flush. the user had refreshed the page and not disconnected.*/
                Room.findByIdAndUpdate(sroomid, { $set: { unpaired: 'null' }},function(err) {
                     console.log("flushed room for unpaireds:  " + sroomid);
                });
   
                Room.findByIdAndUpdate(sroomid, {"$pull": {users: username}}, function(err, doc) {
                    socket.broadcast.to(sroomid).json.emit("user left", username);     

               });
            }
        });
        
    };

    return actions;
    
}


