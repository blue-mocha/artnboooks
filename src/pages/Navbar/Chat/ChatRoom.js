import React, { useEffect, useState} from "react";
import {useParams, useNavigate} from 'react-router-dom';
import {Login_info} from 'utils/isLogin'; 
import {usePrompt} from 'utils/block'; 
import axios from "axios";
import io from "socket.io-client";
import ChatBox from 'pages/Navbar/Chat/ChatBox'

function ChatRoom(){
 const navigate = useNavigate(); 
 const URL = process.env.REACT_APP_SERVER_URL;

 const params = useParams(); 
 const name = Login_info();
 const isbn = params.id; //채팅방 

 const [item, setData] = useState(null); //책정보 


 //소켓연결
 const socket = io.connect(process.env.REACT_APP_SERVER_URL, { withCredentials: true });

 useEffect(async () => { 

  const response = await axios.post(`${URL}/booksearch/1`,
  {params : [{isbn : isbn}] });
  setData(response.data.items[0]);

   //MONGO_DB : 채팅방 생성(1)
   const chatRoom = await axios.post(`${URL}/chat`,
   {roomName : isbn, users : name }); 
     if(chatRoom.status == 200){
        
        socket.emit('join',{ //웹소켓연결(2)
          roomName: isbn, 
          userName: name 
        }); 
     }
   
 },[]);

  //Prompt
  usePrompt('채팅방을 떠나시겠습니까?', true, {roomName: isbn, users: name});
 
  return (
      <div>

          <div>
            <span>진행중인 채팅방</span>
          </div>
            
          <div>
            <table style={{background: 'beige'}}>
              <tr>
                <td><b>함께 읽는 책:</b></td>
                <td colSpan='2'><span style={{float : "left"}}>{item?.title._text}</span></td>
              </tr>
              
              <tr>            
                <td width="20%"><img src ={item?.image._text} style={{width:'40%'}}/></td>
                <td>   
                    <tr>
                      <td>저자 : </td><span>{item?.author._text}</span>
                    </tr>
                    <tr>
                       <td>출판사 : </td><span>{item?.publisher._text}</span>
                    </tr>
                </td>
               
              </tr>
            </table>
          </div>

          <ChatBox socket={socket} name={name} isbn={isbn}/>
      
          <button onClick={()=>navigate('/')}>나가기</button>
          
      </div>
     
    );
}

export default ChatRoom;