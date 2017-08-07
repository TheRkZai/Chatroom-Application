/**
 * Created by RkZai on 2017/8/3.
 */
var mongoose =require('mongoose');
module.exports = new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    status:{type:String,default: "offline"}
});