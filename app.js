/**
 * Created by RkZai on 2017/8/3.
 */

var express=require('express');
var swig=require('swig');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var Content = require('./models/contents');
var User = require('./models/users');

var app=express()
    ,cs=require('http').createServer(app)
    ,server=require('socket.io').listen(cs);
cs.listen(8080);

// List contains the sockets of different clients
var clients_list= new Array();

//Config the application model engine
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');

//Static file
app.use('/public',express.static(__dirname+'/public'));

//parse middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Config Session
app.use(session({
    secret: 'Session',
}));

//Setting routes
app.use('/',require('./routers/main'));

//Connect to the database
mongoose.connect('mongodb://localhost:27017/chatDB',function(err){
    if(err){
        console.log("database failed to connect");
    }
    else{
        console.log('database success!');
    }
});

// Get the system time
function getTime(){
    var date = new Date();
    var time = "["+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]";
    return time;
}

// Find all the online users and update the users display list
function  updateUserList(){
    User.find({status: "online"})
        .then(function(onlineList){
            server.emit('user_list',onlineList);
        });
}

// Update the users to offline status
function statusSetOffLine(userName){
    User.update({username:userName},{ status: "offline"}).
    then(function(){
        updateUserList();
    })
}

// server listening
server.on('connection',function(socket){
    // Emit the user list
    updateUserList();
    // Client Object
    var client = {
        Socket: socket,
        name: ''
    };

    // Broadcast to all the online users that new user come up
    socket.on("message",function(name){
        client.name = name;
        clients_list.push(client);
        socket.broadcast.emit("NewUser",client.name);
        socket.emit("system",client.name);
    });


    // Group Message
    socket.on('GroupMessage',function(content){
        var time = getTime();
        server.emit('UserToGroup',client.name,time,content);
        Content.create({
            name:client.name,
            data:content,
            time:time
        })//saving content
    });

    // Private message
    socket.on("PrivateMessage",function(source,target,content){
        var targetSocket = "";
        // Get the target socket
        for(var n in clients_list){
            if(clients_list[n].name === target){
                targetSocket = clients_list[n].Socket;
            }
        }
        if(targetSocket != ""){
            socket.emit("PrivateMessageSent",target,content);
            targetSocket.emit("ReceivedPrivateMessage",source,content);
        }
        else
            socket.emit("PrivateMessageFailed");
    });

    // Receive the request to update the person information
    socket.on("requestSetInfo",function(oldName,newName){
        User.findOne({username:newName})
            .then(function(sameName){
                if(sameName){
                    socket.emit("nameExists");
                }else{
                    updateInfo(oldName,newName);
                }
            });
    });

    // Get the chat log
    socket.on("getChatList",function(){
        Content.find().limit(10)
            .then(function(list){
                if(list){
                    socket.emit('getChatListDone',list);
                }
            });
    });

    // Users disconnect
    socket.on('disconnect',function(){
        var Name = "";
        for(var n in clients_list){
            if(clients_list[n].Socket === socket){
                Name = clients_list[n].name;
                clients_list.splice(n,1);
            }
        }
        statusSetOffLine(Name);
        socket.broadcast.emit('useLogout',client.name);
    });

    // Update the person information
    function updateInfo(oldName,newName) {
        User.update({username: oldName}, { username: newName })
            .then(function(){
                for(var n in clients_list){
                    if(clients_list[n].Socket === socket){
                        clients_list[n].name = newName;
                    }
                }
                socket.emit("setInfoDone",oldName,newName);
                socket.broadcast.emit("userChangeInfo",oldName,newName);
                global.userName = newName;
                updateUserList();
            })
    }
});
