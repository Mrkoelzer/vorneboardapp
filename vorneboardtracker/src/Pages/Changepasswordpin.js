import React, { useState, useContext } from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/Changepasswordpin.css';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../Components/Changetoobar';
import Changepin from '../Components/Changepin'
import { usercontext } from '../contexts/usercontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBraille, faUserLock, faXmark } from '@fortawesome/free-solid-svg-icons';

function Changepasswordpin() {
  const navigate = useNavigate();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(true);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const { userdata, setuserdata } = useContext(usercontext);
  const { localipaddr } = useContext(ipaddrcontext);
  const [addLineMessage, setAddLineMessage] = useState('');
  const [passworddata, setpassworddata] = useState({
    oldpassword: '',
    newpassword: '',
    confimpassword: '',
    username: userdata.username
  });

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
            getuserdata();
            handleShowChangePasswordForm()
            return;
          }
        } catch (error) {
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
        setuserdata(data.recordset[0])
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
      <Toolbar />
      <div className='changepasspin-flexbox-container'>
        <br />
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
          <button className='changepasspinbutton' onClick={() => navigate('/Account')}>
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

export default Changepasswordpin;
