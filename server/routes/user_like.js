const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const Like = require('../models/user_like');
const util = require('../utils/util'); 


//좋아요개수 
router.post("/getlikes", (req, res) => {

  let variable = {};
  if (req.body.reviewId) {
    variable = { reviewId: req.body.reviewId};
  } else {
    variable = { commentId: req.body.commentId};
  }
  
  Like.find(variable)
  .exec(function(err, likes){
    if (err) return res.status(400).send(err);
    res.json(likes);
  });
});


//좋아요 목록 
router.post("/liked_check", (req, res) => {
  
   let variable = {};
    if (req.body.reviewId) {
      variable = { reviewId: req.body.reviewId, userId: req.user._id};
    } else {
      variable = { commentId: req.body.commentId, userId: req.user._id};
    }
  
   Like.findOne(variable)
     .exec(function(err, like){
      if(err) return res.json(err);
      if(like){res.json(true)}
    }); 
});


 //like(추가)
  router.post("/uplike", (req, res) => {
    
    req.body.userId= req.user._id;

    Like.create(req.body, function(err,like){
      if(err) return res.send('err'); 
      if(like){res.send('200');}
    });

  });

  //unlike(취소)
  router.post("/unlike", (req, res) => {
    let variable = {};
    if (req.body.reviewId) {
      variable = { reviewId: req.body.reviewId, userId: req.user._id};
    } else {
      variable = { commentId: req.body.commentId, userId: req.user._id};
    }

    Like.findOneAndDelete(variable).exec((err, result) => {
      if (err) return res.status(400).json({ success: false, err });
      res.send('200');
    });
  });
  

module.exports = router;