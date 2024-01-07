import React, { useEffect, useState, useRef} from "react";
import { useParams, useNavigate} from 'react-router-dom';
import {Login_info} from 'utils/isLogin'; 
import {usePrompt} from 'utils/block'; 
import axios from "axios";
import io from "socket.io-client";
//img
import chat_icon from 'assets/images/chat.png';
import smile from 'assets/images/smile.png';

function Chat(){
 const navigate = useNavigate(); 
 const URL = process.env.REACT_APP_SERVER_URL;
 const params = useParams(); 
 const scrollRef = useRef();

 //채팅방 
 
 const name = Login_info();
 const isbn = params.id;   

 const [item, setData] = useState(null); //책정보 
 const [chat, setChat] = useState([]);
 const [message, setInput] = useState([]);
 const [users, setUser] = useState([]); 

 console.log(message);

 useEffect(async () => { 
  const response = await axios.post(`${URL}/booksearch`,{isbn : isbn});
  const res = JSON.parse(response.data);
  const data = res.rss.channel.item
  setData(data);

  const socket = io.connect(URL, {withCredentials: true}); 
  socket.emit('join',{
    roomName: isbn, 
    title : data.title._text,
    userName: name
  });

  socket.on('onConnect', (text)=>{
   console.log(text);
   setChat([...chat, {name: null , message : text}]);
   socket.disconnect();
  }); 

  socket.on('message', ({name,message})=>{
    setChat([...chat,{name,message}]);
    socket.disconnect();
  });

  socket.on('clients', (clients)=>{
    setUser([...users, clients]);
    socket.disconnect();
  })
  socket.on('onDisconnect', (text)=>{
    setChat([...chat, {name: null , message : text}]);
    socket.disconnect();
  });

},[]);


 //스크롤내리기
 useEffect(() => {
  //if (chat !== []) { 
    scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
 // }
 }, [chat])


 
 function MessageSend(e){
   
   if(message !== ""){
    const socket = io.connect(URL, {withCredentials: true}); 
      socket.emit('sendMessage',{roomName: isbn, name, message});
      socket.on('message',({name,message})=>{
        setChat([...chat,{name,message}]);
        socket.disconnect();
      })

    //e.preventDefault()
    //setInput(message : ""); 
    //$('message').val("");
    // ref 활용 .focus() 

   }

 }

 const input=(e)=>{
  setInput(e.target.value); 
 }; 

 const onKeyPress = (e)=>{
    if(e.key == 'Enter'){
     MessageSend(e); 
    }
  };

  //Prompt
  usePrompt('채팅방을 떠나시겠습니까?', true, {roomName: isbn, userName: name});
 
  return (
      <div>

          <div>
            <span>진행중인 채팅방</span>
          </div>
            
          <div>
            <table style={{background: 'beige'}}>
              <tr>
                <td><b>함께 읽는 책:</b></td>
                <td colSpan='2' dangerouslySetInnerHTML={{__html: item?.title._text}}/>
              </tr>
              
              <tr>            
                <td width="20%"><img src ={item?.image._text}/></td>
                <td>
                  <tr>
                    <td>저자</td><td dangerouslySetInnerHTML={{__html: item?.author._text}}/>
                  </tr>
                  <tr>
                    출판사:<td dangerouslySetInnerHTML={{__html: item?.publisher._text}}/>
                  </tr>
                </td>
                <td> 
                  <img src ={chat_icon} width ="30"/>채팅참가자<br/>
                    {users.map((user, index)=>(
                      <div key={index}>
                        <img src ={smile} width ="30"/>
                        <span>{user}</span><br/>
                      </div>))
                     } 
                </td>

              </tr>
            </table>
          </div>
      
          <div ref={scrollRef} style={{overflow : "scroll", height :"200px"}}>
              {chat.map(({name, message}, index)=>(
                <div key={index} >
                  {name === null ? 

                    (<p>
                      <img src ={smile} width ="30"/>
                      <span style={{background: 'beige'}}><b>{message}</b></span>
                    </p>) 
                      
                    :(<p><b> {name}</b> <span>{message}</span></p>)
                  }
                </div>)) 
             } 
          </div>

          <div style={{background: 'pink'}}>
            <span style={{margin: '5px'}}>{name}님 : </span>
            <input onChange={input} value={message} 
                      size ="40" onKeyPress={onKeyPress} autoFocus/>
            <button onClick={MessageSend}>입력</button>
            <button onClick={()=>navigate('/')}>나가기</button>
          </div>
        

      </div>
     
    );
}

export default Chat;