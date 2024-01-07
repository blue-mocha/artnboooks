import React , {useEffect, useState, useRef} from 'react'; 
import axios from "axios";
import smile from 'assets/images/smile.png';
import chat_icon from 'assets/images/chat.png';

function ChatBox({socket, name, isbn}) {
  const URL = process.env.REACT_APP_SERVER_URL;

  const [input, setInput] = useState(""); 
  const [chats, setChats] = useState([]); //채팅내용 
  const [users, setUsers] = useState([]); //접속유저
  const [receive, setMsg] = useState( // 받은메세지 
  { name : undefined,
    message : '환영합니다!'
  });

   //대화내용 업데이트
   useEffect(() =>{setChats([...chats, receive]); },[receive]);
     
   useEffect(() => {

      //메세지 받기  
      socket.on('message', ({name, message})=>{
        setMsg({name, message});
      });
            
      //유저 접속시 
      socket.on('onConnect', async({name, message})=>{
        const response = await axios.get(`${URL}/chat/users/${isbn}`);
          setUsers(response.data); 
          setMsg({name, message});   
      
       }); 

      //유저 퇴장 
      socket.on('onDisconnect', async({name, message})=>{
        const response = await axios.get(`${URL}/chat/users/${isbn}`);
          setUsers(response.data); 
          setMsg({name, message});
      });

    },[]); 

  //메세지 보내기 
    function MessageSend(){
      if(input !== ""){
      socket.emit('sendMessage',{roomName: isbn, name, input});
      setInput("");
      } 
    }
  
  //입력 & 엔터 
    const onChange=(e)=>{ setInput(e.target.value);}; 

    const onKeyPress = (e)=>{
        if(e.key == 'Enter'){
        MessageSend(e); 
        }
    };


  //스크롤 조절 
    const scrollRef = useRef(null);

    useEffect(() => { 
      scrollRef.current?.scrollIntoView({behavior : "smooth"}); 
    },[chats]);


    return (
      <div>

          <div style={{background : 'white' , width: "100%"}}>
             <img src ={chat_icon} width ="30"/>참여유저 : 
                 {users.map((user, index)=>(
                      <span key={index}> ▶{user}</span>
                 ))} 
          </div>

          <div style={{overflowY : "scroll", overflowX: "hidden", height :"200px"}}>
              {chats.map((chat, index)=>(
                <div key={index} >
                  {chats !== [] && chat.name === undefined ? 

                    (<p ref={scrollRef}>
                      <img src ={smile} width ="30"/>
                      <span style={{background: 'beige'}}><b>{chat.message}</b></span>
                    </p>) 
                      
                    :(<p ref={scrollRef}><b>{chat.name}</b> <span>{chat.message}</span></p>)
                  }
                </div>)) 
             } 
          </div>

          <div style={{background: 'pink'}}>
            <span style={{margin: '5px'}}>{name}님 : </span>
            <input onChange={onChange} value={input} 
                      size ="40" onKeyDown={onKeyPress} autoFocus/>
            <button onClick={MessageSend}>입력</button>
          </div>

      </div>
    );
  }
  
  export default ChatBox;

