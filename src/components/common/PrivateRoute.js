import React from 'react';
import  {useLocation} from 'react-router-dom';
import {isLogin} from 'utils/isLogin'; 
import Login from 'pages/Header/Login'; 

function PrivateRoute({component : Component}) {
    const location = useLocation(); 

     return isLogin()? <Component/> : <Login state={{ from: location.pathname }}/>;
  }

export default PrivateRoute;