const express = require('express');
const router = express.Router();
//const getConnection = require('../mysql/dbsetting');

router.get('/', function(req, response){ 

  response.send('connected'); 

}); 
  
module.exports = router;


