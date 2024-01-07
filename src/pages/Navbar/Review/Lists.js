import React, {useState, useEffect} from 'react';
import {Link, Outlet,useNavigate, useLocation} from 'react-router-dom'; 
import {isLogin, Login_info} from 'utils/isLogin'; 
import axios from "axios";
import Posts from 'pages/Navbar/Review/Posts'
import Pagination from 'components/common/Pagination';
import 'styles/pages/review.scss'; 
let currentPath =""; 

function ReviewList(){
  const location = useLocation();
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;
  //전체데이터 
  const [posts, setPosts] = useState([]); 

  //카테고리, 검색조건 
  const [category, setCatg] = useState('all'); 
  const [selbox, setSelbox] = useState('title,text'); 
  const [searchInput, setInput]  = useState(''); 
  const [loading, setLoading] = useState(false);
  const [searched, setCheck] = useState(false);//검색모드로 전환.

  //페이지 정보 
  const [page, setPageInfo] = useState({
         totalCount : 0,
         totalPage : 0 , 
         tableIndex : 0 ,
  }); 
  const [curPage, setCurPage] = useState(1);
  const [size, setSize] = useState(5); //페이지당 개수

   console.log(category)
  //------------------------------------------------------// 

   //navbar(리렌더링)
    useEffect(()=>{
      if(currentPath === location.path){navigate(0)};
        currentPath = location.path; 
    },[location])
      
   useEffect(async () => { 
    setLoading(true);
     
     if(searchInput ===  ""){ //일반 페이지네이션.
      const response = await axios.get(`${URL}/review/${category}/${curPage}/${size}`);
      setPosts(response.data.posts);
      setPageInfo(response.data.page)
     }else{
      getSearch();//입력어가 있다면, 검색버튼효과.
    }

    setLoading(false); 
  }, [curPage]);  //페이지 변화

  useEffect(async () => { 
    setLoading(true);

    if(searchInput ===  ""){ //일반 페이지네이션.
      const response = await axios.get(`${URL}/review/${category}/${1}/${size}`);
      setPosts(response.data.posts);
      setPageInfo(response.data.page)
    }else{
      getSearch();
    }

    setLoading(false); 
  }, [size]);  


  //페이지당 개수(size)
  const select_size = (e)=>{
    setSize(e.target.value);
  } 

  //카테고리(분류)
  const selected_catg = async(e)=>{
    setCurPage(1);
    setCatg(e.target.value); 
    const response = await axios.get(`${URL}/review/${e.target.value}/${curPage}/${size}`);
    setPosts(response.data.posts);
    setPageInfo(response.data.page);
  };

  //검색바 ----------------------------------------// 
  const onKeyPress = (e)=>{ //엔터키 사용 
    if(e.key == 'Enter'){
      getSearch(); 
    }
  }
  const selected = (e)=>{ //검색조건 
    setSelbox(e.target.value);
  }

  const Input = (e)=>{ //onChange
    setInput(e.target.value); 
  }; 

  const getSearch = async () => { //검색버튼 
    setLoading(true);
    
    if(searched === false){
      setCurPage(1);  //게시판모드->첫 검색(페이지 : 1)
    }

    const res = await axios.get(`${URL}/review/search/${category}/${curPage}/${size}?searchType=${selbox}&searchText=${searchInput}&category=${category}`);  
    setPosts(res.data.posts);
    setPageInfo(res.data.page);
    setCheck(true); //검색모드로 전환. 

    setLoading(false);
  }

  //카테고리 (selcted css)
   const selected_btn = (val)=>{
     return category === val ? {color : 'rgb(228, 161, 161)'} : null ; 
    };


//=======================================================================//
  return (
      
    <div>
      <Outlet/>

      
      <div className ="review_container">
       <h3><u>후기&서평게시판</u></h3>
       
        <div className="table_top">     

          <div className="category">
              <button onClick={()=>navigate(0)}> 전체</button>
              <button onClick={selected_catg} value="서평" 
                style={selected_btn('서평')} >서평</button>
              <button onClick={selected_catg} value="공연"
                style={selected_btn('공연')} >공연</button>
              <button onClick={selected_catg} value="전시"
                style={selected_btn('전시')} >전시</button>
          </div>
             
               <select onChange={select_size}>
                <option value="5" selected>5 posts</option>
                <option value="10">10 posts</option>
               </select> 

          </div> 
        
          <Posts Lists={posts} loading={loading} tableIndex={page.tableIndex} totalCount={page.totalCount}/>
          
          <div className="div_btn">
             <Link to='/reviewform'>
             <button id="write_btn" onClick={()=>isLogin()? null : Login_info()}>글남기기</button>
             </Link>
          </div>

          <div className="review_bottom"> 
            
            <div>
              <Pagination curPage={curPage} setCurPage={setCurPage} totalCount={page.totalCount}
                     totalPage={page.totalPage} pageCount={5}/>
            </div>
           
           <div>
              <select onChange={selected}>
                  <option value="title,text">전체</option>
                  <option value="title">제목</option>
                  <option value="text">본문</option>
              </select>

              <input onChange={Input} value={searchInput} onKeyPress={onKeyPress}/>
              <button onClick={getSearch} >검색</button>
            </div>

            
        </div>

      </div>
    </div> 

  )
}
  
  export default  ReviewList;