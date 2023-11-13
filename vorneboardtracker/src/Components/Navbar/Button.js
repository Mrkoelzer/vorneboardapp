import React, { useContext } from 'react';
import './Button.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardUser, faExclamationCircle, faGear, faHome, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import { usercontext } from '../../contexts/usercontext';

export function Button() {
    const { userdata, setuserdata } = useContext(usercontext);

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
        <>
           {userdata.loggedin === 1 ? (
            <Link to='/'>
              <button className='btn' onClick={logout}><FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
            </Link>
          ) : (
            <Link to='Login'>
              <button className='btn'><FontAwesomeIcon icon={faChalkboardUser} /> Login</button>
            </Link>
          )}
        </>
      );
}