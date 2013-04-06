module.exports = function(app, model) {

    var Room = model.mongoose.model('Room')
      , Counter = model.mongoose.model('Counter');
    
    var actions = {};

    //TODO: Create a Global Model for Global BANS. 
    //Check If res/req IP is a Repeated Offender, Infractions 5 or more, DENY him the normal Index Page.
    actions.index = function(req, res, next) {
        var query = Room.find()
                        .where('ispublic').equals(true)
                        .sort('-messageCount')
                        .limit(100);
        query.exec(function(err, docs) {
            var map = app.Plates.Map();
            map.className('room').to('room');
            map.className('room-title').to('title');
            map.where('href').has(/roomid/).insert('id');
            res.render('home', { data : { room : docs }, map: map });
        });
    };


    actions.listen = function(req, res) {
     var query = Room.findOne()
                     .where('unpaired').equals('venter');

      query.exec(function(err, queue) { 
         if (err) { console.log(err); }
         
         if (!queue) { 
          var room = new Room();
           room.save(function(err) {
            if(err) {
                console.log(err);
              
            } else {
                res.redirect(app.routes.url("chat.index", {"roomid": room.id }));
                Room.update({ _id: room.id }, { $set: { unpaired: 'listener' }},function(err) { console.log(err); });
               
            }
        }); 

       }
      if (queue) {  
        res.redirect(app.routes.url("chat.index", {"roomid": queue._id }));
        Room.update({ _id: queue._id }, { $set: { unpaired: 'null' }},function(err) { console.log("Successfully Paired Listener and Updated Markers. Errors encountered :"+err); });
            }
       
       });
      
};


    actions.vent = function(req, res) {
        var ispublic = !!req.body.ispublic;
        var title = req.body.title || null;
        if(title !== null && (typeof title !== 'string' || title.length > 100)) {
            next(new Error("wrong input name"));
            return;
        }
     if (ispublic == true) {
      var room = new Room({ispublic: ispublic, title: title});
           room.save(function(err) {
            if(err) {
                console.log(err);
                
            } else {
               
                res.redirect(app.routes.url("chat.index", {"roomid": room.id }));
                Room.update({ _id: room.id }, { $set: { unpaired: 'null' }},function(err) { console.log("New Room Created for Listener, Queued, Udated Markers. Errors encountered :"+err); });
               
            }
        }); 
      }

    else { 
      var query = Room.findOne()
                     .where('unpaired').equals('listener');

      query.exec(function(err, queue) { 
         if (err) { console.log(err); }
         
         if (!queue) { 
          var room = new Room({title: title});
           room.save(function(err) {
            if(err) {
                console.log(err);
                
            } 
           else {
               
                res.redirect(app.routes.url("chat.index", {"roomid": room.id }));
                Room.update({ _id: room.id }, { $set: { unpaired: 'venter' }},function(err) { console.log("New Room Created for Venter, Queued, Updated Markers. Errors encountered :"+err); });
               
                }
            }); 

          }

        if (queue) { 
            res.redirect(app.routes.url("chat.index", {"roomid": queue._id }));
            Room.update({ _id: queue._id }, { $set: { unpaired: 'null' }},function(err) { console.log("Successfully Paired Venter and Updated Markers. Errors encountered :"+err); });
            Room.update({ _id: queue._id }, { $set: { title: title }},function(err) { console.log(err); });
           }
       
        });
       }
      
    };


    //catch unauthorized room creations
    actions.createRoom = function(req, res, next) {
        
                res.redirect(app.routes.url("index.index"));
           
    };
    
    return actions;

}

