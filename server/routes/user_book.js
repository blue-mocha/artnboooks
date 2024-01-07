const express = require('express');
const router = express.Router();
const Mybook = require('../models/user_book');
const User = require('../models/user');


//즐겨찾기(목록)
router.get('/', function(req, res) {
 
  Mybook.find({userId: req.user._id})
   .exec(function(err, likes){
    if(err) return console.log(err);
    if(likes) return res.json(likes); 
  });

}); 
  

//즐겨찾기(추가)
  router.post('/', function(req, res){

    req.body.userId= req.user._id;

    Mybook.findOne({userId: req.user._id, isbn : req.body.isbn},function(err, output){

      if(err) return console.log(err);
      if(output){ 
          return res.send('saved'); 
      }else{ 
            Mybook.find({userId: req.user._id})
              .exec(function(err, likes){
                if(err) return console.log(err);
                if(likes && likes.length < 20){ 
              
                Mybook.create(req.body, function(err, book){
                  if(err) return res.json(err);
                  if(book) return res.send('200'); 
                  });
                }else{
                  return res.send('exceeded'); 
                  }
              }); 
           }
     }); 

  });

  router.delete('/delete/:isbn', function(req, res){
    
    Mybook.deleteOne({userId: req.user._id, isbn : req.params.isbn}, function(err, output){
       if(err) return res.status(500).json({ error: "Database Failure!" });
       res.sendStatus(200);
    });
  });

  module.exports = router;