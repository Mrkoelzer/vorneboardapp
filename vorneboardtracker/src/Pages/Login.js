import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import '../Css/login.css'
import Logintoobar from '../Components/Logintoobar';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faRightToBracket, faArrowLeft} from '@fortawesome/free-solid-svg-icons';


function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState('');
  const { userdata, setuserdata } = useContext(usercontext);
  const { localipaddr } = useContext(ipaddrcontext);


  const hangleNavigate = (pass, pin) => {
    if (pass === 1 || pin === 1) {
      navigate('/changepasswordpin')
    }
    else {
      navigate('/')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.authenticated) {
        console.log(data.result.recordset[0])
        setuserdata(data.result.recordset[0])
        setAuthenticated("Authenticated");
        sessionStorage.setItem('userdata', JSON.stringify({
          ...data.result.recordset[0],
          loggedin: 1,
        }));
        setuserdata(prevUserData => ({
          ...prevUserData,
          loggedin: 1
        }));
        hangleNavigate(data.result.recordset[0].passwordchange, data.result.recordset[0].pinchage)
      } else {
        setAuthenticated("Wrong Password or Username");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  return (
    <div className="loginpage">
      <Logintoobar />
      <div className='login-container'>
        <h1>Login</h1>
        <p>Username:</p>
        <input
          className='login-inputs'
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <p>Password:</p>
        <input
          className='login-inputs'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin(e);
            }
          }}
        />
        <br />
        <div style={{ display: 'flex', alignSelf: 'center' }}>
          <button className="loginbutton" onClick={(e) => handleLogin(e)}>
            <div className="loginicon-wrapper">
              <FontAwesomeIcon icon={faRightToBracket} className="loginicon" />
            </div>
            <div className="logintext">Sign In</div>
          </button>
          <button className="loginbutton" onClick={() => navigate('/')}>
            <div className="loginicon-wrapper">
              <FontAwesomeIcon icon={faArrowLeft} className="loginicon" />
            </div>
            <div className="logintext">Go Back</div>
          </button>
        </div>
        <br />
        {authenticated}
      </div>
    </div>
  );
}

export default Login;