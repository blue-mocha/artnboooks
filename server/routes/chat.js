const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/chatroom');


//채팅방 리스트 
router.get('/', function(req, res, next) {
 
  ChatRoom.find()
  .exec(function(err, room){
    if(err) return res.json(err);
    res.json(room);
  });

});
 
//방 생성
router.post('/', function(req, res){

    ChatRoom.findOne({roomName: req.body.roomName})
    .exec(function(err, room){
      if(err) return console.log(err); 
      if(room === null){ // 채팅방 생성.
  
        ChatRoom.create(req.body, function(err, room){  
            if(err) return console.log(err); 
            if(room) {
              //console.log(room, '방생성'); 
              return res.status(200).end(); 
            }
        })
      }else{  
          
         ChatRoom.findOneAndUpdate({roomName : req.body.roomName}, { //deprecated
            $addToSet: {users : req.body.users} }, (err, result)=>{
              res.status(200).end();
              //console.log(result, `${req.body.users} 유저추가`); 
              if(err) return console.log(err);
             });
            
          } 
    });
  });


//접속자 리스트 
router.get('/users/:roomName', function(req, res) {

  ChatRoom.findOne({roomName : req.params.roomName})
  .exec(function(err, room){
    if(err) return res.json(err)
     res.json(room.users);
  });

});

//유저퇴장 
router.post('/delete', function(req, res){
       
  ChatRoom.findOneAndUpdate({roomName : req.body.roomName}, {
    $pullAll: { users : [req.body.users] }}, (err, result)=>{
     res.status(200).end();
     console.log(result, `${req.body.users} 유저삭제`); 
      if(err) return console.log(err); 
    });
 })

module.exports = router;