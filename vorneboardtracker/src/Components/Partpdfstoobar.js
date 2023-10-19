import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faHouse, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsixlogo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function AddeditpartsToobar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { userdata, setuserdata } = useContext(usercontext);
  const navigate = useNavigate();

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
    localStorage.removeItem('userdata');
    navigate('/')
  }
  const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
    };
    return (
      <div className="toolbar">
        <div className="toolbar-left">
          <img src={logo} className="logo" alt="logo" />
          <p>Edit Linked PDFs</p>
        </div>
        <div className="dropdown-container">
          <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
            <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faGear} />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Dropdown menu items */}
              <p onClick={() => navigate('/')}><FontAwesomeIcon icon={faHouse}/>Home</p>
              <p onClick={()=> navigate('/Account')}><FontAwesomeIcon icon={faGear}/>Settings</p>
              <p onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/>Logout</p>
              {/* Add more menu items as needed */}
            </div>
          )}
        </div>
      </div>
    );
}


export default AddeditpartsToobar;