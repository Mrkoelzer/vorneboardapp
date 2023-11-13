import React, { useContext, useEffect } from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/Updater.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faPenToSquare, faBarcode, faFilePdf, faFileCirclePlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';

function Updater() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(usercontext);
  const { settoolbarinfo } = useContext(Toolbarcontext)

  useEffect(() => {
    settoolbarinfo([{ Title: 'Vorne Updater Page' }])
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
      sessionStorage.setItem('LastPage', 'Updater')
      navigate('/login');
    }
  }, [setuserdata, navigate]);

  return (
    <div className="updaterpage">
      <div className='updater-flexbox-container'>
        <button className='mainpagebutton' onClick={() => navigate('/Modifyevents')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faPenToSquare} className="icon" />
          </div>
          <div className="text">Modify Past Events</div>
        </button>
        <button className='mainpagebutton' onClick={() => navigate('/Calendarview')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="icon" />
          </div>
          <div className="text">Calendar View</div>
        </button>
        <button className='accountbutton' onClick={() => navigate('/Addeditpartnumbers')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faBarcode} className="icon" />
          </div>
          <div className="text">Add/Edit Part Numbers</div>
        </button>
        <button className='accountbutton' onClick={() => navigate('/Pdfs')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faFilePdf} className="icon" />
          </div>
          <div className="text">Add/Delete PDFs</div>
        </button>
        <button className='accountbutton' onClick={() => navigate('/Partpdfs')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faFileCirclePlus} className="icon" />
          </div>
          <div className="text">Edit Linked PDFs</div>
        </button>
        <button className='accountbutton' onClick={() => navigate('/')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} className="icon" />
          </div>
          <div className="text">Go Back</div>
        </button>
      </div>
    </div>
  );
}

export default Updater;
