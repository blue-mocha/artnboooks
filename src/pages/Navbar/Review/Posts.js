import React, {useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import 'styles/pages/review.scss'; 

const Posts = ({ Lists, loading, tableIndex, totalCount}) => {
  const {id} = useParams(); 

  return (
   <>
    { loading &&
      <div> loading... </div>
    }
  
  <table className="review_table">
            <tr id="title">
              <th width="8%">No.</th>
              <th width="52%">제목</th>
              <th width="10%">이름</th>
              <th id ="date" width="10%">날짜</th>
              <th width="10%">조회수</th>
            </tr>  

   {Lists.map((post, index)=>(

   <tr key={post._id}
       style={ post._id === id ? { backgroundColor: '#c7df99'} : undefined } >

        <th>{post._id === id ? <u>{tableIndex - index}</u> : tableIndex - index}</th>
        <th id="post_title">{`[${post.category}]`}<Link to={`${post._id}`}> {post.title}</Link>
          {post.attachment && 
            !post.attachment?.isDeleted?  '(파일첨부)' : "" }
        </th>

        <th>{post.author?.userId}</th>
        <th id ="date">{post.saveDate}</th>
        <th>{post.views}</th>
   </tr>
    ))
  }

  </table>  

  { !loading && totalCount === 0 &&
    <div><h4>검색된 자료가 없습니다.</h4></div>
  }
  
  </>
 )
}
export default Posts;