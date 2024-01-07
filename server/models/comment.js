const mongoose = require('mongoose'); 

const Day = new Date();
const Today = Day.toLocaleString();

const commentSchema = new mongoose.Schema({
    postId:{type:mongoose.Schema.Types.ObjectId, ref:'Review', required:true},
    parentComment:{type:mongoose.Schema.Types.ObjectId, ref:'Comment'}, 
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    text:{ type: String, required: true},
    isDeleted:{type:Boolean},
    saveDate: {type:String, default: Today}, 

},{
  toObject:{virtuals:true}
});

commentSchema.virtual('childComments') 
  .get(function(){ return this._childComments; })
  .set(function(value){ this._childComments=value; });



const Comment = mongoose.model('comment',commentSchema);
module.exports = Comment;
 