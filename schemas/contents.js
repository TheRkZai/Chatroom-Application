/**
 * Created by RkZai on 2017/8/3.
 */
// Contents model
var mongoose =require('mongoose');
module.exports = new mongoose.Schema({
    name:{type:String,require:true},
    data:{type:String,require:true},
    time:{type:String,required:true}
});