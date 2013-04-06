
$(document).ready(function() {
    var align = [];
    var lastmessage = 0;
    var roompath = document.location.pathname;
    var roomid = roompath.replace('/r/', '');
    var nextmsgnum = 1;
    
    function datePrefix(dateObj) {
        dateObj = dateObj || new Date();
        return '<span class="msgdate">'+date('j M, g:i a', (dateObj.getTime()/1000))+'</span> ';
    }
    
    var app = {

        ROOMID          : roomid,
        MAX_MSG_LEN     : 3000,
        MAX_USR_LEN     : 50,
        MAX_ROOMID_LEN  : 64,
        msgCount        : 0,
       
        users           : [],
        username        : 'Anonymous',

        messageBox          : $('#message'),
        nameBox             : $('#name'),
        messagesBox         : $('#messages'),
        usersBox            : $('#users'),
        submitMessageButton : $('#submitMessageButton'),
        renameButton        : $('#renameButton'),
        target              : $('#target'),

        
        showWelcomeMessage: function() {
            app.addMessageToUl("");
            app.showSystemMessage({ body : "<li class='system'><p class='system'>Welcome to your Chat session.Reconnect anytime by visiting the Room URL above.All room messages are purged every 2 days<br />You are known as "+htmlentities(app.username)+".</p></li>"});
        },
        
        addMessageToUl: function(msg) {
            var preDiv = app.messagesBox.parent().get(0);
            var atBottom = (preDiv.scrollHeight - preDiv.scrollTop) == preDiv.clientHeight;
            app.messagesBox.append('<li class="message-block">'+msg+'</p></div></li>');
            if(atBottom) {
                preDiv.scrollTop = app.messagesBox.get(0).scrollHeight;
                
            }
        },

        showMessage: function(msg) {
            var msgStr = datePrefix(msg.date);
            var found = $.inArray(msg.username, align);
            if (found < 0) {
                 align.push(msg.username);
             }
            if (lastmessage !== msg.username || 0 || msg.username == 'system') {
            
                           if (msg.username == 'system') {
                             msgStr += '<div class="system"><span class="system"><b>'+htmlentities(msg.username)+ '</b></span><p class="system">';
                            }
                          else {
                             msgStr += '<div class="message-'+$.inArray(msg.username, align)+'"><span class="name-'+($.inArray(msg.username, align)%2)+'"><b>'+htmlentities(msg.username)+ '</b><a class="reportAbuseButton" target="_blank" href="' +msg.roomid+ '/report/' +msg.num+ '/"><img src="/static/images/user_ban.png" width="10px"></a></span><p class="msgbody-'+($.inArray(msg.username, align)%2)+'">';
             

              }
             lastmessage = msg.username;
            }     
            else {
             msgStr += '<div class="message-'+$.inArray(msg.username, align)+'"><p class="msgbody-'+($.inArray(msg.username, align)%2)+'">';
            }
             
            msgStr += linkify(htmlentities(msg.body, 'ENT_NOQUOTES'));
            app.addMessageToUl(msgStr);
           
        },

        showSystemMessage: function(msg) {
            lastmessage = msg.username;
            app.addMessageToUl(datePrefix(msg.date) + '<b>Information</b> ' + msg.body);
        },

        setUsers: function(newusers) {
            if(newusers.constructor === Array) {
                app.users = newusers;
                app.refreshUserList();
            }
        },

        userJoined: function(newuser) {
            if(newuser != null) {
                app.users.push(newuser);
                app.refreshUserList();
                app.showSystemMessage({ body: "<li class='system'><p class='system'>"+newuser+" joined the room.</p></li>" });
            }
        },

        userLeft: function(olduser) {
            for(var i=0; i<app.users.length; i++) {
                if(app.users[i] === olduser) {
                    app.users.splice(i,1);
                    break;
                }
            }
            app.refreshUserList();
            app.showSystemMessage({ body: "<li class='system'><p class='system'>"+olduser+" left the room.</p></li>" });
        },

        userRenamed: function(obj) {
            var oldname = obj.oldname;
            var newname = obj.newname;
            for(var i=0; i<app.users.length; i++) {
                if(app.users[i] === oldname) {
                    app.users[i] = newname;
                    break;
                }
            }
            app.refreshUserList();
            if(oldname == app.username) {
                msg = "<li class='system'><p class='system'>You are now known as "+htmlentities(newname)+".</p></li>";
                app.username = newname;
                app.nameBox.val(newname);
            } else {
                msg = "<li class='system'><p class='system'>"+htmlentities(oldname)+" is now known as "+htmlentities(newname)+".</p></li>";
            }
            app.showSystemMessage({ body: msg });
        },

        refreshUserList: function() {
            var allusers = app.users.slice(0);
            allusers.sort(function(a,b){return a.toLowerCase() > b.toLowerCase()});
            app.usersBox.empty();
            $.each(allusers, function(i, usr) {
                app.usersBox.append('<li class="useritem">' + htmlentities(usr) + '</li>');
            });
        }
        
    }

    runChatClient(app);


    var meny = Meny.create({
				
	menuElement: document.querySelector( '.meny' ),
	contentsElement: document.querySelector( '.pagecontents' ),
	position: Meny.getQuery().p || 'left',
	height: 200,
	width: 260,
	threshold: 40
	});

			
	

})

