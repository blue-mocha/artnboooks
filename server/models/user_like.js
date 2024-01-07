const mongoose = require("mongoose");


const likeSchema = new mongoose.Schema({
 
 userId:{ type: mongoose.Schema.Types.ObjectId, ref: "User", required:true},
 //commentId: {type: mongoose.Schema.Types.ObjectId, ref: "Comment"},
 reviewId: {type: mongoose.Schema.Types.ObjectId, ref: "Review"}

});

module.exports = mongoose.model("Like", likeSchema);