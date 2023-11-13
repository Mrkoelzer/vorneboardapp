import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faHouse, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsixlogo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function Calendarviewtoolbar() {
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
        navigate('/')
      }
      return (
        <div className="toolbar">
          <div className="toolbar-left">
            <img src={logo} className="logo" alt="logo" />
            <p>Calendar View</p>
          </div>
          <div className="dropdown-container">
            <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
              <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faGear} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {/* Dropdown menu items */}
                <p onClick={() => navigate('/')}><FontAwesomeIcon icon={faHouse}/>Home</p>
                <p onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/>Logout</p>
                {/* Add more menu items as needed */}
              </div>
            )}
          </div>
        </div>
      );
      
}

export default Calendarviewtoolbar;