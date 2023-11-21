import React, { useContext, useEffect, useState } from 'react';
import '../Css/Calendarview.css'
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBarcode, faBoxesPacking, faCircle, faFileCirclePlus, faFilePdf, faTabletScreenButton, faUnlockKeyhole, faUser, faUserGear } from '@fortawesome/free-solid-svg-icons';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';
import CalendarPopup from '../Components/CalendarPopup';
import CalendarAddEvent from '../Components/CalendarAddEvent';
import Axios from 'axios';
import { linescontext } from '../contexts/linescontext';

function Calendarview() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(usercontext);
  const [isLoading, setIsLoading] = useState(true);
  const localizer = momentLocalizer(moment);
  const { settoolbarinfo } = useContext(Toolbarcontext);
  const { lines, setlines } = useContext(linescontext);
  const [showCalendarPopup, setshowCalendarPopup] = useState(false);
  const [showCalendarAddPopup, setshowCalendarAddPopup] = useState(false);
  const [shiftData, setShitdata] = useState([]);
  const [dayshiftdata, setdayshiftdata] = useState([]);
  const [currentMonthRange, setCurrentMonthRange] = useState({ start: null, end: null });
  const [defaultDate, setDefaultDate] = useState(new Date()); 
  const [events, setevents] = useState([
    {
      title: '',
      start: new Date(),
      end: new Date(),
    }
  ])

  useEffect(() => {
    settoolbarinfo([{ Title: 'Vorne Calendar View' }])
  }, []);

  useEffect(() => {
    const today = moment();
    const startOfMonth = moment(today).startOf('month');
    const endOfMonth = moment(today).endOf('month');
    setCurrentMonthRange({ start: startOfMonth._d, end: endOfMonth._d });

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

  const fetchlines = async () => {
    if (lines.length === 0) {
      const storedLines = sessionStorage.getItem('lines');
      // Parse the retrieved string back into an array
      const parsedLines = storedLines ? JSON.parse(storedLines) : [];
      // Set the retrieved data into useState
      setlines(parsedLines);
      getallCalendarevents(parsedLines)
    }
  };
  useEffect(() => {
    if (lines.length === 0 && currentMonthRange.end !== null) {
      fetchlines()
    }
    else if (currentMonthRange.end !== null) {
      getallCalendarevents(lines)
    }
  }, [currentMonthRange]);

  const getallCalendarevents = async (data) => {
    try {
      const production_day_numbers = await getProductiondaynumber(data[0].ipaddress)

      // Extract productionDay from the response
      const productionDay = production_day_numbers.productionDay;
  
      // Calculate the difference in days between today and the start of the current month
      const daysDifference = moment().diff(moment(currentMonthRange.start), 'days');
      const daysDifferenceend = moment().diff(moment(currentMonthRange.end), 'days');
      // Adjust the production day numbers
      const adjustedStart = productionDay - daysDifference;
  
      // Adjust the end date based on whether we are going forward or backward
      const adjustedEnd = productionDay - daysDifferenceend;
  
      const eventPromises = data.map(async (line) => {
        const linename = line.Linename;
        const eventdata = await getCalendarevents(line.ipaddress, adjustedStart, adjustedEnd);
        const shiftdata = await getShiftData(line.ipaddress, adjustedStart, adjustedEnd)
        return {
          linename,
          eventdata,
          shiftdata,
        };
      });

      const finaldata = await Promise.all(eventPromises);
      const allEvents = finaldata.reduce((acc, { linename, eventdata }) => {
        const newEvents = eventdata.map(eventInfo => {
          const start = new Date(eventInfo[0]);
          const end = new Date(eventInfo[1]);

          return {
            title: linename,
            start,
            end,
            state: 'Past'
          };
        });
        return acc.concat(newEvents);
      }, []);
      setevents(allEvents);
      const allShiftData = finaldata.reduce((acc, { linename, shiftdata }) => {
        const newShiftdata = shiftdata.map(shiftInfo => {
          const starttime = new Date(shiftInfo[3]);
          const endtime = new Date(shiftInfo[4]);

          return {
            title: linename,
            part_display_name: shiftInfo[0],
            run_time: shiftInfo[1],
            down_time: shiftInfo[2],
            start_time: starttime,
            end_time: endtime,
            in_count: shiftInfo[5],
            good_count: shiftInfo[6],
            reject_count: shiftInfo[7],
            shift_display_name: shiftInfo[8],
            record_id: shiftInfo[9],
            process_state: shiftInfo[10],
            average_cycle_time: shiftInfo[11],
            ideal_cycle_time: shiftInfo[12],
            oee: shiftInfo[13],
          };
        });
        return acc.concat(newShiftdata);
      }, []);
      setShitdata(allShiftData)
    } catch (error) {
      console.error('Error fetching data:', error);
    }finally{
      setIsLoading(false)
    }
  };


  const getProductiondaynumber = async (ip) => {
    try {
      const apiUrl = `http://${ip}/rest/v1/xlcm/system/time`;
      const response = await Axios.get(apiUrl);
      const data = response.data;

      if (data) {
        return data;
      } else {
        // Handle the case where data is missing or in an unexpected format
        return [];
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  const getCalendarevents = async (ip, start, end) => {
    try {
      const apiUrl = `http://${ip}/api/v0/channels/calendar_day/events?fields=start_time,end_time,in_count,good_count,reject_count,shift_display_name,record_id,process_state&filter=(process_state%20ne%20%27no_production%27)%20and%20(production_day_number%20ge%20${start})%20and%20(production_day_number%20le%20${end})`;
      const response = await Axios.get(apiUrl);
      const data = response.data;

      if (data && data.data && data.data.events) {
        return data.data.events;
      } else {
        // Handle the case where data is missing or in an unexpected format
        return [];
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  const getShiftData = async (ip, start, end) => {
    try {
      const apiUrl = `http://${ip}/api/v0/channels/calendar_day/events?fields=part_display_name,run_time,down_time,start_time,end_time,in_count,good_count,reject_count,shift_display_name,record_id,process_state,average_cycle_time,ideal_cycle_time,oee&group=shift&group=part&filter=(process_state%20ne%20%27no_production%27)%20and%20(production_day_number%20ge%20${start})%20and%20(production_day_number%20le%20${end})&sort=start_time`;

      const response = await Axios.get(apiUrl);
      const data = response.data;

      if (data && data.data && data.data.events) {
        return data.data.events;
      } else {
        // Handle the case where data is missing or in an unexpected format
        return [];
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };


  const handleshowCalendarPopup = () => {
    setshowCalendarPopup(true)
  }

  const handleshowCalendarEventPopup = (event) => {
    const matchedShiftData = [];
    for (let i = 0; i < shiftData.length; i++) {
      // Extract the day part from the start_time in shiftData
      const shiftDataDay = new Date(shiftData[i].start_time).toLocaleDateString();

      // Extract the day part from the start in the event
      const eventDay = new Date(event.start).toLocaleDateString();

      if (event.title === shiftData[i].title && shiftDataDay === eventDay) {
        matchedShiftData.push(shiftData[i]);
      }
    }
    setdayshiftdata(matchedShiftData)

  };
  useEffect(() => {
    if (dayshiftdata.length > 0) {
      setshowCalendarPopup(true);
    }
  }, [dayshiftdata]);

  const handleClosed = () => {
    setshowCalendarPopup(false);
  };

  const handleAddClosed = () => {
    setshowCalendarAddPopup(false);
  };

  const handleAddShow = () => {
    setshowCalendarAddPopup(true);
  };

  const handleNavigate = (date) => {
    // Check if the new date falls within the current month range
    const isWithinCurrentMonthRange =
      moment(date).isSameOrAfter(currentMonthRange.start, 'month') &&
      moment(date).isSameOrBefore(currentMonthRange.end, 'month');
  
    // If the new date is within the current month range, do nothing
    if (isWithinCurrentMonthRange) {
      return;
    }
  
    // Update the current month range and other necessary state
    const startOfMonth = moment(date).startOf('month');
    const endOfMonth = moment(date).endOf('month');
  
    setDefaultDate(date);
    setIsLoading(true);
    setCurrentMonthRange({ start: startOfMonth._d, end: endOfMonth._d });
  };

  return (
    <div className="Calendarviewpage">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <br />
          <Calendar
            localizer={localizer}
            defaultDate={defaultDate}
            //defaultView="month"
            style={{ height: "90vh" }}
            events={events}
            selectable
            onSelectSlot={handleAddShow}
            onSelectEvent={(event, e) => handleshowCalendarEventPopup(event)}
            onNavigate={(date) => handleNavigate(date)}
            popup
          />
          <CalendarPopup
            show={showCalendarPopup}
            handleClose={handleClosed}
            data={dayshiftdata}
          />
          <CalendarAddEvent
          show={showCalendarAddPopup}
          handleClose={handleAddClosed}
          />
        </>
      )}
    </div>
  );
}

export default Calendarview;