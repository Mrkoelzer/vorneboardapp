import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import './PastRuns.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../../contexts/usercontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { faArrowLeft, faCheck, faGear, faTrashCan, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';
import { linescontext } from '../../contexts/linescontext';
import PastRunsPopup from './PastRunsPopup';

function PastRuns() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const { lines } = useContext(linescontext);
    const { localipaddr } = useContext(ipaddrcontext);
    const { settoolbarinfo } = useContext(Toolbarcontext)
    const [pastruns, setpastruns] = useState([]);
    const [showPopup, setshowPopup] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [selectedData, setSelctedData] = useState({
        event_History_id: 0,
        title: '',
        part: '',
        start: '',
        end: '',
        state: 0,
        Pallets: 0,
        Remaining: 0,
    });
    const [selectedtitle, setselectedtitle] = useState('Line 3');
    useEffect(() => {
        settoolbarinfo([{ Title: 'Vorne Past Runs' }])
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

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        gethistoryruns()
    }, []);


    const handlePopupOpen = (rowData) => {
        setSelctedData(rowData)
    };

    useEffect(() => {
        if (selectedData !== null && selectedData.event_History_id !== 0) {
            setshowPopup(true);
        }
        else {
            setshowPopup(false)
        }
    }, [selectedData]);

    const handlePopupClose = () => {
        setshowPopup(false);
        setSelctedData(
            {
                event_History_id: 0,
                title: '',
                part: '',
                start: '',
                end: '',
                state: 0,
                Pallets: 0,
                Remaining: 0,
            }
        );
        gethistoryruns();
    };

    const handleselectedtitle = (line) => {
        setselectedtitle(line);
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
                let pastruns = data.result.recordset
                //setData(data.result.recordset);
                setpastruns(pastruns)

            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getstate = (state) => {
        if (state === 0) {
            return `Finished`
        }
        else if (state === 1) {
            return `Active`;
        }
        else if (state === 2) {
            return 'Pending'
        }
    }

    const formatDateTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        const month = dateTime.getUTCMonth() + 1; // Months are 0-based
        const day = dateTime.getUTCDate();
        const year = dateTime.getUTCFullYear().toString().slice(-2);

        return `${month}/${day}/${year}`;
    };

    const filteredHistory = pastruns.filter((rowData) => {
        const searchText = searchValue.toLowerCase();
        return (
            (rowData.part && rowData.part.toLowerCase().includes(searchText))
            //(rowData.Ideal_Cycle_Time_s && typeof rowData.Ideal_Cycle_Time_s === 'string' && rowData.Ideal_Cycle_Time_s.toLowerCase().includes(searchText))
            // Add more fields as needed for searching
            // Example: ||
            // (rowData.OtherField && rowData.OtherField.toLowerCase().includes(searchText))
        );
    });

    return (
        <div className="userpage">
            <div className="userpagetable-container">
                <NotificationContainer />
                <div style={{ display: 'flex' }}>
                    <button className="userpagebutton" onClick={() => navigate('/Updater')}>
                        <div className="usericon-wrapper">
                            <FontAwesomeIcon icon={faArrowLeft} className="usericon" />
                        </div>
                        <div className="usertext">Go Back</div>
                    </button>
                </div>
                <div className='PastRuns-Filters'>
                    <ReactBootStrap.Form.Control
                        className='PastRunsDrop'
                        as="select"
                        value={selectedtitle}
                        onChange={(e) => handleselectedtitle(e.target.value)}
                    >
                        {lines.map((line) => (
                            <option key={line.Linename} value={line.Linename}>
                                {line.Linename}
                            </option>
                        ))}
                    </ReactBootStrap.Form.Control>
                    <input
                        className='PastRuns-search'
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <ReactBootStrap.Table striped bordered hover>
                    <thead>
                        <tr className="header-row">
                            <th style={{ width: '10%' }}>Part</th>
                            <th style={{ width: '10%' }}>Start</th>
                            <th style={{ width: '10%' }}>End</th>
                            <th style={{ width: '10%' }}>Pallets</th>
                            <th style={{ width: '10%' }}>Remaining</th>
                            <th style={{ width: '10%' }}>State</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHistory.filter(rowData => rowData.title === selectedtitle)
                            .map((rowData, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'} onClick={() => handlePopupOpen(rowData)}>
                                    <td>{rowData.part}</td>
                                    <td>{formatDateTime(rowData.start)}</td>
                                    <td>{formatDateTime(rowData.end)}</td>
                                    <td>{rowData.Pallets}</td>
                                    <td>{rowData.Remaining}</td>
                                    <td>{getstate(rowData.state)}</td>
                                </tr>
                            ))}
                    </tbody>
                </ReactBootStrap.Table>
            </div>
            <PastRunsPopup
                handleClose={handlePopupClose}
                show={showPopup}
                data={selectedData}
            />
        </div>
    );
}

export default PastRuns;
