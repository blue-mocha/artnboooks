import React, {useState, useEffect} from 'react'; 
import {Link, useNavigate} from 'react-router-dom'; 
import {isLogin, Login_info} from 'utils/isLogin'; 

import axios from "axios";

import chat_icon from 'assets/images/chat.png';
import 'styles/pages/home.scss'; 

function Home() {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;

  //console.log(URL, process.env )
  const [books, setData] = useState([]); 
  const [reviews, setReviews] = useState([]); 


  useEffect(async () => {

    const response = await axios.get(`${URL}/booksearch/recent/art`);
    const json_response = JSON.parse(response.data);
     setData(json_response.rss.channel.item); 

    const res_best = await axios.get(`${URL}/review/best-reviews`);
     setReviews(res_best.data);

  }, []);  

  const LikesButton = async(e)=> {

    if(Login_info() !== null){

        const item = JSON.parse(e.target.value);  

        const response = await axios.post(`${URL}/user-book`,{
          author: item.author._text,
          title:  item.title._text,
          image :  item.image._text,
          isbn :  item.isbn._text,
          link : item.link._text,
        },{ withCredentials: true });

          if(response.data == 200){
            if(window.confirm('저장되었습니다! [마이페이지]에서 확인하시겠습니까?')){
              navigate('/mypage');
            }
          }else if(response.data === 'saved'){
            alert('이미 저장된 도서입니다.')
          }else if (response.data === 'exceeded') {
            alert('즐겨찾기는 20권 이하로 제한됩니다.');
          }
        }
    }

    const enterChat=(e)=>{
       if(isLogin()){
         if(window.confirm('채팅방에 입장하시겠습니까?')){
          navigate(`/chat/${e.target.value}`);
         }
       }else{
         Login_info();
       }
    }

    function makeChat(){
      if(window.confirm('[도서검색>채팅방입장]')){
       return navigate('/booksearch');
      }return; 
    }

    return (
      <div className="home">

            <div className="recommanded">
              <h3><u>▼추천도서</u> <span>#예술 #베스트셀러</span></h3>

              {books && books.map((item, index)=>(

                <div id="recent_book" key ={index}>  
                  <img src ={item.image._text}/>
                      
                  <div id="recentBook_like">
                    <button onClick={LikesButton} value={JSON.stringify(item)}>
                    ♥좋아요 
                    </button>
                  </div>

                </div>
                 )) }
            </div>

            <div className="chatRoom">
              <h3><u>▼도서토론방(채팅)</u></h3>
                <p>[추천도서방]</p>
                <button onClick={enterChat} value={'1190337347 9791190337342'}>
                  <img src ={chat_icon} width ="30"/>
                  [도서]예술에 대한 여덟번째 답변의 역사</button><br/>

                <button onClick={enterChat} value={'8997382160 9788997382163'}>
                  <img src ={chat_icon} width ="30"/>
                  [도서]미술관에 간 화학자</button>

                  <p>[회원참여방]</p>
                  <span><button onClick={makeChat}>
                    <img src ={chat_icon} width ="30"/>채팅방 만들기</button></span>
            </div>
    
            <div className="review_best">
             <h3><u>▼베스트인기글</u></h3>
                <table>
                  <tr id = "title">
                    <td width ="5%" >No.</td>
                    <td width ="55%">제목</td>
                    <td width ="20%">조회수</td>
                    <td width ="20%">작성자</td>
                  </tr>
                {reviews && reviews.map((review, index)=>(
            
                    <tr key={index}>

                      <td>
                      <b>{index + 1}</b>
                      </td>

                      <td id ="post_title">
                      {<b> [{review.category}] </b>} 
                        <Link to= {`/reviewlist/${review._id}`}>{review.title}</Link>
                      </td>  

                      <td>
                        {review.views}
                      </td>

                      <td>
                       {review.author.userId}
                      </td>
                    </tr>
                  
                ))
                }
                </table>
        </div>
       
      </div>
    );
  }
  
  export default Home;

  