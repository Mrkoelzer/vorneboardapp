import React, { useContext, useEffect, useMemo } from 'react';
import '../Css/Calendarview.css'
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBarcode, faBoxesPacking, faCircle, faFileCirclePlus, faFilePdf, faTabletScreenButton, faUnlockKeyhole, faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import {Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import events from '../contexts/events'
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';

function Calendarview() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const localizer = momentLocalizer(moment);
    const { settoolbarinfo } = useContext(Toolbarcontext)

    
  useEffect(() => {
    settoolbarinfo([{Title: 'Vorne Calendar View'}])
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
            navigate('/');
        }
    }, [setuserdata, navigate]);


    return (
        <div className="Calendarviewpage">
            <br/>
            <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          style={{ height: "90vh" }}
          selectable
        />
        </div>
    );
}

export default Calendarview;