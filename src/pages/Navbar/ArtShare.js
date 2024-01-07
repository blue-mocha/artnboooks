import React, {useState, useEffect} from 'react'; 
import {useNavigate} from 'react-router-dom'; 
import {isLogin} from 'utils/isLogin'; 
import axios from "axios";
import 'styles/pages/artshare.scss'; 

function ArtShare() {
  const navigate = useNavigate();
  const URL = process.env.REACT_APP_SERVER_URL;


  //상품리스트
  const [artClass, setClass]= useState([]); //클래스
  const [artItems, setItems]= useState([]); //아이템 
  
  //웹스토리지(cart)
  const [Cart, setCart]= useState([]); 
  const [updated, setUp]= useState(false); //장바구니 추가 후 확인메세지.

  useEffect(async () => { 

    const response = await axios.get(`${URL}/cart/product`);
    const data = response.data; 
    setClass(data.filter(i  => i.type === 'C'));
    setItems(data.filter(i  => i.type === 'P'));

    if(sessionStorage.getItem('mycart') !== null){ //웹스토리지 cart.
      setCart(JSON.parse(sessionStorage.getItem('mycart')));
    }
  }, []);

  //세션목록에 추가(logout)
  function addCart(item){ 
   item.amount = 1; 
   setCart(Cart.concat(item)); 
   setUp(true); 
  }

  //장바구니 목록추가(서버)
  async function add_Cart(item){
   const response = await axios.post(`${URL}/cart/add-cart`, 
   {prod_id : item.prod_id, amount : 1},{ withCredentials: true });
    if(response.data == '성공'){
      if(window.confirm('장바구니를 확인하시겠습니까?')){
        navigate('/mycart');
      }
    }else{
      alert('이미 선택된 상품입니다.')
    }
   }
    

  //목록추가 후 >> 확인메세지 
  useEffect(()=>{
    if(updated){ //updated : true.
      if(window.confirm('장바구니를 확인하시겠습니까?')){
        sessionStorage.setItem('mycart', JSON.stringify(Cart));
        navigate('/mycart');
      }
        else{
          sessionStorage.setItem('mycart', JSON.stringify(Cart));
        }
    }    
  }, [Cart]); 

  function priceToString(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');}
  
    return (
      <div className="artShare_container">

        <div className="artShare_box">

          <h3><u>▼아트클래스</u></h3>
            
             <p/>
            
            {artClass.map((item, index)=>(
              <div id ="artShare_contents" key={index}>
                <p><u><b>{item.prod_name}</b></u></p>
                                   
                {<video crossorigin="anonymous" src={`${URL}/stream/video/${item.vid_file}`} width="100%" 
                 type ="video/mp4" height="auto" autoplay= "autoplay" muted="muted"  loop="loop"/>
                }

                <p>강사 : <b>{item.desc}</b></p> 
                <p>{priceToString(item.unit_price)}원</p>  
                
                <button onClick={()=>{
                
                  if(isLogin()){

                    add_Cart(item);

                  }else{

                    if(Cart.some(c =>{return c.prod_id === item.prod_id})){
                      alert('이미 선택된 항목입니다');
  
                      if(window.confirm('장바구니를 확인하시겠습니까?')){
                        navigate('/mycart');
                        }
                        
                      }else{
                        addCart(item);
                      }
  
                  }
                        
                }}>장바구니에 담기</button>
   
             </div>
             )) 
           }

        </div>
         <p></p>
        <div className="artShare_box">

              <h3><u>▼아트쇼핑</u></h3>

               {artItems.map((item, index)=>(
                <div id ="artShare_contents" key={index}>
                  <img src={`${item.img_url}?w=200&h200&q=100`} width="200"/>
                  <p><u><b>{item.prod_name}</b></u></p> 
                  <p>{priceToString(item.unit_price)}원</p> 

                  <button onClick={()=>{

                  if(isLogin()){

                     add_Cart(item);

                  }else{

                    if(Cart.some(c =>{return c.prod_id === item.prod_id})){
                      alert('이미 선택된 항목입니다');
                      if(window.confirm('장바구니를 확인하시겠습니까?')){
                        navigate('/mycart');
                      }
                      }else{
                        addCart(item);
                      }
                  }
                        
                  }}>장바구니에 담기</button>


            </div>
            )) 
          }



        </div>
            
        
       

      </div>
    );
  }
  
  export default ArtShare;