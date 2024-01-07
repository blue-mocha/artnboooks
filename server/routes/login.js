const express = require('express');
const router = express.Router();
const passport = require('../config/passport'); 
const {SiteUrl} = process.env;


//로그인
router.post('/', function(req, res, next){

  passport.authenticate('local-login',function(err, user){
      //인증할 방식 선택->passport.use(로그인)
    if(err) {return res.status(500).json(err);}
      if(!user) {return res.send('err')}

      //-> user 생성. 
      req.login(user, function(err) { 
        //login-> serialize실행. 쿠키에 보낼 세션아이디 암호화. 
      if (err) { return next(err); } 
      res.send('success');
       });

  })(req, res, next); 
}); 
 

//로그아웃 
router.get('/logout', function(req, res) {

  req.session.destroy(err => {
    if(err){
        console.log(err);
    } else {
       res.clearCookie('connect.sid').status(200).send('success');
    }
    }); 

});


//GOOGLE_로그인(oauth)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']

})); 
 
router.get('/google/callback', passport.authenticate('google', {
         failureRedirect: `${SiteUrl}/` }), //결과 웹 프론트로.

      (req, res) => {
          res.redirect( `${SiteUrl}/login`);
      }
);



module.exports = router;

