import React, {useState, useEffect} from 'react'; 
import {useNavigate, useLocation} from 'react-router-dom'; 
import {isLogin} from 'utils/isLogin'; 
import axios from "axios";
import 'styles/pages/mycart.scss'; 
let currentPath ="";

function MyCart(){
    let location = useLocation();
    const navigate = useNavigate();
    const URL = process.env.REACT_APP_SERVER_URL;

    const [Cart, setCart]= useState([]); 
    const [total, setTotal] = useState(0); //전체금액 
    const [allSelected, setSelected]= useState(false);  

    console.log(Cart);

    useEffect(async() => {

     const storage_cart = JSON.parse(sessionStorage.getItem('mycart')); //웹스토리지

        if(isLogin()){
          if(storage_cart === null){
            const response = await axios.get(`${URL}/cart/cartlist`,{ withCredentials: true });
            setCart(response.data);  

           }else{//웹스토리 목록-> 서버로 추가. 
            const items = [];
            await storage_cart.map((i)=>{return items.push({prod_id : i.prod_id, amount : i.amount})});
              const response = await axios.post(`${URL}/cart/update-cart`,
                items, { withCredentials: true });
              if(response.data === '성공'){
                sessionStorage.removeItem('mycart');
                navigate(0);
              }
           }
          }else{
            if(storage_cart){
              setCart(storage_cart);
            }
          }
   },[]); 

   useEffect(()=>{
     if(currentPath === location.pathname){navigate(0)}; // -> current : 0
      currentPath = location.pathname; //-> 풀린거 다시 잡아주기. 
   },[location])//첫진입. 

   //주문하기 
   async function send_order(){

    if(isLogin()){
      const checked = Cart.filter(i => i.checked === true);
      let items = [];
      checked.map(i => items.push({prod_id : i.prod_id, amount : i.amount}));
      const delivery_cost = Cart.some(i=>{return i.type === "P" && i.checked == true})? 3000 : 0; 
    
      const order = {
        items : items,
        info : {
            addr : "경기도",
            delivery_cost : delivery_cost,
            total_price : total, 
            pay_amount: total + delivery_cost, //결제금액 
            orderOTM : new Date().toISOString().slice(0, 19).replace('T', ' '), //datetime(mysql) 
            usePoint : 0,
            newPoint : total * 0.01,
            orderState : '주문결제'
          }
        }

        if(window.confirm(`[테스트용]상품을 결제하시겠습니까?`)){
          const response = await axios.post(`${URL}/cart/add-order`,
           order, { withCredentials: true });
           const order_id = response.data.order_id;
           if(order_id ){ 
            navigate(`/order_detail/${order_id }`);
           }else{
            alert('주문실패');
           }
           
        }
    }else{
      alert('로그인이 필요한 서비스입니다.');
    }
   }

  //전체금액 
  useEffect(()=>{total_price()},[Cart]); 

  function total_price(){
      if(Cart.length > 0){
        var sum = 0;   
        for(var i= 0; i < Cart.length; i++){
          if(Cart[i].checked === true){
            sum += Cart[i].unit_price* Cart[i].amount;
            }
           }
         setTotal(sum);
        }  
   };

   //개별선택
    function selected(e){
      
      const idx = e.target.value; //index
      if(Cart[idx].checked === false || !Cart[idx].checked){
        Cart[idx].checked = true; 
      }else if(Cart[idx].checked === true){
        Cart[idx].checked = false; 
      } 
       //navigate('/mycart');
       total_price(); 
    }

  //전체선택
   useEffect(()=>{
    if(Cart.length > 0){
      const newArr = Cart.map((cart) => {
        if(allSelected === true){
          return {...cart, "checked" : true}; //속성추가 
        }else if(allSelected === false){
          return{...cart, "checked" : false};
        } return cart ; 
      })
      setCart(newArr);
    }
  },[allSelected]);


 //금액(형식)
   function priceToString(num){
     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   }
      
    
   //수량추가
   async function onIncrese(e){
     const idx = e.target.id; 

      if(isLogin() && Cart[idx].amount < 10){
       const response = await axios.get(`${URL}/cart/num/incre/${Cart[idx].prod_id}`,
        { withCredentials: true });
        if(response.data === '수정완료'){
           navigate(0);
         }
      }else{

        if(Cart[idx].amount < 10){
           Cart[idx].amount = Number(e.target.value) + 1;
           sessionStorage.setItem('mycart', JSON.stringify(Cart));
           navigate('/mycart');
        }
      }
    };

  //수량감소 
  async function onDecrese(e){
    const idx = e.target.id; 

    if(isLogin() && Cart[idx].amount < 10){
      const response = await axios.get(`${URL}/cart/num/decre/${Cart[idx].prod_id}`,
        { withCredentials: true });
       if(response.data === '수정완료'){
          navigate(0);
       }

     }else{
        if(Cart[idx].amount > 0){
          Cart[idx].amount = Number(e.target.value) - 1;
          sessionStorage.setItem('mycart', JSON.stringify(Cart));
          navigate('/mycart');
        }
      }
   };

  
   //삭제하기 
   async function delete_item(){

     if(isLogin()){//로그인 
      const checked = Cart.filter(i => i.checked === true);
      let items = [];//선택목록 
      checked.map(i => items.push({prod_id : i.prod_id, amount : i.amount}));
    
      const response = await axios.post(`${URL}/cart/del-cartlist`,
           items ,{ withCredentials: true });
       if(response.data === "성공"){
         navigate(0);
       }
           
      }else{//비로그인.
       const items = Cart.filter(i => i.checked === false || !i.checked);
        sessionStorage.setItem('mycart', JSON.stringify(items));
        setCart(items);
      }
    };


    return (
    <div>
      <h3><b> 장바구니 </b>
      { isLogin() ?
        (<button onClick={()=>navigate(`/orderlist`)}>주문내역</button>)
        :
        (<button onClick={()=>navigate(`/orderlist`)}>주문내역</button>)
      }
 
      </h3>
     
      <input name="checked" type="checkbox" 
      onClick={()=> {!allSelected?  setSelected(true) : setSelected(false)}} />전체선택
      <hr/>

     <table>
        {Cart.length > 0 && Cart.map((item, index)=>(

          <tr key={index}>
            <td><input name="checked" type="checkbox" onClick={selected} value={index} checked={item?.checked? true : false}></input></td>
            <td><img src={`${item.img_url}?w=50&h=50`} width="50"/></td> 
            <td>{item.prod_name}</td> 
            <td>{priceToString(item.unit_price)}원</td>
            <td>

            {item.type == 'P' &&  
              <div >
                <button onClick={onIncrese} value={item.amount} id={index}>+</button>
                <span style={{margin : '0px 5px'}}>{item.amount}</span>
                <button onClick={onDecrese} value={item.amount} id={index}>-</button>
              </div>}
            </td>
          </tr>
        ))
        }
        {Cart.length == 0 && 
          <p style={{color: "#545351",padding : "10px"}}>
          장바구니가 비었습니다.</p>
        }
     </table>

     <hr/>

      <table>
        <tr>상품금액 :  <span style={{color: "#0f03fc"}}>{priceToString(total)}</span>원</tr>
      
        {total > 0 && 
        Cart.some(i=>{return i.type === "P" && i.checked == true})?

        (<div>
        <tr> 배송비 : {priceToString(3000)}원</tr>
        <tr>총 합계 : <span style={{color: "red"}}><b> {priceToString(total+3000)}</b></span>원</tr>
        </div>)
        : 

        (<tr>총 합계 : <span style={{color: "red"}}><b> {priceToString(total)}</b></span></tr>)

        }
      </table>
        
     <button onClick={send_order}>
        주문하기</button>
     <button onClick={delete_item}>삭제하기</button>

     </div>
     
    );
  }
  export default MyCart;