import React, { useContext, useEffect } from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/Updater.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext'
import Toolbar from '../Components/Updatertoobar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare} from '@fortawesome/free-solid-svg-icons';


function Updater() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(usercontext);
  useEffect(() => {
    const userDataFromLocalStorage = sessionStorage.getItem('userdata');
    let parsedUserData;
    if (userDataFromLocalStorage) {
        parsedUserData = JSON.parse(userDataFromLocalStorage);
        setuserdata(parsedUserData);
    }
    if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
        if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
            navigate('/Changepasswordpin');
        }
    } else {
        navigate('/');
    }
}, [setuserdata, navigate]);

  return (
    <div className="updaterpage">
      <Toolbar/>
      <div className='updater-flexbox-container'>
      <button className='mainpagebutton' onClick={() => navigate('/Modifyevents')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faPenToSquare} className="icon" />
          </div>
          <div className="text">Modify Past Events</div>
        </button>
      </div>
    </div>
  );
}

export default Updater;
