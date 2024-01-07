import React from 'react'; 
import {Link} from 'react-router-dom';
import 'styles/components/nav.scss'; 

function Nav() {

    return (
      <div className="navBar">
        <h2><Link to="/about" id="nav_about">About</Link></h2> 
        <h2><Link to="/">아트뉴스</Link></h2>
        <h2><Link to="/booksearch">도서검색</Link></h2>
        <h2><Link to="/reviewlist">후기게시판</Link></h2>
        <h2><Link to="/artshare">아트쉐어</Link></h2>
      </div>
    );
  }
  
  export default Nav;