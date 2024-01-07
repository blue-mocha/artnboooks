import React, {useState} from 'react';

const Pagination = ({ curPage, setCurPage, totalPage, pageCount, totalCount}) => {
  //페이지그룹 
  const [pageGroup,setPageGroup] = useState((Math.ceil((curPage) / pageCount)))

  //첫 숫자 ~ 끝
  let lastNum = pageGroup * pageCount 
    if (lastNum > totalPage) { lastNum = totalPage }
  let firstNum = lastNum - (pageCount - 1) 
    if (pageCount > lastNum) { firstNum = 1 }

  //넘버링   
  const pageNumbers = []; 
    for (let i = firstNum; i <= lastNum; i++) { 
      pageNumbers.push(i);
    }

  return (
   <div>  

    {totalCount !== 0 && 
      <button onClick={()=>setPageGroup(pageGroup-1)}>&lt;</button>}  
    
      {pageNumbers.map(i => (
        <span key={i}> 
          <button style={curPage === i ? {background : 'black' , color : 'white'} : null} 
                  onClick={() => setCurPage(i)} >
            {i}
          </button>
        </span>
      ))}

    {totalCount !== 0 && 
      <button onClick={()=>setPageGroup(pageGroup+1)}>&gt;</button>}  
    </div>
  );
};

export default Pagination;