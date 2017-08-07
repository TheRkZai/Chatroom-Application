/**
 * Created by RkZai on 2017/8/3.
 */
var express = require('express');
var router = express.Router();
router.get('/', function(req, res,next) {
    res.redirect("/login/login");
});
module.exports=router;