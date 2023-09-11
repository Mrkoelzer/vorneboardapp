import React, {useState, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import '../Css/login.css'
import Logintoobar from '../Components/Logintoobar';

function Login() {
   const navigate = useNavigate(); 
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [authenticated, setAuthenticated] = useState(false);
   const {userdata, setuserdata} = useContext(usercontext);
 
   const handleLogin = async () => {
     try {
       const response = await fetch('http://10.144.18.208:1434/api/authenticate', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ username, password }),
       });
 
       const data = await response.json();
 
       if (data.authenticated) {
        setuserdata(data.result.recordset[0])
         setAuthenticated(true);
         setuserdata(prevUserData => ({
            ...prevUserData,
            loggedin: 1
          }));
          navigate('/')
       } else {
         setAuthenticated(false);
       }
     } catch (error) {
       console.error('Error:', error);
     }
   };


  return (
    <div className="loginpage">
      <view>
        <Logintoobar />
        <div className='login-container'>
        <h1>Login</h1>
        <p> Username:
        <input className='login-inputs'         type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
        </p>
        <p> Password:
        <input className='login-inputs'         
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
        </p>
        <button className='loginbutton' onClick={handleLogin}>
          Sign In
        </button>
        {authenticated && <p>Authenticated!</p>}
        </div>
      </view>
    </div>
  );
}

export default Login;