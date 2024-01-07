const express  = require('express');
const router = express.Router();
const Review = require('../models/review');
const File = require('../models/file');
const fs = require("fs");


//파일 다운로드
router.get('/:serverFileName/:originalFileName', function(req, res){ 
  File.findOne({serverFileName:req.params.serverFileName, originalFileName:req.params.originalFileName},  async function(err, file){ 
    if(err) return res.json(err);

    let stream;           
    const statusCode = 200; 

    try{
      stream = await file.getFileStream(); //경로탐색
    }
    catch(e){
      statusCode = e; 
    }

    if(stream){
      res.writeHead(statusCode, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=' + file.originalFileName
      });
      stream.pipe(res);
    }
    else {
      res.statusCode = statusCode; 
      res.end();
    }
  });
});


//파일삭제 
router.post("/delete", (req, res) => {
      
  if (fs.existsSync("./uploadedFiles/" + req.body.file_name)) {//경로탐색 
           
      Review.findOneAndUpdate({_id: req.body._id},{ //정보수정 후 삭제.   
        $set : {attachment : null} }, (err, result)=>{      

          fs.unlinkSync("./uploadedFiles/" + req.body.file_name);
          res.status(200).end();

          if(err) return console.log(err);
      })      
  } 

});

module.exports = router;