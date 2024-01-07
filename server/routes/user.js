const express = require('express');
const router = express.Router();
const User = require('../models/user');
const util = require('../utils/util');
const upload_s3 = require('../modules/s3-multer'); 
const getConnection = require('../mysql/dbsetting');
const {img_server} = process.env;


//프로필 이미지
router.get('/profile', function(req, res) {
  
  User.findOne({userId: req.user.userId},function(err,user){
    if(err) return res.send('err');
    res.send(user.profile);
 });
})


//아이디 중복체크 
router.get('/add/:userId', (req, res) => {
  User.findOne({userId: req.params.userId},function(err,user){
  if(err) return res.send('err');
  else if ((user === null ||  user === undefined)){
    res.send('사용 가능한 아이디입니다.');
  }else{
    res.send('이미 존재하는 아이디입니다.');
  }
    });
  });
  

//아이디 생성(회원가입)
router.post('/', upload_s3.profile.single('profile_img'), function(req, response){

  const UserId = req.body.userId; 
  const params = [UserId, 1000 , 0, 0 ]; //mysql
  
  console.log(req.file);

  if(req.file){ //req.file = multer로 얻은 파일객체.
                //key : 저장된 파일명(확장명 포함)
     req.body.profile = `${img_server}/profile/${req.file.transforms[0].key}`
  }else{  //req.body만 반환.
     req.body.profile = `${img_server}/profile/profile.png`
   }

   console.log(req.body)

  User.create(req.body, function(err, user){
    if(err) return console.log(err);
    console.log(user, 'mongoDb user 생성');
    if(user){
      
      getConnection((conn) => { //장바구니 계정생성 & 첫포인트 지급//
        conn.query(`INSERT INTO users(UserId, user_point, payments, member_level)
            VALUES(?,?,?,?)`, params ,(err, result) => {
            if (err) throw err;
            console.log(result, 'mysql user 생성완료');

            if(result.affectedRows === 1){
              conn.query(`CALL sp_point_add(?,?,?,?,@oResult, @oPointId)`,
                [UserId, 1000, null, '최초적립'],(err, result) => {
                if (err) throw err;
                if (result.affectedRows === 1){
                 console.log(result, '첫 포인트 지급');   
                 response.send('가입완료');
                }
              })
            }
          });
        conn.release(); 
      });      

    }
  }); 
});


//사용자 정보
router.get('/', util.isLoggedin, function(req, res){
    User.findOne({userId:req.user.userId}, function(err, user){
      if(err) return console.log(err);
      if(user) return res.json({message: 'connected', user:user});
    });
});


// 비밀번호 수정 
router.put('/:userId', util.isLoggedin, checkPermission, async function(req, res, next){
  // util.isLoggedin - 로그인 상태 확인 
  // checkPermission - =>>  req.params.userId = req.user._Id 
   const nuser = await User.findOne({userId: req.params.userId}) 
      .select('password') // select : false 였던 값을 불러옴 
      .exec()

        nuser.password = req.body.newPassword;
        
        nuser.save(function(err, user){
          if(err) return console.log('err');
          if(user)return res.send('200');
        });   

    });


//회원탈퇴 
router.delete('/:userId', util.isLoggedin, checkPermission, function(req, response){

    User.deleteOne({userId:req.params.userId}, function(err){//mongoDB 유저삭제
      if(err) return res.json(err);
      
      getConnection((conn) => { //mysql 유저삭제
        
        conn.query(`DELETE FROM users WHERE userId = "${req.user.userId}"`,(err, result) => {
            if (err) throw err;
            if (result.affectedRows === 1){
               console.log(result, 'mysql user 삭제완료');
               response.send('탈퇴가 완료되었습니다.');
            }
          });
         conn.release();       
      }); 
    
    });

  });


module.exports = router; 

// private functions // (사용자 확인) 
function checkPermission(req, res, next){
  User.findOne({userId:req.params.userId}, function(err, user){
   if(err) return res.json(err);
   if(user.id != req.user.id) return util.noPermission(req, res);
  
   next();
  });
 }