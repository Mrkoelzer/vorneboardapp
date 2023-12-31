import React, { useContext, useEffect, useState, useMemo } from 'react';
import './FutureRuns.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../../contexts/usercontext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faCircle, faPenToSquare, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import CalendarAddEvent from '../../Components/CalendarAddEvent/CalendarAddEvent';
import * as ReactBootStrap from 'react-bootstrap';
import { linescontext } from '../../contexts/linescontext';
import FutureRunsPopup from './FutureRunsPopup'
import FutureRunsEditPopup from './FutureRunsEditPopup';
import FutureRunsPastEventsPopup from './FutureRunsPastEventsPopup';
import Axios from 'axios';

function FutureRuns() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const { settoolbarinfo } = useContext(Toolbarcontext)
    const { localipaddr } = useContext(ipaddrcontext);
    const [showCalendarAddPopup, setshowCalendarAddPopup] = useState(false);
    const [showAddPastEvents, setshowAddPastEvents] = useState(false);
    const [showFuturePopup, setshowFuturePopup] = useState(false);
    const [selectedtitle, setselectedtitle] = useState(null);
    const { lines, setlines } = useContext(linescontext);
    const [showFutureEditPopup, setshowFutureEditPopup] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [data, setData] = useState([
        {
            event_id: Number,
            title: String,
            part: String,
            start: String,
            end: String,
            order: Number,
            state: Number,
            Pallets: Number,
            Remaining: Number,
        }
    ]);

    useEffect(() => {
        fetchruns();

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
            sessionStorage.setItem('LastPage', 'Updater');
            navigate('/login');
        }
    }, [setuserdata, navigate]);

    useEffect(() => {
        settoolbarinfo([{ Title: 'Vorne Future Runs' }])
    }, []);

    useEffect(() => {

        const fetchDataAndSetState = async () => {
            fetchruns();
        };

        fetchDataAndSetState();

        // Fetch data every 10 seconds
        const interval = setInterval(fetchDataAndSetState, 10000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, []);

    const fetchruns = async () => {
        if (lines.length === 0) {
            const storedLines = sessionStorage.getItem('lines');
            // Parse the retrieved string back into an array
            const parsedLines = storedLines ? JSON.parse(storedLines) : [];
            // Set the retrieved data into useState
            setlines(parsedLines);
            return getallruns(parsedLines)
        }
        else {
            return getallruns(lines)
        }
    }

    const getprocessstate = (ipaddress) => {
        const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=process_state,process_state_reason_display_name`;

        return Axios.get(apiUrl)
            .then((response) => {
                const data = response.data;
                if (data) {
                    // Ensure data.part_id exists before accessing it
                    return data.data.events[0];
                } else {
                    // Handle the case where part_id is missing or undefined
                    return { ...data, part_id: 'N/A' };
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return null;
            });
    };

    const handleinsertevent = async (data) => {
        let startTime = new Date(), endTime = new Date();
        let requestData = {
            start: startTime,
            end: endTime,
            title: data.title,
            part: data.part,
            state: 1,
            order: data.order,
            Pallets: 0,
            Remaining: 0
        };
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/insertevent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            const data = await response.json();
            if (data.eventadded) {

            }
            else {
            }
            // Handle the response as needed
            // Close the add modal
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getallruns = async (data) => {
        const futurerundata = await getfutureruns();
        const runDataPromises = data.map(async (line) => {
            const linename = line.Linename;
            const currentruns = await getcurrentrun(line.ipaddress);
            const processstate = await getprocessstate(line.ipaddress);
            const historyruns = await gethistoryruns();
            const filteredFuturerundata = (futurerundata || []).filter((run) => run.title === linename);

            // Add the events property to filteredFuturerundata
            filteredFuturerundata.forEach((futureRun) => {
                futureRun.events = [];
                futureRun.Editable = false;
                for (let i = 0; i < historyruns.length; i++) {
                    if (historyruns[i].event_History_id === futureRun.event_id) {
                        futureRun.Editable = true;
                    }
                }
            });

            const combinedData = currentruns.map((run, index) => ({
                title: linename,
                order: index,
                part: run,
                events: processstate
            }));

            // Check if each entry in combinedData is in futurerundata
            await Promise.all(combinedData.map(async (currentRun) => {
                const isCurrentRunInFutureRunData = filteredFuturerundata.some(
                    (futureRun) =>
                        futureRun.title === currentRun.title &&
                        futureRun.part === currentRun.part &&
                        futureRun.order === currentRun.order
                );

                // If it's not in futurerundata, call handleinsertevent()
                if (!isCurrentRunInFutureRunData) {
                    await handleinsertevent(currentRun);
                    const updatedFuturerundata = await getfutureruns();
                    filteredFuturerundata = updatedFuturerundata.filter((run) => run.title === linename);

                }
            }));

            filteredFuturerundata.forEach((futureRun) => {
                const matchingCombinedData = combinedData.find(
                    (currentRun) =>
                        currentRun.title === futureRun.title &&
                        currentRun.part === futureRun.part &&
                        currentRun.order === futureRun.order
                );

                if (matchingCombinedData) {
                    futureRun.events = matchingCombinedData.events;
                }
            });

            filteredFuturerundata.forEach((futureRun) => {
                if (futureRun.order === 0) {
                    const isFutureRunInCombinedData = combinedData.some(
                        (currentRun) =>
                            currentRun.title === futureRun.title &&
                            currentRun.part === futureRun.part &&
                            currentRun.order === futureRun.order
                    );

                    if (!isFutureRunInCombinedData) {
                        deletefuturerun(futureRun);
                    }
                }
            });

            return filteredFuturerundata;
        });

        const currentRunsData = await Promise.all(runDataPromises);
        for (let i = 0; i < currentRunsData.length; i++) {
            if (currentRunsData[i].length > 1) {
                if (currentRunsData[i][0].part === currentRunsData[i][1].part) {
                    deletefuturerun(currentRunsData[i][1])
                }
            }
        }

        const flattenedData = currentRunsData.flat(); // Flatten the nested arrays
        setData(flattenedData)
    };

    const getfutureruns = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getfutureevents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                //setData(data.result.recordset);
                return data.result.recordset

            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const gethistoryruns = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/gethistoryruns`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                //setData(data.result.recordset);
                return data.result.recordset

            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getcurrentrun = async (ipaddress) => {
        const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=part_display_name`;

        return await Axios.get(apiUrl)
            .then((response) => {
                const data = response.data;
                if (data) {
                    return data.data.events[0];
                } else {
                    // Handle the case where part_id is missing or undefined
                    return { ...data, part_id: 'N/A' };
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                return null;
            });
    };

    const deletefuturerun = async (run) => {
        try {
            const event_id = run.event_id
            const response = await fetch(`http://${localipaddr}:1435/api/deletefutureevent`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event_id }), // Pass the id in the request body
            });

            // Handle response
            if (response.ok) {
                // Line deleted successfully
                //NotificationManager.success(`Future Run Deleted On ${run.title}`)
                fetchruns()
            } else {
                //NotificationManager.error('Deleted Failed')
                console.error('Delete failed');
            }
        } catch (error) {
            //NotificationManager.error('Deleted Failed')
            console.error('Error:', error);
        }
    };

    const handleAddPastEventShow = () => {
        setshowAddPastEvents(true);
    };

    const handleAddPastEventClosed = () => {
        setshowAddPastEvents(false);
        getallruns(lines);
    };

    const handleAddShow = () => {
        setshowCalendarAddPopup(true);
    };
    const handleAddClosed = () => {
        setshowCalendarAddPopup(false);
        getallruns(lines);
    };

    const handleFutureEditClosed = () => {
        setEditRow(null)
        getallruns()
        setshowFutureEditPopup(false);
        handleFutureClosed()
    };

    const handleFutureEditShow = (row) => {
        console.log(row)
        setEditRow(row)
    };

    useEffect(() => {
        if (editRow !== null) {
            setshowFutureEditPopup(true);
        }
    }, [editRow]);


    const handleFutureShow = (title) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].title === title && data[i].order !== 0) {
                setselectedtitle(title)
                return;
            }
        }
        return;
    };
    useEffect(() => {
        if (selectedtitle !== null) {
            setshowFuturePopup(true);
        }
    }, [selectedtitle]);

    const handleFutureClosed = () => {
        setselectedtitle(null)
        setshowFuturePopup(false);
        getallruns(lines);
    };


    return (
        <div className="FutureRunsPage">
            <div className='Future-Runs-flexbox-container'>
                <CalendarAddEvent
                    show={showCalendarAddPopup}
                    handleClose={handleAddClosed}
                    defaultdate={new Date()}
                    data={data}
                />
                <FutureRunsPopup
                    show={showFuturePopup}
                    handleClose={handleFutureClosed}
                    title={selectedtitle}
                    passeddata={data}
                />
                <FutureRunsEditPopup
                    show={showFutureEditPopup}
                    handleClose={handleFutureEditClosed}
                    data={editRow}
                />

                <FutureRunsPastEventsPopup
                    show={showAddPastEvents}
                    handleClose={handleAddPastEventClosed}
                />
                <div className='Future-Runs-Buttons'>
                    <button className='FRbutton' onClick={() => handleAddShow()}>
                        <div className="FRicon-wrapper">
                            <FontAwesomeIcon icon={faPlus} className="FRicon" />
                        </div>
                        <div className="FRtext">Add Event</div>
                    </button>
                    <button className='FRbutton' onClick={() => handleAddPastEventShow()}>
                        <div className="FRicon-wrapper">
                            <FontAwesomeIcon icon={faClockRotateLeft} className="FRicon" />
                        </div>
                        <div className="FRtext">Add Past Event</div>
                    </button>
                    <button className='FRbutton' onClick={() => navigate('/Updater')}>
                        <div className="FRicon-wrapper">
                            <FontAwesomeIcon icon={faArrowLeft} className="FRicon" />
                        </div>
                        <div className="FRtext">Go Back</div>
                    </button>
                </div>

                {/* Iterate through unique titles and create containers with tables */}
                {data && Array.from(new Set(data.map(item => item.title)))?.sort().map(title => (
                    <div className='future-Runs-Details-Container' key={title}>
                        <div className='Future-Runs-flexbox-item'>
                            <div className='future-Runs-Details-Title'>
                                {title}
                            </div>
                            <div className='future-Runs-Details-Title-2'>
                                {data && data.find(item => item.title === title)?.events && (
                                    <>
                                        {data.find(item => item.title === title)?.events[0] === 'running' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'green' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'down' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'red' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'no_production' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'blue' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'not_monitored' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'lightblue' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'detecting_state' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'grey' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'changeover' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'yellow' }} />
                                        )}
                                        {data.find(item => item.title === title)?.events[0] === 'break' && (
                                            <FontAwesomeIcon icon={faCircle} style={{ color: 'darkblue' }} />
                                        )}
                                        {!data.find(item => item.title === title)?.events[0] && (
                                            <FontAwesomeIcon icon={faCircle} />
                                        )}
                                        <p>|</p>
                                        {data.find(item => item.title === title)?.events[1]
                                            ?.replace(/_/g, ' ') // Replace underscores with spaces
                                            .toLowerCase()       // Convert to lowercase
                                            .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize first letter of each word
                                        }
                                    </>
                                )}
                            </div>
                            <div className='future-Runs-Details-Body'>
                                <ReactBootStrap.Table striped bordered hover>
                                    <thead>
                                        <tr className="header-row">
                                            <th style={{ width: '5%' }}>Order</th>
                                            <th>Part Number</th>
                                            <th>Pallets</th>
                                            <th>Remaining</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data
                                            .filter(rowData => rowData.title === title)
                                            .slice(0, 5) // Add this line to limit the rows to the first 5
                                            .map((rowData, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                                    <td onClick={() => handleFutureShow(title)}>{rowData.order}</td>
                                                    <td onClick={() => handleFutureShow(title)}>{rowData.part}</td>
                                                    <td onClick={() => handleFutureShow(title)}>{rowData.Pallets}</td>
                                                    <td onClick={() => handleFutureShow(title)}>{rowData.Remaining}</td>
                                                    <td>
                                                        {rowData.Editable ? (
                                                            <p className='futureeditdeletebutton' onClick={() => handleFutureEditShow(rowData)}>
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </p>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </ReactBootStrap.Table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FutureRuns;
