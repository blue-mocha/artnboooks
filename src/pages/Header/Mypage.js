import React, {useState, useEffect} from 'react'; 
import {Link, useNavigate} from 'react-router-dom'; 
import {isLogin, Login_info} from 'utils/isLogin'; 
import axios from "axios";
import 'styles/pages/mypage.scss'; 


function Mypage(){
   const navigate = useNavigate(); 
   const URL = process.env.REACT_APP_SERVER_URL;

    const [mybooks, setBooks] = useState([]); 
    const [reviews, setReviews] = useState([]); //내가 쓴 글

    const [profileURL, setProfile] = useState(null); 
    const [pW_checked, setChecked] = useState(null); //비밀번호 확인

    const [edit, setEdit] = useState(false); 
    const [inputs, setInputs] = useState({
       password : '', 
       newPassword : '', 
       certification : '',
    });

    console.log(profileURL)
    
    const { password, newPassword, certification} = inputs;
    
    function onChange(e){
      const { name, value }  = e.target;
      
      setInputs({
        ...inputs,
        [name]: value,
      });
    };

    useEffect(async () => {
      
     const response = await axios.get(`${URL}/review/my-reviews`, {withCredentials: true});
     setReviews(response.data.reverse());
     
     const res = await axios.get(`${URL}/user-book`, {withCredentials: true});
     setBooks(res.data.reverse());

     const res_profile = await axios.get(`${URL}/user/profile`, {withCredentials: true}); 
     setProfile(res_profile.data);

   },[]); 


   //현재 비밀번호 확인 
   const confirmPassword = async ()=> {
    const response = await axios.post(`${URL}/login`, {
      userId : Login_info(),
      password : password,
    },  { withCredentials: true }); 
     if(response.data =="success"){
      alert('비밀번호가 확인되었습니다.');
      setChecked(true);    
     }else{
       alert('비밀번호가 일치하지 않습니다');
      }
    };
      

   //비밀번호 수정 
   const passwordEdit = async () => {
    if(pW_checked){
      if(password !== newPassword){
        if(newPassword.length > 5 && newPassword.length < 13){
          if(newPassword === certification){ 
            const response = await axios.put(`${URL}/user/${Login_info()}`, 
              {newPassword : newPassword},  
              { withCredentials: true });

                if(response.data == 200){
                    alert('비밀번호가 변경되었습니다.');
                    navigate(0);  
                  }else if(response.data === 'same password'){
                    alert('현재 비밀번호와 동일합니다.')
                  }
                  
            }else {alert('비밀번호가 일치하지 않습니다');}
          }else{alert('6-12자 이내 영문, 숫자로 입력해주세요.');}
         }else {alert('현재 비밀번호와 동일합니다.');}  
        }else{alert('현재 비밀번호를 확인해주세요');}
    } 

    //책목록 삭제 
    async function deleteBook(e){
      const isbn = e.target.value; 

    if(window.confirm("목록을 삭제하시겠습니까?")){
      const res = await axios.delete(`${URL}/user-book/delete/${isbn}`, 
        { withCredentials: true });
        if(res.status == 200){
          alert('목록을 삭제했습니다.');
          navigate(0); 
        }
    }
  }; 
    
    //회원탈퇴
    async function Delete(){
      if(window.confirm("정말로 탈퇴하시겠습니까?")){
        const res = await axios.delete(`${URL}/user/${Login_info()}`,
        { withCredentials: true });
          alert(res.data);
          sessionStorage.clear(); 
          localStorage.clear();
          navigate("/"); 
      }
    }; 
    
    return (
      <div className="mypage_container">
      
      <div>
      <h3><b>▶기본정보</b></h3>
      </div>
      <hr/> 
        <p><img src = {`${profileURL}?w=100`} width ="100"/></p>
        <p>아이디 : {Login_info()}</p>
        <p>비밀번호 : <button onClick={()=>{setEdit(true)}}>수정하기</button></p>
          
        {edit && isLogin() && 
        <div>
          <p>현재 비밀번호 : <input type ="password" name= "password" onChange={onChange}/>
           <button onClick={confirmPassword}>확인</button></p>
          <p>비밀번호 변경 : <input type ="password" name= "newPassword" onChange={onChange}/>
             <span>(6-12자 이내 영문, 숫자)</span>
          </p>
          <p>비밀번호 확인 : <input type ="password" name= "certification" onChange={onChange}/>
            <button onClick={passwordEdit}>변경하기</button>
            <button onClick={()=>{setEdit(false)}}>취소</button></p>
        </div>  
        }

       <hr/>
       <p><b>▶좋아요 누른 책(최대 20개)</b></p>
      <div>
         {mybooks.map((item, index)=>(
          
          <div id="booklikes" key={index}>
            <img src={item.image} width="100" height="150"/>
            
            
            <div id ="booklink">
              <button onClick={()=>navigate('/reviewform',
                  { state: {data : JSON.stringify(item)} }) }>
                   서평쓰기</button>
              <button onClick={deleteBook} value={item.isbn}>삭제</button>
            </div>
            
           </div>
         ))
         }
  
      </div>
       

       <hr/>
       <b>▶내가 쓴 글(최근순, <u>{reviews.length}개</u> 게시물)</b>

      <div style = {{height : "200px",  overflow:"auto"}}>
        {reviews.map((review, index)=>(
        <table>
        <tr key={index}>{review.saveDate} 
        {`[${review.category}]`} <Link to= {`/reviewlist/${review._id}`}>{review.title}</Link></tr>
        </table>
        ))
        }
      </div>

      
      <hr/>
      <button onClick={Delete}>회원탈퇴</button>   
      </div>
    )
   }
  
  export default Mypage;