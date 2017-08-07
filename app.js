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


var clients_list= new Array();

function getTime(){
    var date = new Date();
    var time = "["+date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"]";
    return time;
}

function  updateUserList(){
    User.find({status: "online"})
        .then(function(onlineList){
            server.emit('user_list',onlineList);
        });
}

//Config the application model engine
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');

//Static file
app.use('/public',express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//Config Session
app.use(session({
    secret: 'Session',
    cookie:{
        maxAge: 1000*60*600
    }
}));

app.use(function(req,res,next){
    res.locals.user = req.session.user;
    var err = req.session.error;
    delete req.session.error;
    res.locals.message = "";
    if(err){
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
    }
    next();
});

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

// server listening
server.on('connection',function(socket){
    // Emit the user list
    updateUserList();
    // Client Object
    var client = {
        Socket: socket,
        name: ''
    };

    socket.on("message",function(name){
        client.name = name;
        clients_list.push(client);
        socket.broadcast.emit("NewUser","System@: "+client.name+" has login.");
    });
    // Showing Contents
    socket.emit("system","system@: "+client.name+" Welcome !");

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

    // private message
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
    });

    //updateUserInfo
    function updateInfo(oldName,newName) {
        User.update({username: oldName}, { $set: { username: newName }})
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
    // request to reset information
    socket.on("requestSetInfo",function(oldName,newName){

        User.findOne({name:newName})
            .then(function(sameName){
                if(sameName){
                    socket.emit("nameExists",newName);
                }else{
                    updateInfo(oldName,newName);
                }
            });
    });


    socket.on("getChatList",function(userName){
        Content.find({name: userName})
            .then(function(list){
                if(list){
                    socket.emit('getChatListDone',list);
                }
            });
    });

    socket.on('disconnect',function(){
        var Name = "";
        for(var n in clients_list){
            if(clients_list[n].Socket === socket){
                Name = clients_list[n].name;
            }
        }
        statusSetOffLine(Name);
        updateUserList();
        socket.broadcast.emit('useLogout',"system@: "+client.name+" leave the chat room");
    });
    function statusSetOffLine(userName){
        User.update({username:userName},{ $set:{ status: "offline"}},function(err){});
    }

});
