const express = require('express'); 
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const passport = require('passport');

require('dotenv').config(); //환경변수
const { PORT, MONGO_URI, Local, SiteUrl} = process.env;

//===============================================//
const app = express();
const http = require('http');
const server = http.createServer(app);

app.use(cookieParser(process.env.COOKIE_SECRET));

//body-parser//(express 4버전 이후로는 자동포함)
app.use(express.json()); //application/json 형태의 데이터를 해석{key:value}
app.use(express.urlencoded({extended:true})); 
// application/ x-www-form-urlencoded형태 해석.(form 기본형태, 요즘엔 자주사용되지는 않음)
// qs타입으로 url에 포함시켜 보냄. key-value&key=value...
// form에서 default로 사용되는 것.

//=> multipart/formed-data : 여러 형식을 부분적으로 나눠서 받음. 
// ex) (image/jpeg + application/ x-www-form-urlencoded)

app.use(cors({origin: [Local, SiteUrl], credentials: true}));
app.disable("x-powered-by");//프레임워크 감추기 

//*session (개발환경)//
app.use(session({  //(로그인 전): 쿠키가 없다면, 세션 객체형성. 
                   //(로그인 후): 쿠키(sid)가 있다면-> 세션객체 복원.
  secret: process.env.SECRET_CODE, //sid 암호화 
  resave: false,
  saveUninitialized: false,
  cookie:{ maxAge: null},
  store: MongoStore.create({ mongoUrl: MONGO_URI}) 
  }
 )); 

 //*session : 배포용
 /*app.use(session({
  secret: process.env.SECRET_CODE,
  proxy : true,  //nginx 
  resave: false,
  saveUninitialized: false,
  cookie:{ sameSite : 'none', // https만 허용(secure = true)  
           secure : true,  //
           maxAge: 1000 * 60 * 60 * 5},
          // maxAge: 1000 * 60 * 60, // 1000밀리세컨드 : 1초

  store: MongoStore.create({ mongoUrl: MONGO_URI})
   //
  }
 ));*/


 //*passport//
app.use(passport.initialize()); //=> req.res 비교해서, sid 설정.
//(로그인전)
//req.session이 있는지 확인, req.session.passport를 추가. 
//"res.header" -> set-cookie : { sid : 해시된 세션id } 를 보냄. 
//req.session.cookie에 sid 저장. 

//(로그인)
// 쿠키 sid가 형성됨. 
//인증유저 초기화(req.session.passport.user => user.id)저장.

//로그인 후
//req : 쿠키 sid를 확인, res : sid 다시 보내기. 

app.use(passport.session()); //==> req.session에 연결
//쿠기 sid가 있다면, 
//유저객체 복원(user.id => req.user) : deserializeUser가 실행.
//로그인 상태를 유지 (req.user사용가능)   

//=========================================//
app.use('/', require('./routes/index'));
app.use('/login',require('./routes/login'));
app.use('/user', require('./routes/user'));
app.use('/user-book', require('./routes/user_book'));
app.use('/user-like',require('./routes/user_like'));
app.use('/review',require('./routes/review'));
app.use('/comment', require('./routes/comment'));
app.use('/booksearch', require('./routes/bookSearch'));
app.use('/file', require('./routes/file'));
app.use('/auth', require('./routes/auth'));
app.use('/cart', require('./routes/cart'));
app.use('/chat', require('./routes/chat'));
app.use('/stream', require('./routes/stream_file'));
  
//debug
app.get("/debug", (req, res) => {
  res.json({
    "req.session": req.session,// 세션 데이터
    "req.user": req.user, // 유저 데이터(뒷 부분에서 설명)
    "req._passport": req._passport // 패스포트 데이터(뒷 부분에서 설명)
  })
})

//mysql(접속확인)
const getConnection = require('./mysql/dbsetting');
getConnection((conn) => {
    if(conn){
      console.log("mysql connected!");
    }else{
      console.log("Mysql ERROR : not connected");
    }
  conn.release();
});

//monogDB
mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex : true,
 // useFindAndModify: false
}).then(()=>console.log('mongoDB connected'))
  .catch(error=>console.error(error))

//*server = http(app) 
server.listen(PORT, ()=>console.log(`connected ${PORT}`));


//*웹소켓 
const io = require("socket.io")(server,{
  cors :{
    origin: [Local, SiteUrl],
    methods: ["GET", "POST"],
    transports: ['websocket'],
    credentials : true
    },
      allowEIO3: true
});

// socket 서버실행.
io.on("connection", (socket) => { 
   //var rooms= io.sockets.adapter.sids[socket.id];
   //for(var room in rooms){socket.leave(room);}
   //var rooms= io.sockets.adapter.rooms; 
   //console.log(rooms);
  
    //입장 
    socket.on("join", async ({roomName: room, userName: name})=>{
      socket.join(room);
      io.to(room).emit("onConnect", {
        name : undefined, message : `${name}이 입장하셨습니다.`}); 
    });

    //전송
    socket.on("sendMessage",({roomName: room, name, input}) => {
      io.to(room).emit("message", {name, message : input});
    });

    //퇴장
    socket.on("disconnectChat", ({roomName: room , userName: name}) => {
       socket.broadcast.to(`${room}`).emit("onDisconnect", {
        name : undefined , message : `${name} 님이 퇴장하셨습니다.`}); 
                       
    });
});



