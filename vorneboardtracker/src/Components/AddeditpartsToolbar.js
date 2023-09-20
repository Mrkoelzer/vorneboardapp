import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faUser } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsix-brand-logo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function AddeditpartsToobar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { userdata } = useContext(usercontext);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
      };
    return (
        <div className="toolbar">
        <div className="toolbar-left">
          <img src={logo} className="App-logo-tracker" alt="logo" />
          <p>
            Edit Part Numbers
          </p>
        </div>
        <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
          <FontAwesomeIcon icon={userdata.loggedin === 1 ? faUser : faGear} />
        </button>
        <div className="dropdown-container">
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Dropdown menu items */}
              {userdata.loggedin === 1 ? (
                <>
                <p onClick={() => navigate('/')}>Home</p>
                <p onClick={() => navigate('/Account')}>Account</p>
                </>
              ) : (
                <p onClick={() => navigate('/Login')}>Login</p>
              )}
              {/* Add more menu items as needed */}
            </div>
          )}
        </div>
      </div>
    )
}

export default AddeditpartsToobar;