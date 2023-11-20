import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/Modifyevents.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext'
import { linescontext } from '../contexts/linescontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faCircleInfo, faCircle, faCalendarDays, fa1, faTimeline, faPlay, faStop, faMugSaucer, faDownLong, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import Axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';

function Modifyevents() {
    useEffect(() => {
        settoolbarinfo([{ Title: 'Vorne Modify Events' }])
        if (lines.length === 0) {
            const storedLines = sessionStorage.getItem('lines');
            // Parse the retrieved string back into an array
            const parsedLines = storedLines ? JSON.parse(storedLines) : [];

            // Set the retrieved data into useState
            setlines(parsedLines);
            setselectedline(parsedLines[0].Linename)
            setselectedip(parsedLines[0].ipaddress)
        }
        else {
            setselectedline(lines[0].Linename)
            setselectedip(lines[0].ipaddress)
        }
    }, []);
    const { settoolbarinfo } = useContext(Toolbarcontext)
    const { localipaddr } = useContext(ipaddrcontext);
    const [isLoading, setIsLoading] = useState(true); // Add isLoading state
    const [showRunning, setShowRunning] = useState(true);
    const [showNoProduction, setshowNoProduction] = useState(true);
    const [showBreak, setshowBreak] = useState(true);
    const [showDown, setshowDown] = useState(true);
    const [showCalanderModal, setShowCalanderModal] = useState(false);
    const [addLineMessage, setAddLineMessage] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const { lines, setlines } = useContext(linescontext);
    const [selectedline, setselectedline] = useState('');
    const [selectedip, setselectedip] = useState('');
    const [selecteddate, setselecteddate] = useState([new Date(), new Date()]);
    const { userdata, setuserdata } = useContext(usercontext);
    const [PastNotesData, setPastNotesData] = useState([])
    const [firstShift, setFirstShift] = useState(false);
    const [secondShift, setSecondShift] = useState(false);
    const [thirdShift, setThirdShift] = useState(false);
    const [pastevents, setpastevents] = useState([
        {
            duration: 0,
            process_state: '',
            process_state_reason: '',
            run_time: 0,
            unplanned_stop_time: 0,
            planned_stop_time: 0,
            in_count: 0,
            good_count: 0,
            reject_count: 0,
            process_state_event_id: 0,
            start_time: '',
            record_id: 0,
            end_time: '',
            record_order: 0,
        },
    ]);
    const [editedData, setEditedData] = useState({
        process_state: '',
        process_state_reason: '',
        process_state_event_id: 0,
        record_id: 0,
        start_time: new Date().toLocaleDateString(),
        notes: '',
        end_time: new Date(),
        note_created: new Date(),
        last_update: new Date(),
        user_created: '',
        user_update: '',
        linename: selectedline
    });

    const navigate = useNavigate();

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

    function parseDate(dateString) {
        const dateParts = dateString.split('/');
        // Please note that the month is 0-indexed, so we subtract 1 from the month value
        return new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    }

    function dateDiffInDays(dateString1, dateString2) {
        const date1 = parseDate(dateString1);
        const date2 = parseDate(dateString2);

        // Convert both dates to milliseconds
        const date1InMs = date1.getTime();
        const date2InMs = date2.getTime();

        // Calculate the difference in milliseconds
        const timeDiffInMs = date2InMs - date1InMs;

        // Convert the difference back to days
        const diffInDays = timeDiffInMs / (1000 * 3600 * 24);

        // Round down the value to get an integer number of days
        return Math.floor(diffInDays);
    }

    const getprocessstatepastevents = (daynumber1, daynumber2, ip) => {
        const apiUrl = `http://${ip}/api/v0/channels/production_metric/events?fields=duration,process_state,process_state_reason,run_time,unplanned_stop_time,planned_stop_time,in_count,good_count,reject_count,process_state_event_id,start_time,record_id,end_time,record_order&group=process_state_event_id&query_name=multisession-table-6916-production_metric&filter=(production_day_number%20ge%20${daynumber1})%20and%20(production_day_number%20le%20${daynumber2})`;

        return Axios.get(apiUrl)
            .then((response) => {
                const data = response.data;
                if (data) {
                    // Ensure data.part_id exists before accessing it
                    return data.data.events;
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return null;
            });
    };

    const getcurrentproductionday = () => {
        const apiUrl = `http://${selectedip}/api/v0/channels/production_day/events?fields=production_day_number&sort=-production_day_number&limit=1`;

        return Axios.get(apiUrl)
            .then((response) => {
                const currentDate = new Date();
                const data = response.data;
                if (data) {
                    // Ensure data.part_id exists before accessing it
                    return {
                        productiondaynumber: data.data.events[0][0],
                        currentDate: currentDate.toLocaleDateString(),
                    };
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return null;
            });
    };

    const isTimeWithinRange = (time, targetHours) => {
        const startTime = new Date(time);
        const startHour = startTime.getHours();
        return targetHours.includes(startHour);
    };

    const updatepastdata = async () => {
        let requestData = {
            changes: [
                {
                    record_id: editedData.record_id,
                    process_state: editedData.process_state,
                    reason: editedData.process_state_reason,
                },
            ],
            ipaddress: selectedip
        }
        if (
            editedData.process_state === 'running' || editedData.process_state === 'no_production' &&
            isTimeWithinRange(editedData.start_time, [7, 15, 23]) // Check if the time is 7 am, 3 pm, or 11 pm
        ) {
            if (PastNotesData.length === 0) {
                NotificationManager.success('Updating Event!')
                insertpastnotesdata();
                setShowEditModal(false)
                return;
            }
            else {
                NotificationManager.success('Updating Event!')
                updatepastnotesdata()
                setShowEditModal(false)
                return;
            }
        }
        else {
            await Axios.post(`http://${localipaddr}:1433/updatepastdata`, requestData)
                .then((response) => {
                    const data = response.data
                    if (data.changed) {
                        setIsLoading(true)
                        if (PastNotesData.length === 0) {
                            NotificationManager.success('Updating Event!')
                            insertpastnotesdata();
                        }
                        else {
                            NotificationManager.success('Updating Event!')
                            updatepastnotesdata()
                        }
                        setShowEditModal(false)
                        gettodaysproductionday(selecteddate)
                    }
                    else {
                        NotificationManager.error(`Can't Change This Process State`)
                        updatepastnotesdata()
                        setAddLineMessage("Can't Change This Process State")
                    }
                })
                .catch((error) => {
                    NotificationManager.error("Can't Change This Process State")
                    setAddLineMessage("Can't Change This Process State")
                    console.error('Error fetching data:', error);
                });
        }
    };

    const getpastnotesdata = async (id) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getpastnotesdata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ record_id: id }) // Wrap the number in a JSON object
            });

            const data = await response.json();
            if (data.checked) {
                setPastNotesData(data.result[0])
                return data.result[0]
            } else {
                return PastNotesData
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updatepastnotesdata = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/updatepastnotesdata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ editedData }) // Wrap the number in a JSON object
            });

            const data = await response.json();
            if (data.checked) {

                gettodaysproductionday(selecteddate);
            } else {
                return PastNotesData
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const insertpastnotesdata = async () => {
        const currentDate = new Date();
        const updatedData = {
            ...editedData,
            note_created: currentDate,
            user_created: currentDate,
        };

        try {
            const response = await fetch(`http://${localipaddr}:1435/api/insertpastnotesdata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ editedData: updatedData }), // Wrap the number in a JSON object
            });
            const data = await response.json();
            if (data.checked) {
                gettodaysproductionday(selecteddate);
            } else {
                return PastNotesData;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const gettodaysproductionday = async (date) => {
        let date1 = date[0].toLocaleDateString();
        let date2 = date[1].toLocaleDateString();
        const currentDate = new Date().toLocaleDateString();
        const productionday1 = dateDiffInDays(date1, currentDate);
        const productionday2 = dateDiffInDays(date2, currentDate);

        const currentproductionday = await getcurrentproductionday();
        const daynumber1 = currentproductionday.productiondaynumber - productionday1;
        const daynumber2 = currentproductionday.productiondaynumber - productionday2;
        const lineData = await getprocessstatepastevents(daynumber1, daynumber2, selectedip);

        if (lineData) {
            const formattedData = lineData.map((data) => {
                return {
                    duration: data[0],
                    process_state: data[1],
                    process_state_reason: data[2],
                    run_time: data[3],
                    unplanned_stop_time: data[4],
                    planned_stop_time: data[5],
                    in_count: data[6],
                    good_count: data[7],
                    reject_count: data[8],
                    process_state_event_id: data[9],
                    start_time: data[10],
                    record_id: data[11],
                    end_time: data[12],
                    record_order: data[13],
                };
            });
            setpastevents(formattedData);
            setIsLoading(false); // Data has been loaded, set isLoading to false
        }
    };

    useEffect(() => {
        const start = [new Date(), new Date()]
        gettodaysproductionday(start);
    }, []);

    const formatDateTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        const month = dateTime.getMonth() + 1; // Months are 0-based
        const day = dateTime.getDate();
        const year = dateTime.getFullYear().toString().slice(-2); // Get the last two digits of the year
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        const period = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format

        return `${month}/${day}/${year}. ${formattedHours}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    };

    const formattext = (text) => {
        const words = text.split('_');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
        return words.join(' ');
    };
    const formattextreason = (text) => {
        if (text === 'down') {
            return "Missing Reason"
        }
        const words = text.split('_');
        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
        return words.join(' ');
    };
    const toggleShowRunning = () => {
        setShowRunning(!showRunning);
    };
    const toggleShowNoProduction = () => {
        setshowNoProduction(!showNoProduction);
    };
    const toggleShowBreak = () => {
        setshowBreak(!showBreak);
    };
    const toggleShowDown = () => {
        setshowDown(!showDown);
    };

    const handleCalanderClick = () => {
        setShowCalanderModal(true);
        setAddLineMessage('');
    };

    const closeCalanderModal = () => {
        setShowCalanderModal(false);
        //getprocessstatepastevents()
    };

    const handleEditClick = async (event_id) => {
        for (let i = 0; i < pastevents.length; i++) {
            if (pastevents[i].process_state_event_id === event_id) {
                const data = await getpastnotesdata(pastevents[i].record_id);
                if (data.notes === 'undefined') {
                    setEditedData({
                        process_state: pastevents[i].process_state,
                        process_state_reason: pastevents[i].process_state_reason,
                        process_state_event_id: pastevents[i].process_state_event_id,
                        record_id: pastevents[i].record_id,
                        start_time: pastevents[i].start_time,
                        notes: '',
                        end_time: pastevents[i].end_time,
                        note_created: data.note_created,
                        last_update: data.last_update,
                        user_created: data.user_created,
                        user_update: data.user_update,
                        linename: selectedline
                    });
                    break;
                }
                else {
                    setEditedData({
                        process_state: pastevents[i].process_state,
                        process_state_reason: pastevents[i].process_state_reason,
                        process_state_event_id: pastevents[i].process_state_event_id,
                        record_id: pastevents[i].record_id,
                        start_time: pastevents[i].start_time,
                        notes: data.notes,
                        end_time: pastevents[i].end_time,
                        note_created: data.note_created,
                        last_update: data.last_update,
                        user_created: data.user_created,
                        user_update: data.user_update,
                        linename: selectedline
                    });
                    break;
                }
            }
        }
        setShowEditModal(true);
        setAddLineMessage('');
    };
    const closeEditModal = () => {
        setShowEditModal(false);
        setEditedData({
            process_state: '',
            process_state_reason: '',
            process_state_event_id: 0,
            record_id: 0,
            start_time: new Date().toLocaleDateString(),
            notes: '',
            end_time: new Date(),
            note_created: new Date(),
            last_update: new Date(),
            user_created: '',
            user_update: '',
            linename: selectedline

        })
        setPastNotesData([])
    };

    const handleDateChange = (date) => {
        const startDate = date[0];
        const endDate = date[1];
        const maxDate = new Date(endDate);
        maxDate.setMonth(maxDate.getMonth() - 1);

        const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (endDate < startDate) {
            // If the end date is before the start date, switch the dates
            setselecteddate([endDate, startDate]);
        } else if (diffDays > 30) {
            const newEndDate = new Date(endDate);
            newEndDate.setMonth(newEndDate.getMonth() - 1);
            setselecteddate([newEndDate, endDate]);
        } else {
            setselecteddate([startDate, endDate]);
        }

        setIsLoading(true);
        setShowCalanderModal(false);
        gettodaysproductionday(date);
    };




    const handleSelectedLine = (line) => {
        setselectedline(line)
        for (let i = 0; i < lines.length; i++) {
            if (line === lines[i].Linename) {
                setselectedip(lines[i].ipaddress)
                setIsLoading(true)
                break;
            }
        }
    };

    const handlenoteschange = (e) => {
        setEditedData({
            process_state: editedData.process_state,
            process_state_reason: editedData.process_state_reason,
            process_state_event_id: editedData.process_state_event_id,
            record_id: editedData.record_id,
            start_time: editedData.start_time,
            notes: e,
            end_time: editedData.end_time,
            note_created: editedData.note_created,
            last_update: new Date(),
            user_created: editedData.user_created,
            user_update: userdata.first_name + ' ' + userdata.last_name,
            linename: selectedline
        })
    }

    const handleprocessstatechange = (e) => {
        let processstatereason = ''
        if (e === "no_production") {
            processstatereason = 'no_orders'
        }
        if (e === "break") {
            processstatereason = 'break'
        }
        if (e === "down") {
            processstatereason = 'down'
        }
        if (e === "changeover") {
            processstatereason = 'material_change'
        }
        setEditedData({
            process_state: e,
            process_state_reason: processstatereason,
            process_state_event_id: editedData.process_state_event_id,
            record_id: editedData.record_id,
            start_time: editedData.start_time,
            notes: editedData.notes,
            end_time: editedData.end_time,
            note_created: editedData.note_created,
            last_update: new Date(),
            user_created: editedData.user_created,
            user_update: userdata.first_name + ' ' + userdata.last_name,
            linename: selectedline
        })
    }
    const handleprocessstatereasonchange = (e) => {
        setEditedData({
            process_state: editedData.process_state,
            process_state_reason: e,
            process_state_event_id: editedData.process_state_event_id,
            record_id: editedData.record_id,
            start_time: editedData.start_time,
            notes: editedData.notes,
            end_time: editedData.end_time,
            note_created: editedData.note_created,
            last_update: new Date(),
            user_created: editedData.user_created,
            user_update: userdata.first_name + ' ' + userdata.last_name,
            linename: selectedline
        })
    }

    const handleShiftButtonClick = (shiftName) => {
        switch (shiftName) {
            case 'firstShift':
                setFirstShift(!firstShift);
                if (!firstShift) {
                    setSecondShift(false);
                    setThirdShift(false);
                }
                break;
            case 'secondShift':
                setSecondShift(!secondShift);
                if (!secondShift) {
                    setFirstShift(false);
                    setThirdShift(false);
                }
                break;
            case 'thirdShift':
                setThirdShift(!thirdShift);
                if (!thirdShift) {
                    setSecondShift(false);
                    setFirstShift(false);
                }
                break;
            default:
                break;
        }
    };

    const isTimeInRange = (time, startHour, endHour) => {
        const timeHours = new Date(time).getHours();
        return (timeHours >= startHour && timeHours < endHour);
    };

    const isTimeInRangeThird = (time) => {
        const timeHours = new Date(time).getHours();
        if(timeHours >= 23 && timeHours < 24){
            return true;
        }
        else if(timeHours >= 0 && timeHours < 7){
            return true;
        }
        else{
            return false;
        }
    };

    useEffect(() => {
        gettodaysproductionday(selecteddate);
    }, [selectedip]);

    return (
        <div className="modifyeventspage">
            <div className='modifyevents-container'>
                <NotificationContainer />
                <div className='button-container'>
                    <p style={{ marginTop: '30px', fontSize: '24px' }}>
                        Selected Days: {selecteddate[0].toLocaleDateString()} -{' '}
                        {selecteddate[1].toLocaleDateString()}
                    </p>
                    <button className="modifyfilterbuttons" onClick={handleCalanderClick}>
                        <div className="modifyfiltericon-wrapper">
                            <FontAwesomeIcon icon={faCalendarDays} className="modifyfiltericon" />
                        </div>
                        <div className="modifyfiltertext">Calendar</div>
                    </button>
                </div>
                <div className='shiftcheckboxes-container'>
                    <div className='shiftcheckboxesinner-container'>
                        <button className={firstShift ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"}
                            onClick={() => handleShiftButtonClick("firstShift")}>
                            <div className="modifyfiltericon-wrapper">
                                <FontAwesomeIcon icon={faTimeline} className="modifyfiltericon" />
                            </div>
                            <div className="modifyfiltertext">First Shift</div>
                        </button>
                        <button className={secondShift ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"}
                            onClick={() => handleShiftButtonClick("secondShift")}>
                            <div className="modifyfiltericon-wrapper">
                                <FontAwesomeIcon icon={faTimeline} className="modifyfiltericon" />
                            </div>
                            <div className="modifyfiltertext">Second Shift</div>
                        </button>

                        <button className={thirdShift ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"}
                            onClick={() => handleShiftButtonClick("thirdShift")}>
                            <div className="modifyfiltericon-wrapper">
                                <FontAwesomeIcon icon={faTimeline} className="modifyfiltericon" />
                            </div>
                            <div className="modifyfiltertext">Third Shift</div>
                        </button>
                    </div>
                    <div className='shiftcheckboxesinnerdropdown-container'>
                        <ReactBootStrap.Form.Control
                            className='modifydatadropdown'
                            as="select"
                            value={selectedline}
                            onChange={(e) => handleSelectedLine(e.target.value)}
                        >
                            {lines.map((line) => (
                                <option key={line.Linename} value={line.Linename}>
                                    {line.Linename}
                                </option>
                            ))}
                        </ReactBootStrap.Form.Control>
                    </div>
                </div>
                {showCalanderModal && (
                    <div className="aeedit-modal">
                        <div className="aeedit-popup">
                            <button className="aemodal-close-button" onClick={closeCalanderModal}>
                                X
                            </button>
                            <h2>Change Date Ranage</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            <div className='aeflexbox-item'></div>
                            <Calendar selectRange onChange={handleDateChange} value={selecteddate} />
                        </div>
                    </div>
                )}
                <br />
                <div className='showcheckboxes-container'>
                    <button className={showRunning ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"} onClick={toggleShowRunning}>
                        <div className="modifyfiltericon-wrapper">
                            <FontAwesomeIcon icon={faPlay} className="modifyfiltericon" />
                        </div>
                        <div className="modifyfiltertext">Show Running</div>
                    </button>
                    <button className={showNoProduction ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"} onClick={toggleShowNoProduction}>
                        <div className="modifyfiltericon-wrapper">
                            <FontAwesomeIcon icon={faStop} className="modifyfiltericon" />
                        </div>
                        <div className="modifyfiltertext">Show No Production</div>
                    </button>
                    <button className={showBreak ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"} onClick={toggleShowBreak}>
                        <div className="modifyfiltericon-wrapper">
                            <FontAwesomeIcon icon={faMugSaucer} className="modifyfiltericon" />
                        </div>
                        <div className="modifyfiltertext">Show Break</div>
                    </button>
                    <button className={showDown ? "modifyfilterbuttons-selected" : "modifyfilterbuttons"} onClick={toggleShowDown}>
                        <div className="modifyfiltericon-wrapper">
                            <FontAwesomeIcon icon={faDownLong} className="modifyfiltericon" />
                        </div>
                        <div className="modifyfiltertext">Show Down</div>
                    </button>
                </div>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (

                    <ReactBootStrap.Table striped bordered hover>
                        <thead>
                            <tr className="header-row">
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Duration</th>
                                <th>Process State</th>
                                <th>Process State Reason</th>
                                <th>In Count</th>
                                <th>Good Count</th>
                                <th>Reject Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(pastevents) &&
                                pastevents.map((rowData, index) => {

                                    if (
                                        (firstShift && !isTimeInRange(rowData.start_time, 7, 15)) ||
                                        (secondShift && !isTimeInRange(rowData.start_time, 15, 23))||
                                        (thirdShift && !isTimeInRangeThird(rowData.start_time))
                                    ) {
                                        return null;
                                    }
                                    if (
                                        (rowData.process_state.toLowerCase() === 'running' && !showRunning) ||
                                        (rowData.process_state.toLowerCase() === 'no_production' && !showNoProduction) ||
                                        (rowData.process_state.toLowerCase() === 'break' && !showBreak) ||
                                        (rowData.process_state.toLowerCase() === 'down' && !showDown)
                                    ) {
                                        return null;
                                    }
                                    return (
                                        <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'} onClick={() => handleEditClick(rowData.process_state_event_id)}>
                                            <td>{formatDateTime(rowData.start_time)}</td>
                                            <td>{formatDateTime(rowData.end_time)}</td>
                                            <td>{formatDuration(rowData.duration)}</td>
                                            <td>
                                                {rowData.process_state === 'running' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'green' }} />
                                                ) : rowData.process_state === 'down' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'red' }} />
                                                ) : rowData.process_state === 'no_production' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'blue' }} />
                                                ) : rowData.process_state === 'not_monitored' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'lightblue' }} />
                                                ) : rowData.process_state === 'detecting_state' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'grey' }} />
                                                ) : rowData.process_state === 'changeover' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'yellow' }} />
                                                ) : rowData.process_state === 'break' ? (
                                                    <FontAwesomeIcon icon={faCircle} style={{ color: 'darkblue' }} />
                                                ) : (
                                                    <FontAwesomeIcon icon={faCircle} />
                                                )}
                                                {formattext(rowData.process_state)}
                                            </td>
                                            <td>{formattextreason(rowData.process_state_reason)}</td>
                                            <td>{rowData.in_count}</td>
                                            <td>{rowData.good_count}</td>
                                            <td>{rowData.reject_count}</td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </ReactBootStrap.Table>
                )}
                {showEditModal && (
                    <div className="edit-modal">
                        <div className="edit-popup">
                            <button className="modal-close-button" onClick={closeEditModal}>
                                X
                            </button>
                            <h2>Modify Data</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            {editedData.process_state !== "running" && (
                                <div>
                                    {(!(editedData.start_time.includes("15:00") || editedData.start_time.includes("23:00") || editedData.start_time.includes("07:00"))) && (
                                        <div>
                                            Production State
                                            <select
                                                className='modifydataeditdropdown'
                                                value={editedData.process_state}
                                                onChange={(e) => handleprocessstatechange(e.target.value)}
                                            >
                                                <option value="no_production">No Production</option>
                                                <option value="changeover">Changeover</option>
                                                <option value="down">Down</option>
                                                <option value="break">Break</option>
                                            </select>
                                            Process State Reason
                                            <select
                                                className='modifydataeditdropdown'
                                                value={editedData.process_state_reason}
                                                onChange={(e) => handleprocessstatereasonchange(e.target.value)}
                                            >
                                                {editedData.process_state === "break" ? (
                                                    <>
                                                        <option value="break">Break</option>
                                                        <option value="lunch">Lunch</option>
                                                    </>
                                                ) : editedData.process_state === "down" ? (
                                                    <>
                                                        <option value="down">Missing Reason</option>
                                                        <option value="adjustment">Adjustment</option>
                                                        <option value="breakdown">Breakdown</option>
                                                        <option value="jam">Jam</option>
                                                        <option value="autonomous_maintenance">Maintenance</option>
                                                        <option value="no_material">No Material</option>
                                                        <option value="no_operator">No Operator</option>
                                                        <option value="Short_Down">Short Down</option>
                                                        <option value="Was_Running">Was Running</option>
                                                    </>
                                                ) : editedData.process_state === "no_production" ? (
                                                    <>
                                                        <option value="no_orders">No Orders</option>
                                                        <option value="no_shift_scheduled">No Shift Scheduled</option>
                                                        <option value="shift_ended_early">Shift Ended Early</option>
                                                    </>
                                                ) : editedData.process_state === "changeover" ? (
                                                    <>
                                                        <option value="material_change">Material Change</option>
                                                        <option value="part_change">Part Change</option>
                                                        <option value="changeover">Setup</option>
                                                    </>
                                                ) : (
                                                    <option value="default">Default Option</option>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p>Notes:</p>
                            <div className='popup-textbox-container'>
                                <textarea
                                    onChange={(e) => handlenoteschange(e.target.value)}
                                    className='popup-textbox'
                                    type="textarea"
                                    value={editedData.notes}
                                //onChange={handleInputChange}
                                />
                            </div>
                            {editedData.user_update ? (
                                <>
                                    <p>Last Updated by: {editedData.user_update}</p>
                                    <p>Last Update: {formatDateTime(editedData.last_update)}</p>
                                </>
                            ) : (
                                <>
                                    {/* Nothing will be displayed if editedData.user_update is empty */}
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                                <button className="editlebutton" onClick={updatepastdata}>
                                    <div className="editleicon-wrapper">
                                        <FontAwesomeIcon icon={faCheck} className="editleicon" />
                                    </div>
                                    <div className="editletext">Save</div>
                                </button>
                                <button className="editlebutton" onClick={closeEditModal}>
                                    <div className="editleicon-wrapper">
                                        <FontAwesomeIcon icon={faXmark} className="editleicon" />
                                    </div>
                                    <div className="editletext">Cancel</div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Modifyevents;
