import React from 'react'; 
import 'styles/app.scss'; 
import {Route,Routes, Navigate} from 'react-router-dom';
import {Header, Nav, Footer, 
        PrivateRoute, NotFound} from 'components/index';
import {Home, About, BookSearch, ArtShare, ChatRoom, //navbar 
        Login, SignUp, Mypage, MyCart, OrderList, Order_detail, //user & cart 
        ReviewList, ReviewForm, ReviewShow, ReviewEdit} from 'pages/index';

function App() {

  return (
  <div className="app">  
    
    <Header/>
    <Nav/>
   
      <div className ="contents">

        <Routes>
          //Navbar
          <Route path="/" element={<Home/>} /> 
          <Route path="/about" element={<About/>} />
          <Route path="/booksearch" element={<BookSearch/>}  />
          <Route path="/artshare" element={<ArtShare/>} />
          <Route path="/chat/:id" element={<ChatRoom/>} />
          
          ../pages/User & Cart 
          <Route path="/login" element={<Login/>} />
          <Route path="/mycart" element={<MyCart/>} />
          <Route path="/orderlist" element={<OrderList/>} />  
          <Route path="/order_detail/:id" element={<Order_detail/>} />
          <Route path="/mypage" element={<PrivateRoute component={Mypage}/>}/>
          <Route path="/signup" element={<SignUp/>} />
          
          ../pages/Review
          <Route path="/reviewlist" element={<ReviewList/>}>
           <Route path=":id" element={<ReviewShow />}/> 
          </Route>
          <Route path="/reviewform" element={<PrivateRoute component={ReviewForm}/>}/>  
          <Route path="/reviewedit/:id" element={<ReviewEdit/>}/>
          <Route path ="*" element={<NotFound/>} />
        </Routes>

      </div>  
     
      <div className="footer">

        <Footer/>

      </div>
     
   </div> 
  );
}

export default App;