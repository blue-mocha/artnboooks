import React, {useState, useEffect} from 'react'; 
import {useNavigate} from 'react-router-dom'; 
import axios from "axios";

function OrderList() {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;
  const [Order, setOrder] = useState([]);

  useEffect(async()=>{

    //if(isLogin()){ 
      const response = await axios.get(`${URL}/cart/orderlist`, 
      { withCredentials: true });   
      setOrder(response.data);
      console.log(response.data);
    //}

   },[]);

   //주문취소
   async function cancel_order(e){
 
    if(window.confirm('주문을 취소하시겠습니까?')){
      const id = e.target.value;
      const response = await axios.post(`${URL}/cart/cancel-order/${id}`, 
          { withCredentials: true });
          console.log(response)
       if(response.data == '성공'){
        alert("주문이 최소되었습니다."); 
        navigate(0);
       }
       console.log(response); 
    }
   }

   //목록삭제 
   async function del_order(e){
 
    if(window.confirm('목록을 삭제하시겠습니까?')){
      const id = e.target.value;
      const response = await axios.get(`${URL}/cart/del-orderlist/${id}`, 
          { withCredentials: true });
          console.log(response)
       if(response.data == '성공'){
        alert("목록이 삭제되었습니다."); 
        navigate(0);
       }
       console.log(response); 
    }
   }


    //금액(형식)
    function priceToString(num){
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
       

    return (
      <div style={{padding : '10px'}}>
       <h3>▶주문내역 ({Order.length})</h3>

        {Order.length > 0 && Order.map((item, index)=>(
         
          <div style={{border: '1px solid black', width : '72%', margin : '5px'}} key={index}>
            <table>
              <tr><b>{item.orderState}</b></tr>
              <p/>
              <tr>
                <td width="45%"><img src={`${item.img_url}?w=100&h=100&q=100`}/></td>
                <td>
                  <b>(상품){item.prod_name}{item.num > 1 ? (` 외 (${item.num -1}개 상품)`) : null}</b><br/>
                  <hr/>
                  <b>주문날짜 :</b> {(item.orderDate).split('T')[0]}<br/>
                  {item.deliveryCost > 0 ? (<tr><b>배송비</b> : {priceToString(item.deliveryCost)}원</tr>): null}
                  <b>총 금액 :</b> {priceToString(item.total_price)}원 <br/>
                  <hr/>
                  <button onClick={()=>navigate(`/order_detail/${item.order_id}`)}>상세보기</button>
                  {item.orderState !== '주문취소' &&
                  <button onClick={cancel_order} value={item.order_id}>주문취소</button>
                  }
                  <button onClick={del_order} value={item.order_id}>목록삭제</button>
                  <p/>
                </td>
              </tr>
            </table>
          </div>
        ))

        }
        {Order.length == 0 && 
          <p style={{color: "#545351",padding : "10px"}}>
          주문내역이 없습니다.</p>
        }
    </div>

    );
  }
  
  export default OrderList;