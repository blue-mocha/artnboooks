import React, {useState, useEffect} from 'react'; 
import {useNavigate} from 'react-router-dom'; 
import axios from "axios";
import {isLogin,Login_info} from 'utils/isLogin'; 


function LikedButton({id, URL}){
  const navigate = useNavigate();

  const [likes, setLikes] = useState(''); // 좋아요 갯수
  const [liked, setLiked] = useState(null); // 좋아요 우무 
  
  useEffect(async () => {
       
    const response_like = await axios.post(`${URL}/user-like/getlikes`,
    {reviewId : id},{ withCredentials: true })
    setLikes(response_like.data); 

    const response_liked = await axios.post(`${URL}/user-like/liked_check`,
      {reviewId : id},{ withCredentials: true });
      setLiked(response_liked.data);
  }, []); 


    //좋아요 버튼 
      const LikeButton = async ()=>{
      if(isLogin()){
        const res = await axios.post(`${URL}/user-like/uplike`,
        {reviewId : id}, 
        {withCredentials: true });

        if(res.data == 200){
         navigate(0);
        }

      }else{
        Login_info();
      }
      }

    //좋아요 취소 
    const unLikeButton = async ()=>{
      if(isLogin()){
        const res = await axios.post(`${URL}/user-like/unlike`,{
          reviewId : id},{withCredentials: true });
          if(res.data == 200){
              navigate(0);
          }    
        }else{
          Login_info();
        }
    }

 return (
  
  <div>
    <span><b>좋아요 {likes.length}</b></span>
    {liked === true?
     (<button onClick={unLikeButton}><img src={require(`assets/images/likedHeart.png`).default} width="10"/></button>)
    :(<button onClick={LikeButton}><span style={{ font:'1em Malgun Gothic'}}>♡</span></button>)
    }
  </div>  

 )};

  export default LikedButton; 