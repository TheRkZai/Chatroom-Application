/**
 * Created by RkZai on 2017/8/3.
 */
var express = require('express');
var router = express.Router();
var User = require('../models/users');

// respond data structure
var responseData;
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        message: ''
    }
    next();
});

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
    if(username==''){
        responseData.code=1;
        responseData.message='Username cannot empty!';
        res.json(responseData);
        return;
    }
    User.findOne({username:username})
        .then(function(user){
           if(!user){
               responseData.code=2;
               responseData.message='Invalid Username!';
               res.json(responseData);
               return;
           } else if(user.password!=password){
               responseData.code=3;
               responseData.message='Wrong Password!';
               res.json(responseData);
               return;
           }else{
               req.session.user=user;
               responseData.code=0;
               responseData.message='';
               statusOnline(username);
               res.json(responseData);
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
                responseData.code=1;
                responseData.message='User Exists!';
                res.json(responseData);
                return;
            }else{
                new User({
                    username: username,
                    password: password,
                    status: 'offline'
                }).save();
                responseData.code=0;
                responseData.message='';
                res.json(responseData);
                return;
            }
        });
});


function statusOnline(Name){
    User.update({username:Name},{ $set:{ status: "online"}},function(err, result) {});
}

module.exports = router;