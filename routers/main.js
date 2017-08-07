/**
 * Created by RkZai on 2017/8/3.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/users');

router.get('/',function(req,res,next){
    res.redirect('/login');
})

router.get('/login',function(req,res,next){
    res.render("login",{title:'User Login'});
})

router.get('/register',function(req,res,next){
    res.render("register",{title:'User Register'});
})

router.get("/home",function(req,res){
    if(!req.session.user){
        req.session.error = "Please login."
        res.redirect("/login");
    }
    res.render("home",{title:'Home',user:req.session.user});
});

router.get("/logout",function(req,res){
    req.session.user = null;
    req.session.error = null;
    res.redirect("/login");
});

router.post('/login',function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    if(username==' '){
        req.session.error = 'Username cannot empty!';
        res.sendStatus(404);
    }
    User.findOne({username:username})
        .then(function(user){
           if(!user){
               req.session.error = "Invalid Username";
               res.sendStatus(404);
               return;
           } else if(user.password!=password){
               req.session.error = "Wrong Password!";
               res.sendStatus(404);
               return;
           }else{
               req.session.user=user;
               statusOnline(username);
               res.sendStatus((200));
               return;
            }
        });
});

router.post('/register',function(req,res,next){
    var username=req.body.username;
    var password=req.body.password;
    User.findOne({username: username})
        .then(function(user){
            if(user){
                req.session.error = 'User Exists!';
                res.sendStatus(500);
                return;
            }else{
                new User({
                    username: username,
                    password: password,
                    status: 'offline'
                }).save();
                res.sendStatus((200));
                return;
            }
        });
});


function statusOnline(Name){
    User.update({username:Name},{ $set:{ status: "online"}},function(err, result) {});
}

module.exports = router;