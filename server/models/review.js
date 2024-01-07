const mongoose = require('mongoose'); 
const Counter = require('./counter');

const Day = new Date();
const Today = Day.toLocaleDateString();

const reviewSchema = new mongoose.Schema({

  author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  category: {type: String, required: true},
  title: {type: String, required: true},
  text:{ type: String, required: true},
  attachment:{type:mongoose.Schema.Types.ObjectId, ref:'File'}, 
  saveDate: {
      type : String, 
      default: Today
    },
  views:{type:Number, default:0},
  numId:{type:Number},
  likes:{type:mongoose.Schema.Types.ObjectId, ref:'Like'}, 
  
});

reviewSchema.pre('save', async function (next){ 
    const Review = this;
    if(Review.isNew){
      counter = await Counter.findOne({name:'Reviews'}).exec();
      if(!counter) counter = await Counter.create({name:'Reviews'});
      counter.count++;
      counter.save();
      Review.numId = counter.count;
    }
    return next();
  });

  
 module.exports = mongoose.model('Review', reviewSchema);
 