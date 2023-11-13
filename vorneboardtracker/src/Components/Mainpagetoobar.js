import React, { useContext, useEffect, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser, faExclamationCircle, faGear, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import logo from '../IMAGES/jsixlogo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
//import { errorlogcontext } from '../contexts/errorlogcontext';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { errorcontext } from '../contexts/errorcontext';

function Mainpagetoolbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isErrorDropdownOpen, setIsErrorDropdownOpen] = useState(false);
  const [errormessage, setErrormessage] = useState('');
  const { userdata, setuserdata } = useContext(usercontext);
  //const { errorlog } = useContext(errorlogcontext);
  const { localipaddr } = useContext(ipaddrcontext);
  const { errorlogstate } = useContext(errorcontext)
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleErrorDropdown = () => {
    setIsErrorDropdownOpen(!isErrorDropdownOpen);
  };


  const logout = () => {
    setuserdata({
      userid: 0,
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      pin: '',
      email: '',
      admin: false,
      superadmin: false,
      guest: false,
      passwordchange: false,
      pinchange: false,
      loggedin: 0
    })
    sessionStorage.removeItem('userdata');
  }

  const geterrornotif = () => {
    for (let i = 0; i < errorlogstate.length; i++) {
      NotificationManager.error(errorlogstate[i].error_message)
    }
  }

  return (
    <div className="toolbar">
      <NotificationContainer />
      <div className="toolbar-left">
        <img src={logo} className="logo" alt="logo" />
        <p>Vorne Main Page</p>
      </div>
      {errorlogstate.length !== 0 && (
        <button className='dropdown-error' onClick={geterrornotif}>
          <FontAwesomeIcon icon={faExclamationCircle} />
        </button>
      )}
      <div className="dropdown-container">
        <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
          <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faChalkboardUser} />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {userdata.loggedin === 1 ? (
              <>
                <p onClick={() => navigate('/Account')}>
                  <FontAwesomeIcon icon={faGear} /> Settings
                </p>
                <p onClick={logout}>
                  <FontAwesomeIcon icon={faRightFromBracket} /> Logout
                </p>
              </>
            ) : (
              <p onClick={() => navigate('/Login')}>
                <FontAwesomeIcon icon={faChalkboardUser} /> Login
              </p>
            )}
          </div>
        )}
        {isErrorDropdownOpen && (
          <div className="errordropdown-menu">
            {errormessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Mainpagetoolbar;