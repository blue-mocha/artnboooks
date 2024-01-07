const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
  userId:{type:String, required:true, unique:true},
  password:{type:String, select:false},
  subscribe : {type : Boolean, default : false},
  email : {type:String, required:true,unique:true },
  checkbox : {
              reading: Boolean,
              perform : Boolean,
              exhibit : Boolean,
              creative : Boolean,
             }, 
  birth : {type:String},
  profile : {type:String, required:true}
});

  // hash password - isModified// 
  userSchema.pre('save', function (next){
  const user = this; 

  if(!user.isModified('password')){ 
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password); 
    return next();
  }
  });
  
// model methods // 
userSchema.methods.authenticate = function (password) {
const user = this;
return bcrypt.compareSync(password,user.password);
};

const User = mongoose.model('User', userSchema); 
module.exports = User ; 