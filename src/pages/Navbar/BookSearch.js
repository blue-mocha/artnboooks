import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom'; 
import {isLogin, Login_info} from 'utils/isLogin'; 
import Pagination from 'components/common/Pagination';
import axios from "axios";
import chat_icon from 'assets/images/chat.png';
import 'styles/pages/search.scss'; 
let currentPath =""; 

function BookSearch() { 
  const location = useLocation();
  const navigate = useNavigate(); 
  const URL = process.env.REACT_APP_SERVER_URL;

  const [data, setData] = useState({
        items : [],
        totalCount : 0, 
        totalPage : 0,
        input_data : [] //축적된 키워드 
  }); 

  const [curPage, setCurPage]= useState(1); //현재 페이지 

  const [recent, setRecent] = useState([]); //최근검색어(레디스)
  const [checked, setCheck] = useState(false); // 재검색(체크) 
  const [option, setOption] = useState('title'); //검색조건
  const [input, setInput] = useState(''); //검색어
  
  console.log(data)
 //console.log(response.data.items.length);

  function inputs(){ // 검색어 정리 
    if(checked){
      if(data.items.length > 0 && data?.input_data?.findIndex((x)=>
          Object.keys(x).find((a) => a === option && 
          Object.values(x).find((a) => a === input)) ) < 0 ){ //중복없음.
        return data.input_data.concat( {[option] : input} );  
      }else{
        return null; 
      }
    }else{
      return [{[option] : input}];
    }
  };

  console.log(data.input_data)
//===============================================================//

useEffect(async () => { //최근검색어(추가)
     if(isLogin()){
        const response = await axios.get(`${URL}/booksearch/redis`,
        {withCredentials: true});
        setRecent(response.data.reverse());
     }
  }, [data.items]);  

  useEffect(async () => { //페이지버튼
   const response = await axios.post(`${URL}/booksearch/${curPage}`, 
    {params : data.input_data}, {withCredentials: true});
    if(response.data.items.length > 0){
      setData(response.data);}
 }, [curPage]);  

 //navbar(리렌더링)
 useEffect(()=>{
  if(currentPath === location.path){navigate(0)};
     currentPath = location.path; 
 },[location])

//검색 : Enter키 사용-------------------------------------------// 
  const onKeyPress = (e)=>{
    if(e.key == 'Enter'){
      getSearch();
    }
  }
 
//최근-키워드(검색)----------------------------------------------//
  const recent_search = async(e)=> {

      function recent_key(e){
        if(checked){
          if(data?.input_data?.findIndex((x)=>
            Object.keys(x).find((a) => a === 'title' && 
            Object.values(x).find((a) => a === e.target.value)) ) < 0 ){//중복없음.

            return data.input_data.concat( {title : e.target.value} ); 
          }else {
            return null; //중복제거 
          }
        }else{
          return [{title : e.target.value}]; 
       }};

    if(recent_key(e) !== null){ // 검색어 중복이 아니라면,  

      const response = await axios.post(`${URL}/booksearch/${curPage}`, 
        {params :  recent_key(e)}, {withCredentials: true});
    
      if(response.data.items.length > 0){
        setData(response.data);
      }else{
         alert('더이상 검색된 자료가 없습니다');
         setData(response.data); 
         setCheck(false);
        }  
    }return ; 
     
  }      

  //일반검색(+재검색)
  const getSearch = async ()=> {

    if(inputs() !== null){

      if(input !== "" ){  //입력 검색
        const response = await axios.post(`${URL}/booksearch/${1}`, 
         {params : inputs()}, {withCredentials: true});
  
        if(response.data.items.length > 0){
          setData(response.data);
        }else{
          setData(response.data);  //input 없애기// 
          alert(`더이상 검색된 자료가 없습니다`);
        }
      }else{
          alert('검색어를 입력하세요.');
      }

    }return ; 
  }

  const LikesButton = async(e)=> {
    if(isLogin()){
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
     else {
       Login_info();
      }
  }

    function openChat(e){

      if(isLogin()){
        if (window.confirm('채팅방에 입장하시겠습니까?')) {
          navigate(`/chat/${e.target.value}`); 
        }
      }else{
        Login_info(); 
      }
      
    }

  return(
    <div className= "book_container">

      <div className = "search_box">

            <h3>▶도서를 '즐겨찾기'하고 '서평'을 남겨보세요!</h3>
                        
            { recent.length !== 0 ? 
              (<div>
                <b>최근검색어 : </b>

                {recent.map((item, index)=>(
                  <button id ="recent_keyword" key={index} 
                    onClick={recent_search} value={item}>{item}</button>
                  ))
                }

              </div>
              ) : null 
            }

            <select onChange={(e)=> setOption(e.target.value)}>
                    <option value="title" selected>도서명</option>
                    <option value="auth">저자</option>
                    <option value="publ">출판사</option>
            </select> 
            
            <input onChange={(e)=> setInput(e.target.value)} onKeyDown={onKeyPress} autoFocus/>
            <button onClick={getSearch}>검색</button>


            {data.input_data?.length > 0 ?
              (<div style={{borderBottom: '2px solid black', width : '92%'}}>
                <input type="checkbox" 
                  onClick={()=> checked? setCheck(false) : setCheck(true)}
                  style={{display:`inline-block`, width: '15px'}} />
                  <span>결과내 재검색</span>
                  <span> (검색결과 : 총 {data.totalCount} 건) </span>
              </div>) : null 
            }  

            {data.input_data?.length > 0 ?
                (<p><b>검색어</b> :  
                {data.input_data?.map((item, index)=>(
                  <span key={index} style={{background : "gray" , margin: "2px"}}>
                    { ` ${Object.keys(item)} : ${Object.values(item)} ` }
                  </span>
                 ))
                }
                에 대한 검색결과입니다.</p>) : null
            }          
      </div>
      
      <div className="search_contents">

        <table>
          {data.items !== [] && data.items.map((item, index)=>(
            
            <tr id="search_book" key={index}>
            
              <td width="80%">

                <tr>
                  <td id="table_title">제목 : </td><td><span><b>{item.title._text}</b></span></td>
                </tr>

                <tr>
                  <td id="table_title">저자 : </td><td><span>{(item.author._text)?.replaceAll("^", ",")}</span></td>
                </tr>
                
                <tr>
                  <td id="table_title">출판 : </td><td><span>{item.publisher._text}</span></td>
                </tr>

                <tr>
                  <td id="table_title"> 날짜 : </td><td><span>{item.pubdate._text}</span></td>
                </tr>                    
                
                <tr>
                  <td colSpan='3'>
                    {isLogin() === true ? 
                      (<button onClick={()=>navigate('/reviewform',
                      { state: {data : JSON.stringify({
                        title : item.title._text,
                        image : item.image._text,
                        author : item.author._text,
                        publisher : item.publisher._text})} 
                        }) }>
                          서평쓰기</button>)
                      :(<button onClick={()=>Login_info()}>서평쓰기</button>)
                    }
                  <button onClick={LikesButton} value={JSON.stringify(item)}>♥좋아요</button>
                  <button onClick={openChat} value={item.isbn._text}>
                  <img src ={chat_icon} width ="20"/>채팅방입장</button>
                  </td>
              </tr>  

              </td>   

              <td width="20%"> 
                <img id='bookImage' src ={item.image._text} alt='책 이미지'
                onClick={()=>{window.open(item.link._text)}}/>
              </td>

              </tr>
             
            ))
          }
        </table>

        <div>
          <Pagination curPage={curPage} setCurPage={setCurPage} 
           totalCount={data.totalCount} totalPage={data.totalPage} pageCount={10}/>
        </div>
       
      </div>
      

    </div>
  );  
}
export default BookSearch;