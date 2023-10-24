import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser, faGear, faGears, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsixlogo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function Mainpagetoolbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { userdata, setuserdata } = useContext(usercontext);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <img src={logo} className="logo" alt="logo" />
        <p>Vorne Main Page</p>
      </div>
      <div className="dropdown-container">
        <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
          <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faChalkboardUser} />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {/* Dropdown menu items */}
            {userdata.loggedin === 1 ? (
              <>
                <p onClick={() => navigate('/Account')}> <FontAwesomeIcon icon={faGear}/> Settings</p>
                <p onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/> Logout</p>
              </>
            ) : (
              <p onClick={() => navigate('/Login')}><FontAwesomeIcon icon={faChalkboardUser}/> Login</p>
            )}
            {/* Add more menu items as needed */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Mainpagetoolbar;