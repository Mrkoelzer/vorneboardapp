import React, {useState} from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/App.css';
import {useNavigate} from 'react-router-dom';
import '../Css/toolbar.css';
import '../Css/editline.css';
import '../Css/account.css';

function Line5() {
   const navigate = useNavigate(); 
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [authenticated, setAuthenticated] = useState(false);
 
   const handleLogin = async () => {
     try {
       const response = await fetch('http://10.144.18.208:143/api/authenticate', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ username, password }),
       });
 
       const data = await response.json();
 
       if (data.authenticated) {
         setAuthenticated(true);
       } else {
         setAuthenticated(false);
       }
     } catch (error) {
       console.error('Error:', error);
     }
   };


  return (
    <div className="linepage">
      <view>
        <div className="toolbar">
          <div className="toolbar-left">
            <img src={logo} className="App-logo-tracker" alt="logo" />
            <p>Vorne Board Account</p>
          </div>
        </div>
        <div className='account-container'>
        <h1>Login</h1>
        <p> Username:
        <input className='account-inputs'         type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
        </p>
        <p> Password:
        <input className='account-inputs'         
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
        </p>
        <button className='accountbutton' onClick={handleLogin}>
          Sign In
        </button>
        {authenticated && <p>Authenticated!</p>}
        </div>
      </view>
    </div>
  );
}

export default Line5;
