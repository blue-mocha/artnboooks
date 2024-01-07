
export function isLogin(){
  
  if(sessionStorage.getItem('userId') 
  || localStorage.getItem('userId') !== null || undefined ){
    return true; 
  }else{
    return false; 
  }
}

export function Login_info(){
  
  if(sessionStorage.getItem('userId')){
    return sessionStorage.userId;
   }else if(localStorage.getItem('userId')){
     return localStorage.userId;
   }else{
     return alert('로그인이 필요한 서비스입니다.');
   }
}


