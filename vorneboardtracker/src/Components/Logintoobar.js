import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsix-brand-logo.png';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function Logintoobar() {
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
            Vorne Board Login
          </p>
        </div>
        <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
          <FontAwesomeIcon icon={faGear} />
        </button>
        <div className="dropdown-container">
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {/* Dropdown menu items */}
                <p onClick={() => navigate('/')}>Home</p>
              {/* Add more menu items as needed */}
            </div>
          )}
        </div>
      </div>
    )
}

export default Logintoobar;