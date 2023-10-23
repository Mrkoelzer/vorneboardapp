import React, { useContext, useEffect } from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/App.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext'

function Updater() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(usercontext);
  useEffect(() => {
    const userDataFromLocalStorage = localStorage.getItem('userdata');
    let parsedUserData;
    if (userDataFromLocalStorage) {
        parsedUserData = JSON.parse(userDataFromLocalStorage);
        setuserdata(parsedUserData);
    }
    if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
        if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
            navigate('/Changepasswordpin');
        }
    } else {
        navigate('/');
    }
}, [setuserdata, navigate]);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Vorne Board Updater
        </p>
      </header>
    </div>
  );
}

export default Updater;
