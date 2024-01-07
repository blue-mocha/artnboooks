const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');


//show(:id로 찾기)
router.get('/find/:id', function(req, res){
    Comment.find({postId: req.params.id})
    .populate('author')            
    .exec(function(err, comment){      
    if(err) return res.json(err);
    res.json(comment);
    })

});

//comment 
router.post('/', function(req, res) {

       const comment = new Comment(); 
       comment.author = req.user.id;
       comment.postId = req.body.postId; 
       comment.text = req.body.text;
       
       comment.save(function(err){
        if(err){
            res.json({message : '생성 실패'});
            return;
        }
        res.send('200');
    });

    });


//delete
router.delete('/delete/:id', function(req, res){
       
  Comment.deleteOne({ _id: req.params.id}, function(err, output){
     if(err) return console.log(err);
     res.send('삭제 되었습니다');
 })

});
  
module.exports = router;
