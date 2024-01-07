const express = require('express');
const router = express.Router();
//var stream = require('express-stream');

const aws = require('aws-sdk'); //키 접속 
const s3 = new aws.S3(); //s3 객체 불러오기 
const fs = require('fs')//stream

router.get('/video/:fileName', async function(req, res){

    const param = {  
      Bucket: 'artnbooks-img-lamda/videos',  
      Key: req.params.fileName //파일명 
    }
  
    var readableStream = await s3.getObject(param).createReadStream(); // data chunk
        // Blob.prototype.stream()   
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      readableStream.pipe(res);
      
    
});

module.exports = router;
