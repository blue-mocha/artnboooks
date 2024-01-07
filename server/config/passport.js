const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; 
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
require('dotenv').config();//google
const {Server} = process.env;


// serialize// 
passport.serializeUser(function(user, done) {
  // ->session에 저장(req.session.passport.user = {id :...}) 
  done(null, user._id); 
  
  
});

//deserialize//
passport.deserializeUser((id, done) => { 
                   //req.session에 user가 존재하면->req.user에 저장. 
  User.findById(id, (err, user) => {
    done(null, user); 
  });
});


// local-strategy // 
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'userId', 
      passwordField : 'password', 
      session: true, 
      passReqToCallback : true //(req, id, password, done) => {};
    },

    function(req, userId, password, done) { 
      User.findOne({userId :userId})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){ 
            return done(null, user);
             
          }  
          else {
            return done(null, false);
          }
        });
     }
   )
);

// goole-strategy // 
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID, 
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: `${Server}/login/google/callback` //backend(callback)
 
},
 function(accessToken, refreshToken, profile, done){

  User.findOne({userId :profile.displayName})
      .exec(function(err, user){
        if (err) return done(null, false);
        if (user){return done(null, user);
        }else{

           User.create({ //첫 로그인시, 자동회원가입.
            email: profile?.emails[0].value,
            userId: profile.displayName,
            profile : profile?.photos[0].value
           
          },function(err,user){
              if(err) return done(null, false);
              if(user) {
                  return done(null, user)
                }else{
                  return done(null, false);
                }
           });    
        }  
        
    });
  }
));


module.exports = passport;