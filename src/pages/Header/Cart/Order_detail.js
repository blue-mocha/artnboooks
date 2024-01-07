import React, {useState, useEffect} from 'react'; 
import {useNavigate, useParams} from 'react-router-dom'; 
import {isLogin} from 'utils/isLogin'; 
import axios from "axios";

function Order_detail(){
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;
  const { id } = useParams();

  const [info, setInfo] = useState([]);
  const [items, setItems] = useState([]);
  const [amount, setNum] = useState([]);
  
  console.log(amount)

  useEffect(async()=>{

    if(isLogin()){
      const response = await axios.get(`${URL}/cart/order_detail/${id}`, 
      {withCredentials: true });   
      if(response.data){
      setInfo(response.data.info[0]);
      setItems(response.data.items);

      const i_amount = JSON.parse(response.data.items[0].amount);
      console.log(i_amount)
      setNum(i_amount)
      }
    }

   },[]);

  //금액(형식)
  function priceToString(num){
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } //yourDate.split("T")[0] 

    return (
      <div style={{padding : '10px'}}>
       <h3>▶주문상세</h3>

       <h4>결제 상세정보</h4>
       <table border="1">
         <tr>
         배송지 : {info.addr}<br/>
         주문상태 : <b>{info.orderState}</b><hr/>

         주문일자 : {(info.orderDate)?.split("T")[0]}<br/>
         결제일자 : {(info.orderOTM)?.split(".")[0]}<br/>
         배송비 :   {priceToString(info.deliveryCost)}원<br/>
         합계금액 : {priceToString(info.total_price)}원<hr/>

         사용포인트 : {info.usePoint}<br/>
         적립포인트 : {info.newPoint}<br/>

         </tr>
       </table>
       
       <h4>주문상품({items.length})</h4>
       <table border="1">
         <tr>
         <td></td>
         <td>상품명</td>
         <td>개수</td>
         <td>가격</td>
         </tr>
         {items.length > 0 && items.map((item, index)=>(
         <tr key={index}>
          <td><img src={`${item.img_url}?w=100&h100&q=100`}/></td>
          <td>{item.prod_name}</td>
          <td>{amount[index]}</td>
          <td>{priceToString(amount[index]* item.unit_price)}원</td>
         </tr>
         ))}
       
       </table>


    </div>

    );
  }
  
  export default Order_detail;