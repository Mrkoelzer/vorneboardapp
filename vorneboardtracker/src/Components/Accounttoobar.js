import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faUser } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsix-brand-logo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function Accounttoobar() {
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
        localStorage.removeItem('userdata');
        navigate('/')
      }
    return (
        <div className="toolbar">
        <div className="toolbar-left">
          <img src={logo} className="App-logo-tracker" alt="logo" />
          <p>
            Account Information and Settings
          </p>
        </div>
        <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
          <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faGear} />
        </button>
        <div className="dropdown-container">
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Dropdown menu items */}
              
                <p onClick={() => navigate('/')}>Home</p>
                <p  onClick={logout}>Logout</p>
              {/* Add more menu items as needed */}
            </div>
          )}
        </div>
      </div>
    )
}

export default Accounttoobar;