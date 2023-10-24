import React, { useContext, useState } from 'react';
import '../Css/toolbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faGear, faHouse, faRightFromBracket, faUser, faChalkboardUser, faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons'
import logo from '../IMAGES/jsixlogo.png';
import { partruncontext } from '../contexts/partruncontext';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';

function Liveviewtoolbar({line}) {
    const { userdata, setuserdata } = useContext(usercontext);
    const { partruntable } = useContext(partruncontext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
                <p>Live Camera Views</p>
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
              <p onClick={() => navigate('/')}><FontAwesomeIcon icon={faHouse}/> Home</p>
              <p onClick={() => navigate('/Tracker')}> <FontAwesomeIcon icon={faMagnifyingGlassChart}/> Tracker</p>
              <p onClick={() => navigate('/Account')}> <FontAwesomeIcon icon={faGear}/> Settings</p>
              <p onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/> Logout</p>
              </>
            ) : (
              <>
              <p onClick={() => navigate('/')}><FontAwesomeIcon icon={faHouse}/> Home</p>
              <p onClick={() => navigate('/Tracker')}> <FontAwesomeIcon icon={faMagnifyingGlassChart}/> Tracker</p>
              <p onClick={() => navigate('/Login')}><FontAwesomeIcon icon={faChalkboardUser}/> Login</p>
              </>
              )}
            </div>
          )}
        </div>
        </div>
    )
}

export default Liveviewtoolbar;