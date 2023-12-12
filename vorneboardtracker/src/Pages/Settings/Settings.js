import React, { useContext, useEffect } from 'react';
import './Settings.css'
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../../contexts/usercontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBarcode, faBoxesPacking, faCircle, faFileCirclePlus, faFilePdf, faTabletScreenButton, faUnlockKeyhole, faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';

function Settings() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const { settoolbarinfo } = useContext(Toolbarcontext)
    
    useEffect(() => {
        settoolbarinfo([{Title: 'Vorne Settings Page'}])
      }, []);
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
            sessionStorage.setItem('LastPage', 'Settings')
            navigate('/Login');
        }
    }, [setuserdata, navigate]);
    return (
        <div className="accountpage">
            <div className='account-container'>
            {userdata.superadmin === 1 && (
                <button className='accountbutton' onClick={() => navigate('/UsersPage')}>
                    <div className="icon-wrapper">
                        <FontAwesomeIcon icon={faUserGear} className="icon" />
                    </div>
                    <div className="text">Users</div>
                </button>
            )}
                <button className='accountbutton' onClick={() => navigate('/Changepasswordpin')}>
                <div className="icon-wrapper">
                    <FontAwesomeIcon icon={faUnlockKeyhole}  className="icon" /> 
                    </div>
                    <div className="text">Change Password/Pin</div>
                </button>
                {userdata.superadmin === 1 && (
                <button className='accountbutton' onClick={() => navigate('/EditLines')}>
                <div className="icon-wrapper">
                    <FontAwesomeIcon icon={faBoxesPacking}  className="icon"/>   
                    </div>
                    <div className="text">Edit Lines/Extruders</div>
                </button>
                )}
                {userdata.superadmin === 1 && (
                <button className='accountbutton' onClick={() => navigate('/SelectTablet')}>
                <div className="icon-wrapper">
                    <FontAwesomeIcon icon={faTabletScreenButton}  className="icon"/>   
                    </div>
                    <div className="text">Select Tablet</div>
                </button>
                )}
                <button className='accountbutton' onClick={() => navigate('/')}>
                <div className="icon-wrapper">
                    <FontAwesomeIcon icon={faArrowLeft}  className="icon"/>   
                    </div>
                    <div className="text">Go Back</div>
                </button>
            </div>
        </div>
    );
}

export default Settings;