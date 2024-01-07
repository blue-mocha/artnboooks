const mongoose = require('mongoose'); 


const mybookSchema = new mongoose.Schema({

  userId: {type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  author: {type:String},
  title:  {type: String},
  image :  {type: String},
  isbn :  {type: String, required:true},
  link :  {type:String},
  
});

 module.exports = mongoose.model('Mybook', mybookSchema);
 