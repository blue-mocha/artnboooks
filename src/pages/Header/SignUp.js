import React, {useState, useRef} from 'react'; 
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import 'styles/pages/signup.scss'; 

function SignUp() {
const URL = process.env.REACT_APP_SERVER_URL;
const navigate = useNavigate(); 

const [authKey, setKey] = useState(null); //이메일 인증키 

//아이디 & 비번 & 이메일 인증 
const[checked_Id,setId] = useState(false);
const[checked_Pw,setPw] = useState(false);
const[checked_Email,setEmail] = useState(false); 

//프로필이미지
const [imageSrc, setImageSrc] = useState(null); // fIleReader(미리보기)
const [profile_img, setImage] = useState(null); // 프로필_이미지  

//인적사항 
const [inputs, setInputs] = useState({
    userId: '',
    password : '',
    email : '', 
    birth : '', 
    email_key : ''  
    }); 
const [subscribe, setSubscribe] = useState(false); 
const [checkbox, setChecked] = useState({});  


    const { userId, password, rePassword, 
            email, birth, email_key} = inputs;  

    const onChange = (e) => { 
        const { name, value }  = e.target;

        setInputs({
        ...inputs,
        [name]: value,
        });
    };


//FileReader (파일미리보기)
    const encodeFileToBase64 = (fileBlob, e) => {

         //console.log(fileBlob)

        const fileTypes = [
            `image/png`,
            `image/jpg`,
            `image/jpeg`,
            `image/bmp`
        ];   
     
        if(fileTypes.includes(fileBlob.type)){
            const reader = new FileReader();
                  reader.readAsDataURL(fileBlob);
            return new Promise((resolve) => {
                    reader.onload = () => {
                        setImage(fileBlob); //프로필_이미지(이진데이터)
                        setImageSrc(reader.result); //미리보기용(src)
                        resolve();
                     };
                });
        }else{
           alert(`PNG, JPEG(JPG),BMP 파일만 가능합니다`); 
           e.target.value = null; 
         }    
    };
   
 
//폼 전송 ---------------------------------------//
    const submit = async () => {

         if(subscribe && Object.keys(checkbox).length !== 0 || !subscribe){
            
            if(checked_Id && checked_Pw && checked_Email){
 
                const formData = new FormData();
                formData.append('userId', userId);
                formData.append('password', password);
                formData.append('subscribe', subscribe);
                formData.append('email', email);
                formData.append('checkbox', checkbox);
                formData.append('birth', birth);
                
                if(profile_img !== null){
                 formData.append('profile_img', profile_img);
                }
                
                const response = await axios.post(`${URL}/user`, 
                formData,{ withCredentials: true }); 
            
                if (response.data == '가입완료'){
                    alert(`${inputs.userId}님, 회원가입이 완료되었습니다!`);   
                    navigate("/login"); 
                } 
                
            }else{
                if(checked_Id===false){
                    alert('아이디 중복체크 필요!'); 
                }else if(checked_Pw===false){
                    alert('비밀번호를 확인해주세요!');     
                }else{

                    if(authKey === null){
                        alert('이메일 인증이 필요합니다.');
                    }else{
                        alert('이메일 인증을 위해 확인버튼을 누르세요.');
                    }
                 }
                }
            }else{
              alert('구독을 원하시면 관심사 체크필수!');
          }
    }

//아이디(영문입력,중복체크)
    const onInput= async ()=>{
        const regExp = /^[a-zA-Z0-9]+$/;
        if(!regExp.test(userId)){
            alert('아이디는 영문+숫자만 가능합니다.');
        }else{
            const checkingId = await axios.get(`${URL}/user/add/${inputs.userId}`); 
            alert(checkingId.data);
            setId(true); 
             }      
      };  

 //패스워드 확인    
    const pwConfimation=()=>{
        if(password.length<6 || password.length>12 ){
          alert('비밀번호는 6자 이상~ 12자 이내로 입력해주세요.');
        }else if(password!==rePassword){
            alert('비밀번호가 일치하지 않습니다.');
        }else{
            alert('비밀번호가 일치합니다.');
            setPw(true); 
            }
       };
       

 //이메일(인증키 발송) 
 const auth_email = async ()=>{

  const regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
        
    if(!regExp.test(email)){
            alert('이메일 형식을 확인해주세요.');
    }else{
         const res = await axios.post(`${URL}/auth/email`,
          {email : email}, { withCredentials: true }); 

          if(res.data.key){
            alert(res.data.message);    
            setKey(res.data.key); 
            console.log(res)
          }else{ 
             alert(res.data);    
             console.log(res)
          }
        }      
    };  


 //이메일인증(체크) 
 function cert_email(){
   if(authKey === inputs.email_key){
       alert('이메일이 인증되었습니다.');
       setEmail(true);
   }else{
     alert('인증번호가 일치하지 않습니다.');
   }
  };      
   
    //useRef 지정 
    //const email_Input = useRef();
    const file_Input = useRef();

    
 //이메일(아트뉴스 체크)
    function checked(e){
        if(e.target.checked){
            alert('관심사를 선택하세요!');
           // email_Input.current.focus();
            setSubscribe(true); 
        }else{
            setSubscribe(false);   
        }
    };


 //관심사 체크 
    const selected = (e) => { 
        const name = e.target.name; 
        const value = e.target.checked? true : false; 
        
        setChecked({
            ...checkbox,
            [name]: value,
        });
    };


 return (
   <>
    <div className="signup_container">
      
        <table className="signup_Form">
            <tr>
                <th colspan="2" bgcolor="#CCDDFF">
                    <h3>회원가입[필수사항]</h3></th>
            </tr>

            <p/>

            <tr>
                <th>아이디(ID):</th>
                <td><input name="userId" onChange={onChange} value={userId} maxlength="6" autoFocus/>
                <button onClick={onInput}>중복체크</button><span>(6자 이내,영문 or 숫자)</span></td>
            </tr>

            <tr>
                <th>비밀번호:</th>
                <td><input name="password" type="password" onChange={onChange} value={password}>
                </input><span>(6-12자 이내,영문 or 숫자)</span></td>
            </tr>

            <tr>
                <th>비밀번호(확인):</th>
                <td><input name="rePassword" type="password" onChange={onChange} value={rePassword}></input>
                <button onClick={pwConfimation}>확인</button></td>
            </tr>

            <tr>
                <th>이메일:</th>
                <td>
                <input name="email" onChange={onChange} value={email}/>
                <button onClick={auth_email}>인증하기</button>
                { checked_Email === true &&
                <span style={{color : 'red'}}> (인증완료)</span>  
                }
                </td>   
            
            </tr>

            {authKey !== null && checked_Email === false &&
            <tr>
                <th style={{color : 'blue'}}>인증번호를 입력하세요.</th>
                <input name="email_key" onChange={onChange} value={email_key}/>
                <button onClick={cert_email}>확인</button>
            </tr>
            }

                
            <p/>

            <tr><th colspan="2" bgcolor="#CCDDFF">
                    <h3>[선택사항]</h3></th>
            </tr>
                <tr>
                    <th>
                    <p>프로필 이미지</p>   
                    </th>

                    <td>
                    <input type="file"
                    onChange={(e) => {encodeFileToBase64(e.target.files[0], e);}} /><p/>
                    {imageSrc !== null &&
                        <>
                        <img src={imageSrc} alt="preview-img" style ={{width : `25%`}}/><br/>
                        <span>  [미리보기]</span>
                        </> 
                    }
                    </td>
                </tr>
            <p/>
            <tr>
                <th>관심사 선택</th>
                <td>
                <span style={ subscribe ? { backgroundColor: 'yellow'} : null} >
                    <input name ="reading" type="checkbox" onChange={selected} />독서
                    <input name ="perform" type="checkbox" onChange={selected} />공연
                    <input name = "exhibit" type="checkbox" onChange={selected} />전시
                    <input name = "creative" type="checkbox" onChange={selected} />창작
                </span>
                </td>
            </tr>

            <tr>
                <th>아트뉴스 구독하기</th>
                <td>
                <input name="subscribe" type="checkbox" onChange={checked}/>Yes(관심사 필수)
                </td>
            </tr>

            <tr>
                <th>생년월일:</th>
                <td><input name="birth" type="date" onChange={onChange} value={birth}></input></td>
            </tr>

            <tr height="80px">
               <th colspan="2">

                <button id="bottom_button" onClick={()=>navigate(0)}>다시 입력</button>
                <button id="bottom_button" onClick={submit}>회원 가입</button>
                
                </th>
            </tr>
        
        </table>
   </div>

 </> 
    );
  }
  
  export default SignUp;