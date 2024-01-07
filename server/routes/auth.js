const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); //인증번호 보내기.
const User = require('../models/user');
require('dotenv').config();


//아이디찾기 
router.post('/forget-id',function(req, res){
  
  User.findOne({email : req.body.id_email})  
  .exec(function(err, user){
  if(err) return res.send('err');
  if(!user) return res.send('일치하는 사용자가 없습니다.');
  if(user){

      const mailOptions = {
      from: process.env.NODEMAILER_USER, 
      to: req.body.id_email,    
      subject: '[artnbooks] 아이디 확인 메일입니다.',
      html:   
      `<div style="text-align: center;">
       <p>아이디: <b>${user.userId}</b></p></div>` ,
   
    };
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
          }
      });
  
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.send('전송실패');
        //console.log(error);
      } else if(info){
        //console.log(info);
        res.send('메일이 전송되었습니다.'); 
      }
      }); 

    
     }
    
  });
})


//비밀번호찾기(인증키발송)
router.post('/forget-password', function(req, res){
  
    User.findOne({userId : req.body.user_id, email : req.body.pw_email})  
    .exec(function(err, user){  //패스워트 가져오기 설정. 
    if(err) return res.json(err); 
    if(!user) return res.send('일치하는 사용자가 없습니다.');
    if(user){
      
      const authNum = Math.random().toString().substring(2,8);
      
      const mailOptions = {
        from: process.env.NODEMAILER_USER,    
        to: req.body.pw_email,    
        subject: '[artnbooks] 비밀번호찾기 메일입니다.',
        html:  
         `<div style="text-align: center;">
         <p>비밀번호 재설정을 위해 '인증번호'를 입력하세요.</p>
         <h3> ${authNum}</h3>
         </div>`
      
      };

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
            }
        });

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          res.send('전송실패');
        } else if(info){
          res.json({message:'메일을 전송했습니다.', key : authNum});
        }
        }); 
     }
    });
})

//비밀번호 재설정(+인증키)
router.post("/reset-password", async (req, res) => { 
  const nuser = await User.findOne({ userId : req.body.user_id})
  .select('password')
  .exec()

  nuser.password = req.body.newPassword;

  nuser.save(function(err, user){
    if(err) return res.send('저장실패');
    if(user) return res.json({message :'비밀번호가 저장되었습니다.', saved : true });
  });   

});


//회원가입 : 이메일인증(인증키발송)
router.post('/email', function(req, res){ 
  
  User.findOne({email: req.body.email}) 
  .exec(function(err, user){
      if(err) return console.log(err);
      if(user) return  res.send('이미 존재하는 이메일입니다.');
      if(!user){

        const authNum = Math.random().toString().substring(2,6);
    
        const mailOptions = {
          from: process.env.NODEMAILER_USER,    
          to: req.body.email,    
          subject: '[artnbooks] 이메일 인증번호입니다.',
          html:   
          `<div style="text-align: center;">
          <p>이메일 인증을 위한 인증번호 입니다.</p>
          <h3> ${authNum}</h3>
          </div>`
       
        };
      
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
              }
          });
      
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            res.send('전송실패');
            //console.log(error);
          } else if(info){
            //console.log(info);
            res.json({message: '인증번호가 발송되었습니다.', key : authNum}); 
          }
          }); 
      }
  });
})

module.exports = router;

 
