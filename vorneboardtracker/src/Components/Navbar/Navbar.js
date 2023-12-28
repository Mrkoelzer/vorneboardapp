import React, { useContext, useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './KCTreats.png'
import Dropdown from './Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser, faExclamationCircle, faGear, faHome, faMagnifyingGlassChart, faRightFromBracket, faTriangleExclamation, faUser, faWrench } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from './Toolbarcontext';
import { usercontext } from '../../contexts/usercontext';
import { errorcontext } from '../../contexts/errorcontext';
import ErrorLogPopup from './ErrorLogPopup';

function Navbar() {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { toolbarinfo, settoolbarinfo } = useContext(Toolbarcontext)
  const { userdata, setuserdata } = useContext(usercontext);
  const { errorlogstate } = useContext(errorcontext)
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [showErrorLogbutton, setShowErrorLogbutton] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

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


  const handleClosed = () => {
    setShowErrorLog(false);
  };

  const onMouseEnter = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(true);
    }
  };

  const onMouseLeave = () => {
    if (window.innerWidth < 960) {
      setDropdown(false);
    } else {
      setDropdown(false);
    }
  };

  const [isScreenBelowMaxWidth, setIsScreenBelowMaxWidth] = useState(
    window.innerWidth > 930
  );

  useEffect(() => {
    const handleResize = () => {
      setIsScreenBelowMaxWidth(window.innerWidth > 930);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (errorlogstate.length > 0) {
      setShowErrorLogbutton(true)
    }
    else {
      setShowErrorLogbutton(false)
    }
  }, [errorlogstate]);

  return (
    <>
      <nav className='navbar'>
        <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
          <img src={logo} className="logo" alt="logo" />
          {toolbarinfo[0].Title}
        </Link>
        <div className='menu-icon' onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <div className={click ? 'nav-menu active' : 'nav-menu'}>
        {showErrorLogbutton && (
          <li className='nav-error'>
              <div
                className='nav-links'
                onClick={() => {
                  closeMobileMenu();
                  setShowErrorLog(true);
                }}
                style={{ color: 'yellow' }}
              >
                <FontAwesomeIcon icon={faTriangleExclamation} /> Warnings
              </div>
          </li>
          )}
          <li className='nav-item'>
            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
              <FontAwesomeIcon icon={faHome} /> Home
            </Link>
          </li>
          <li
            className='nav-item'
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Link
              to='/Tracker'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              <i class="fa-solid fa-magnifying-glass-chart"></i> Tracker <i className='fas fa-caret-down' />
            </Link>
            {dropdown && <Dropdown />}
          </li>
          <li className='nav-item'>
            <Link
              to='/Updater'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faWrench} /> Updater
            </Link>
          </li>
          <li className='nav-item'>
            <Link
              to='/Settings'
              className='nav-links'
              onClick={closeMobileMenu}
            >
              <FontAwesomeIcon icon={faGear} /> Settings
            </Link>
          </li>
          <li>
            <>
              {userdata.loggedin === 1 ? (
                <Link to='/'>
                  <button className='nav-links-mobile' onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                </Link>
              ) : (
                <Link to='Login'>
                  <button className='nav-links-mobile' onClick={closeMobileMenu}><FontAwesomeIcon icon={faChalkboardUser} /> Login</button>
                </Link>
              )}
            </>
          </li>
        </div>
        {isScreenBelowMaxWidth && <Button />}
      </nav>
      <ErrorLogPopup
        show={showErrorLog}
        handleClose={handleClosed}
        data={errorlogstate}
      />
    </>
  );
}

export default Navbar;