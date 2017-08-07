/**
 * Created by RkZai on 2017/8/3.
 */
var mongoose =require('mongoose');
var contentSchema=require('../schemas/contents');

module.exports=mongoose.model('Content',contentSchema);