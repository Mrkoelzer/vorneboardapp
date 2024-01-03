import React, { useContext, useEffect, useState } from 'react';
import './FutureRunsPastEventsPopup.css';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import * as ReactBootStrap from 'react-bootstrap';
import { linescontext } from '../../contexts/linescontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function FutureRunsPastEventsPopup({ show, handleClose }) {
    const { localipaddr } = useContext(ipaddrcontext);
    const { lines } = useContext(linescontext);
    const [addLineMessage, setAddLineMessage] = useState('');
    const [selectedtitle, setselectedtitle] = useState('Line 3');
    const [uniqueTitles, setUniqueTitles] = useState([]);
    const [futureruns, setfutureruns] = useState([]);
    const [data, setData] = useState([
        {
            event_History_id: Number,
            title: String,
            part: String,
            start: String,
            end: String,
            state: Number,
            Pallets: Number,
            Remaining: Number,
        }
    ]);

    useEffect(() => {
        getpastruns(lines);
    }, [show]);

    const getpastruns = async (data) => {
        const historyruns = await gethistoryruns();
        const futureruns = await getfutureruns();
        setfutureruns(futureruns)
        // Get the event_History_id values from futureruns
        const futurerunsEventIds = futureruns.map(run => run.event_id);

        // Filter historyruns based on the condition
        const filteredHistoryRuns = historyruns.filter(run => !futurerunsEventIds.includes(run.event_History_id));

        const filteredRemaining = filteredHistoryRuns.filter(run => run.Remaining !== 0);

        const filteredfinalruns = filteredRemaining.filter(run => !futureruns.some(futureRun => futureRun.part === run.part));
       
        const uniqueTitles = [...new Set(filteredfinalruns.map(run => run.title))];
        setUniqueTitles(uniqueTitles);

        setData(filteredfinalruns);
    }

    // Assuming you will call getpastruns somewhere in your code, like:
    // const result = await getpastruns(someData);


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

    const handleselectedtitle = (line) => {
        setselectedtitle(line);
    };

    const handleInsertEventIdentity = async (requestData) => {
        console.log(requestData);
    
        // Find the highest order for the given title in futureruns
        const highestOrder = Math.max(...futureruns
            .filter(run => run.title === requestData.title)
            .map(run => run.order), 0);
    
        // Set the order in requestData to be one greater than the highest order
        requestData.order = highestOrder + 1;
    
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/inserteventidentity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            const data = await response.json();
    
            if (data.eventadded) {
                requestData.state = 1
                requestData.event_id = requestData.event_History_id

                const response = await fetch(`http://${localipaddr}:1435/api/updatehistoryruns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            const updatedata = await response.json();
                if(updatedata.eventadded){
                    getpastruns()
                }
            } else {
                // Handle failure
            }
    
            // Additional handling as needed
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return (
        <div className={`PastRuns-Popup-modal ${show ? "show" : ""}`}>
            <div className="PastRuns-Popup-modal-popup">
                <div className="PastRuns-Popup-modal-header">
                    <h2>Add Past Events</h2>
                    <ReactBootStrap.Form.Control
                        className='linepagebutton'
                        as="select"
                        value={selectedtitle}
                        onChange={(e) => handleselectedtitle(e.target.value)}
                    >
                        {uniqueTitles
                            .sort((a, b) => a.localeCompare(b)) // Sort the titles
                            .map((title) => (
                                <option key={title} value={title}>
                                    {title}
                                </option>
                            ))}
                    </ReactBootStrap.Form.Control>

                </div>
                <div className="PastRuns-Popup-modal-body">
                    {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                    <ReactBootStrap.Table striped bordered hover>
                        <thead>
                            <tr className="header-row">
                                <th>Part Number</th>
                                <th>Pallets</th>
                                <th>Remaining</th>
                                <th>Add</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data
                                .filter(rowData => rowData.title === selectedtitle)
                                .map((rowData, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                        <td>{rowData.part}</td>
                                        <td>{rowData.Pallets}</td>
                                        <td>{rowData.Remaining}</td>
                                        <td className='userpageeditdeletebutton'><FontAwesomeIcon icon={faPlus} onClick={() => { handleInsertEventIdentity(rowData) }} /></td>
                                    </tr>
                                ))}
                        </tbody>
                    </ReactBootStrap.Table>
                </div>
                <div className="PastRuns-Popup-modal-footer">
                    <button className="PastRuns-Popup-button" onClick={() => { handleClose(); }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FutureRunsPastEventsPopup;
