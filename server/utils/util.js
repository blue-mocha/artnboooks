
const util = {};

//로그인 검증 
util.isLoggedin = function(req, res, next){
 if(req.isAuthenticated()){
    next();
 } 
 else {
    res.send('err'); 
 }
}

util.noPermission = function(req, res){
  req.logout();
}


//getPostQueryString//
util.getPostQueryString = function(req, res, next){
  res.locals.getPostQueryString = function(isAppended=false, overwrites={}){    
    var queryString = '';
    var queryArray = [];
    var searchType = overwrites.searchType?overwrites.searchType:(req.query.searchType?req.query.searchType:''); 
    var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:''); 

    if(searchType) queryArray.push('searchType='+searchType); 
    if(searchText) queryArray.push('searchText='+searchText); 

    if(queryArray.length>0) queryString = (isAppended?'&':'?') + queryArray.join('&');
  
    return queryString; 
  
  }        

  next();
}

//uploadFiles
util.bytesToSize = function(bytes) { // 1
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}


module.exports = util;