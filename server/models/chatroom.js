const mongoose = require("mongoose");


const chatSchema = new mongoose.Schema({
 
 roomName :{ type:String, required:true, unique:true},
 users:  { type : Array, default:[]},

});

module.exports = mongoose.model("ChatRoom", chatSchema);