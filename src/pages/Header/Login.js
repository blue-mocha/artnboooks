import React, {useState, useEffect} from 'react'; 
import {Link, useNavigate} from 'react-router-dom';
import {isLogin} from 'utils/isLogin'; 
import axios from "axios";
import google_logo from 'assets/images/google-logo.png';
import 'styles/pages/login.scss'; 

function Login({state}) {
  const navigate = useNavigate();
  const pathfrom =state?.from; //이전경로
  const URL = process.env.REACT_APP_SERVER_URL;

  const [local_checked, setLocal] = useState(false);
  const [drop, setDrop] = useState(false);
  const [authKey, setKey] = useState(null); 
  const [checked_key, setChecked] = useState(false); 
  const [cart_list, setLists] = useState([]); // 웹스토리지 장바구니목록// 

  const [inputs, setInput] = useState({
    //로그인
    userId: '',
    password : '',

    //id-pw찾기.
    id_email : '', //forget-id.
    user_id : '', //forget-password. 
    pw_email: '',  

    //키인증&비밀번호 재설정 
    email_key: '',
    newPassword: '',
    newPassword_cert: ''
   }); 
  
/*--------------------------------------------------------------*/ 
   const { userId, password, 
     id_email, user_id, pw_email,
     email_key, newPassword,newPassword_cert} = inputs ;  

   const onChange = (e) => { 
    const { name, value }  = e.target;
    setInput({
      ...inputs,
      [name]: value,
    });
  };

  //장바구니 체크 
  const cart_check = async()=>{

    //웹스토리지 목록 불러오기
    if(sessionStorage.getItem('mycart') !== null){
      setLists(JSON.parse(sessionStorage.getItem('mycart')));
    }

    //서버 목록에 추가 (배열추가)
    const response = await axios.get(`${URL}/user`,{ withCredentials: true});
    if(response.data === "success"){

        //웹스토리지 목록 삭제. 
        sessionStorage.removeItem("mycart");

    }

  
  }
/*--------------------------------------------------------------*/ 

 //isLogined : (리다이렉팅>> 홈)
  useEffect(async () => {

    if(isLogin()){ 
      navigate("/"); 
    }  

    //자동로그인 확인//
    const res = await axios.get(`${URL}/user`,{ withCredentials: true});
      //console.log(res.data)
      if(res.data.message === 'connected'){
        window.sessionStorage.setItem('userId', res.data.user?.userId)
        navigate("/");
      }


  },[]); 

  //아이디저장(선택버튼) 
  function checked(){setLocal(true);}


  //로그인 >>  
    async function Login_Input(){

      if(userId !== "" && password !== ""){

        const response = await axios.post(`${URL}/login`, 
        {
          userId: userId,
          password : password
        },{ withCredentials: true }); 
          
        if (response.data =="success"){

           // or cart_check(); 
          
          if(local_checked){ 
            window.localStorage.setItem('userId', userId); 

              //**cart_check();  // mysql : 장바구니 목록추가 // 

            if(pathfrom === undefined){
              navigate(`/`);
            }else
              navigate(`${pathfrom}`);
            
          }else{
            window.sessionStorage.setItem('userId', userId);

              //**cart_check();  // mysql : 장바구니 목록추가 // 

            if(pathfrom === undefined){
              navigate(`/`);
              //window.location.assign(`/`); //state 렌더링(프로필이미지)???
            }else
              navigate(`${pathfrom}`); 
          
            } 
          } else if (response.data =="err")
            {
              alert('아이디 또는 비밀번호가 일치하지 않습니다.');
              navigate(0); 
            }

       }else{
          alert('아이디 또는 비밀번호를 입력하세요.');
       }
     };


  //아이디찾기 
    const find_id= async (e)=> {

      if(isEmail(id_email)){
        const res= await axios.post(`${URL}/auth/${e.target.value}`,
         {id_email : id_email}, { withCredentials: true }); 
        if(res){
          console.log()
         alert(res.data);
        }
    };
  }

   //비밀번호 찾기 
   const find_pw = async (e)=> {

    function check_Id(id){
        const regExp = /^[a-zA-Z0-9]+$/;
        if(!regExp.test(id)){
            alert('아이디는 6자이내 영문 또는 숫자입니다.');
        }else{
          return true;  
        }      
      };  

    if(check_Id(user_id) && isEmail(pw_email)){
      const res= await axios.post(`${URL}/auth/${e.target.value}`, 
      {
        user_id : user_id,
        pw_email : pw_email 

       }, { withCredentials: true }); 

        if(res.data.key){
          alert(res.data.message);
          setKey(res.data.key);  
         }else{
           alert(res.data);
         }
        }
    };

   //새비밀번호 설정 
    const newPassword_Save = async (e)=> {

      if(newPassword === newPassword_cert){
        const res = await axios.post(`${URL}/auth/reset-password`,
         { user_id : user_id,
           newPassword : newPassword}, { withCredentials: true }); 

        if(res.data.saved){
            //console.log(res);
            alert(res.data.message);
            navigate(0); 
            }else{
              alert(res.data);
            }
      }else{
        alert('비밀번호가 일치하지 않습니다.');
      }
  }


     //이메일 정규식 체크 
     function isEmail(email){
        const regExp= /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        if(!regExp.test(email)){
            alert('이메일 형식을 확인해주세요.');
        }else{
            return true;
        }
      }

     //인증번호(인증) 
      function cert_key(){
        if(authKey === email_key){
          setChecked(true);
        }else{
          alert('인증번호가 일치하지 않습니다.');
        }
      }

      //onKeyPress 
      function onKeyPress(e){
        if(e.key === 'Enter'){
          Login_Input();
        }
      };

      //드롭버튼 
      function Updown(){
        if(!drop){
          return setDrop(true); 
        }else{
          setDrop(false); 
          setInput({
            user_id : '', 
            id_email : '', 
            pw_email: ''});
          }
        }
   
    return (
      <div className="login_container">
        <div className="login_box">
          <h1>로그인</h1>

          <table>
              
              <tr>
              <th>아이디</th>
              <td><input name="userId" onChange={onChange} value={userId} maxlength="6" autoFocus></input></td>
              </tr>

              <tr>
              <th>비밀번호</th>
              <td><input type ="password" name="password" 
              onChange={onChange}  value={password} maxlength="12" onKeyPress={onKeyPress}></input></td> 
              </tr>

              <tr>
                <td colspan="2">
                <input id= "check_box" type="checkbox" onClick={checked}/>
                아이디 저장하기 | <Link to="/signup">회원가입</Link>
                </td>
              </tr> 

              <tr>
                  <td colspan="2">
                    <button id="login_button" onClick={Login_Input} ><b>로그인</b></button>
                  </td>
              </tr>

              <tr>
                  <td colspan="2">
                    <button onClick={()=>window.location.replace(`${URL}/login/google`)}>
                    <img src = {google_logo} width ="20px" />구글로 로그인</button>
                  </td>
              </tr>

              <tr>
                <td colspan="2">
                <button onClick={Updown}>ID /비밀번호찾기{drop?(`▲`):(`▼`)}</button>
                </td>
              </tr>
          </table>
          
              <br/><hr/>

              {drop && 
                <div className ="idPw_finder">
                  <h3>아이디(ID) 찾기</h3>
                    이메일 : <input name = "id_email" onChange={onChange} value={id_email}/>
                    <button onClick={find_id} value={'forget-id'}>확인</button>
                  <p/>
                  <hr/>

                  <h3>비밀번호(PW) 찾기</h3>
                  
                  {checked_key === false && 
                    <div>

                        아이디 : <input name ="user_id" onChange={onChange} value={user_id}/><br/>
                        이메일 : <input name = "pw_email" onChange={onChange} value={pw_email}/>
                        <button onClick={find_pw} value={'forget-password'}>인증키 전송</button>
                      
                        {authKey !== null && 
                          <div>
                          <span>인증번호를 입력하세요</span>
                          <input name= "email_key" onChange={onChange} value={email_key}/>
                          <button onClick={cert_key}>확인</button>
                          </div>
                          }

                    </div>
                  }

                  {checked_key === true &&
                      <div>
                        <p><b>새로운 비밀번호를 입력하세요!</b></p>
                        새비밀번호 : <input name="newPassword" type="password" onChange={onChange} value={newPassword}/><br/>
                        비번재입력 : <input  name="newPassword_cert" type="password" onChange={onChange} value={newPassword_cert}/> (확인)
                        <button onClick={newPassword_Save}>저장</button>
                      </div>
                  }
                </div>
              }        
          </div>
       </div>
    );
  }
  
  export default Login;