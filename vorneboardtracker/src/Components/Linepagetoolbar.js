import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faBars } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsix-brand-logo.png';
import { partruncontext } from '../contexts/partruncontext';
import { useNavigate } from 'react-router-dom';

function Linepagetoolbar({line}) {

    const { partruntable } = useContext(partruncontext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
      };
    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <img src={logo} className="App-logo-tracker" alt="logo" />
                <p>Vorne Board {line} Editor</p>
                <p className="icon-cell-line">
                    {partruntable[0].processStateDetailsData === 'Running' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'green' }} />
                    ) : partruntable[0].processStateDetailsData === 'Down' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'red' }} />
                    ) : partruntable[0].processStateDetailsData === 'No Production' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'blue' }} />
                    ) : partruntable[0].processStateDetailsData === 'Not Monitored' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'lightblue' }} />
                    ) : partruntable[0].processStateDetailsData === 'Detecting State' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'grey' }} />
                    ) : partruntable[0].processStateDetailsData === 'Changeover' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'yellow' }} />
                    ) : partruntable[0].processStateDetailsData === 'Break' ? (
                        <FontAwesomeIcon icon={faCircle} style={{ color: 'darkblue' }} />
                    ) : (
                        <FontAwesomeIcon icon={faCircle} />
                    )}</p>
                <p>{partruntable[0].processStateDetailsData}</p>
            </div>
            <button className={`dropdown ${isDropdownOpen ? 'active' : ''}`} onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="dropdown-container">
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        {/* Dropdown menu items */}
                        <p onClick={() => navigate('/')}>Home</p>
                        <p onClick={() => navigate('/Tracker')}>Tracker</p>
                        <p onClick={() => navigate('/Updater')}>Updater</p>
                        {/* Add more menu items as needed */}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Linepagetoolbar;