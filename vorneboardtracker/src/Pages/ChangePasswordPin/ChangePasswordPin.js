import React, { useState, useContext, useEffect } from 'react';
import './ChangePasswordPin.css';
import { useNavigate } from 'react-router-dom';
import Changepin from '../../Components/ChangePin/ChangePin'
import { usercontext } from '../../contexts/usercontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { faArrowLeft, faBraille, faUserLock, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';

function ChangePasswordPin() {
  const navigate = useNavigate();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(true);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const { userdata, setuserdata } = useContext(usercontext);
  const { localipaddr } = useContext(ipaddrcontext);
  const [addLineMessage, setAddLineMessage] = useState('');
  const [changepassmessage, setchangepassmessage] = useState('');
  const [lockedaccount, setlockedaccount] = useState(false);
  const { settoolbarinfo } = useContext(Toolbarcontext)
  const [passworddata, setpassworddata] = useState({
    oldpassword: '',
    newpassword: '',
    confimpassword: '',
    username: userdata.username
  });

  useEffect(() => {
    settoolbarinfo([{ Title: 'Change Password/PIN' }])
    const userDataFromLocalStorage = sessionStorage.getItem('userdata');
    let parsedUserData;
  
    if (userDataFromLocalStorage) {
      parsedUserData = JSON.parse(userDataFromLocalStorage);
  
      // Check if the value has changed before updating the state
      if (JSON.stringify(parsedUserData) !== JSON.stringify(userdata)) {
        setuserdata(parsedUserData);
      }
    }
  
    if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
      if (
        userdata.passwordchange === 1 ||
        parsedUserData.pinchange === 1 ||
        userdata.pinchange === 1 ||
        parsedUserData.passwordchange === 1
      ) {
        setlockedaccount(true)
        if (
          (userdata.pinchange === 1 && userdata.passwordchange === 1) ||
          (parsedUserData.passwordchange === 1 && parsedUserData.pinchange === 1)
        ) {
          setchangepassmessage('Must Update Password and PIN');
        } else if (userdata.pinchange === 1 || parsedUserData.pinchange === 1) {
          setchangepassmessage('Must Update PIN');
        } else if (userdata.passwordchange === 1 || parsedUserData.passwordchange === 1) {
          setchangepassmessage('Must Update Password');
        }
      } else {
        console.log(lockedaccount)
        if(lockedaccount === true){
          setchangepassmessage('Password and PIN Updated: Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 3000); // 3000 milliseconds = 3 seconds
        }else{
          setchangepassmessage('');
        }
      }
    } else {
      navigate('/');
    }
  }, [userdata]);
  

  const handleShowChangePasswordForm = () => {
    setShowChangePasswordForm(true);
    setAddLineMessage('')
    setpassworddata({
      oldpassword: '',
      newpassword: '',
      confimpassword: '',
      username: userdata.username
    })
  };

  const handleHideChangePasswordForm = () => {
    setShowChangePasswordForm(false);
  };

  const updatepassword = async () => {
    if (passworddata.oldpassword.trim() === "") {
      setAddLineMessage('Old Password Is Blank')
      return;
    }
    if (passworddata.newpassword.trim() === "") {
      setAddLineMessage('New Password Is Blank')
      return;
    }
    if (passworddata.confimpassword.trim() === "") {
      setAddLineMessage('Confirm Password Is Blank')
      return;
    }
    if (passworddata.oldpassword === userdata.password) {
      if (passworddata.newpassword === passworddata.confimpassword) {
        try {
          const response = await fetch(`http://${localipaddr}:1435/api/updatepassword`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passworddata }),
          });
          const data = await response.json();
          if (data.passupdated) {
            NotificationManager.success('Password Updated!')
            getuserdata();
            handleShowChangePasswordForm()
            return;
          }
        } catch (error) {
          NotificationManager.error('Password Update Failed!')
          console.error('Error:', error);
        }
      } else {
        setAddLineMessage('New Passwords Dont Match')
        return;
      }
    }
    else {
      setAddLineMessage('Incorrect Password')
      return;
    }
  }

  const getuserdata = async () => {
    try {
      let username = userdata.username
      const response = await fetch(`http://${localipaddr}:1435/api/getuserdata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data) {
        console.log(data)
        setuserdata(data.recordset[0])
        sessionStorage.setItem('userdata', JSON.stringify({
          ...data.recordset[0],
          loggedin: 1,
        }));
        setuserdata(prevUserData => ({
          ...prevUserData,
          loggedin: 1
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const togglePopup2 = () => {
    setIsPopupOpen2(!isPopupOpen2);
    getuserdata()
  };
  return (
    <div className="changepasspin">
      <div className='changepasspin-flexbox-container'>
      <NotificationContainer/>
        <br />
        <div>
        {changepassmessage}
        </div>
        {showChangePasswordForm ? (
          <div className='changepasspinflexbox-item'>
            <button className='changepasspinbutton' onClick={handleHideChangePasswordForm}>
              <div className="changepasspinbuttonicon-wrapper">
                <FontAwesomeIcon icon={faUserLock} className="changepasspinbuttonicon" />
              </div>
              <div className="changepasspinbuttontext">Change Password</div>
            </button>
          </div>
        ) : (
          <>
            Change Password
            <div className='changepasspinflexbox-item'>
              <input
                className='changepasspin-inputs'
                type="password"
                placeholder="Old Password"
                onChange={(e) => setpassworddata({ ...passworddata, oldpassword: e.target.value })}
              />
            </div>
            <div className='changepasspinflexbox-item'>
              <input
                className='changepasspin-inputs'
                type="password"
                placeholder="New Password"
                onChange={(e) => setpassworddata({ ...passworddata, newpassword: e.target.value })}
              />
            </div>
            <div className='changepasspinflexbox-item'>
              <input
                className='changepasspin-inputs'
                type="password"
                placeholder="Confirm New Password"
                onChange={(e) => setpassworddata({ ...passworddata, confimpassword: e.target.value })}
              />
            </div>
            <br />
            <div className='changepasspinflexbox-item' style={{ display: 'flex' }}>
              <button className='changepasspinbutton' onClick={updatepassword}>
              <div className="changepasspinbuttonicon-wrapper">
                <FontAwesomeIcon icon={faUserLock} className="changepasspinbuttonicon" />
              </div>
              <div className="changepasspinbuttontext">Update Password</div>
              </button>
              <button className='changepasspinbutton' onClick={handleShowChangePasswordForm}>
              <div className="changepasspinbuttonicon-wrapper">
                <FontAwesomeIcon icon={faXmark} className="changepasspinbuttonicon" />
              </div>
              <div className="changepasspinbuttontext">Cancel</div>
              </button>
            </div>

            {addLineMessage}
          </>
        )}
        <br />
        <div className='changepasspinflexbox-item'>
          <button className='changepasspinbutton' onClick={togglePopup2}>
            <div className="changepasspinbuttonicon-wrapper">
              <FontAwesomeIcon icon={faBraille} className="changepasspinbuttonicon" />
            </div>
            <div className="changepasspinbuttontext">Change Pin</div>
          </button>
        </div>
        <br />
        <div className='changepasspinflexbox-item'>
          <button className='changepasspinbutton' onClick={() => navigate('/Settings')}>
            <div className="changepasspinbuttonicon-wrapper">
              <FontAwesomeIcon icon={faArrowLeft} className="changepasspinbuttonicon" />
            </div>
            <div className="changepasspinbuttontext">Go Back</div>
          </button>
        </div>
        {isPopupOpen2 && (
          <div className='changepopup-form'>
            <div className='changepopup-form-content'>
              <button className='changepopup-close2' onClick={togglePopup2}>
                X
              </button>
              <Changepin closePopup={togglePopup2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordPin;
