import React ,{useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom'; 
import {isLogin, Login_info} from 'utils/isLogin'; 
import axios from "axios";
import 'styles/components/header.scss'; 

//icon
import facebook from 'assets/images/fb2.png'; 
import mycart from 'assets/images/cart-icon.png'; 

function Header() {
  const URL = process.env.REACT_APP_SERVER_URL;
  const navigate = useNavigate(); 

  const [profileURL, setProfile] = useState(null); 
 
   if(isLogin() && profileURL === null){
     get_profile(); 
   }

   async function get_profile(){
    const res_profile = await axios.get(`${URL}/user/profile`, {withCredentials: true}); 
    setProfile(res_profile.data);
   }

  const logout = async ()=> {
  const response = await axios.get(`${URL}/login/logout`,{withCredentials: true }); 
  if (response.data == "success"){
    sessionStorage.clear(); 
    localStorage.clear();
    navigate('/');
    }
  }  
  const Facebook = () => {
   window.open('https://www.facebook.com/sharer/sharer.php?u=https://artnbooks.tk/')
  }

  return (

    <div className="header">

          <div className="header_top">

            <div className="header_login">
              {isLogin()?
                
                (<div id="logined">  
                  <h4>안녕하세요! <b>{Login_info()}</b>님!</h4>
                  <span>
                    <Link to ="/mypage">
                    <img src = {profileURL}  width="20px"/><span> [마이페이지]</span>
                    </Link> 

                  </span>
                </div>)

                : (<div>
                  <Link to="/Login">로그인</Link>
                  <span> | </span>
                  <Link to="/SignUp">회원가입</Link>
                  </div>)
              }
              </div>  

            <div className="hearder_buttons">

             
              {sessionStorage.getItem('userId') || 
                localStorage.getItem('userId') ? 
              (<button onClick={logout}>로그아웃</button>) : null }
             

              <img src={facebook} onClick={Facebook} alt="facebook" width="23px"/>
              <Link to ='/mycart'><img src={mycart} alt="mycart" width="23px"/></Link>
              </div>

          </div>
       
          <div className="header_logo">
          <Link to="/"><h1><span>art</span>:nBooks</h1></Link>
          </div>
          

    </div>
    );
  }
  
  export default Header;