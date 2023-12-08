import React, { useContext, useState } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from './KCTreats.png'
import Dropdown from './Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser, faExclamationCircle, faGear, faHome, faMagnifyingGlassChart, faRightFromBracket, faUser, faWrench } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from './Toolbarcontext';
import { usercontext } from '../../contexts/usercontext';

function Navbar() {
  const [click, setClick] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { toolbarinfo, settoolbarinfo } = useContext(Toolbarcontext)
  const { userdata, setuserdata } = useContext(usercontext);

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
        <Button />
      </nav>
    </>
  );
}

export default Navbar;