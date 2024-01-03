import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select'
import './CalendarAddEvent.css';
import moment from 'moment';
import { linescontext } from '../../contexts/linescontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import * as ReactBootStrap from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark, faCircleInfo, faCircle, faCalendarDays, fa1, faTimeline, faPlay, faStop, faMugSaucer, faDownLong, faPenToSquare } from '@fortawesome/free-solid-svg-icons';


function CalendarAddEvent({ defaultdate, data, show, handleClose, handleDelete }) {
    const { lines, setlines } = useContext(linescontext);
    const [selectedLine, setSelectedLine] = useState('Line 3');
    const { localipaddr } = useContext(ipaddrcontext);
    const [partnumbers, setpartnumbers] = useState(null);
    const [totalPallets, setTotalPallets] = useState(null);
    const [selectedpartnumbers, setselectedpartnumbers] = useState(null);
    const [hidepartselect, sethidepartselect] = useState(true);
    const [addLineMessage, setAddLineMessage] = useState('');

    useEffect(() => {
        getPartNumbers(selectedLine)
    }, [show]);

    const getPartNumbers = async (tableName) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getlinepart/${tableName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                setselectedpartnumbers(data.result.recordset[0].Part_ID)
                setpartnumbers(data.result.recordset);
                sethidepartselect(false)
                setAddLineMessage('')
            } else {
                console.log('error');
            }
        } catch (error) {
            //console.error('Error:', error);
            setAddLineMessage("No Parts")
            sethidepartselect(true)
        }
    };

    const getMaxIdentity = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getMaxIdentity`);
            const data = await response.json();
            const maxIdentity = data.maxIdentity;
            return maxIdentity;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleinsertevent = async () => {
        if (totalPallets === null) {
            setAddLineMessage('Pallets Must Have a Value')
        }
        else {
            let order = 0
            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].title === selectedLine) {
                        order++
                    }
                }
            }
            let startTime = new Date(), endTime = new Date();
            let requestData = {
                start: startTime,
                end: endTime,
                title: selectedLine,
                part: selectedpartnumbers,
                state: 1,
                order: order,
                Pallets: totalPallets,
                Remaining: totalPallets
            };
            try {
                const eventResponse = await fetch(`http://${localipaddr}:1435/api/insertevent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const eventData = await eventResponse.json();

                if (eventData.eventadded) {
                    // Insert event history
                    let id = await getMaxIdentity()
                    const requestDataHistory = {
                        event_History_id: id,
                        ...requestData,
                    };

                    const eventHistoryResponse = await fetch(`http://${localipaddr}:1435/api/inserteventhistory`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestDataHistory),
                    });

                    const dataHistory = await eventHistoryResponse.json();

                    if (dataHistory.eventhistoryadded) {
                        // Reset state and close modal
                        setSelectedLine('Line 3');
                        sethidepartselect(true);
                        setTotalPallets(null);
                        handleClose();
                    }
                } else {
                    // Handle case where event was not added
                    console.error('Event not added:', eventData);
                }

            } catch (error) {
                console.error('Error:', error);
            }
        };
    };

    const handlepartnumberchange = (e) => {
        setselectedpartnumbers(e)
    }

    const handleSelectChange = (selectedOptions) => {
        getPartNumbers(selectedOptions)
        setSelectedLine(selectedOptions);
    };

    return (
        <div className={`Calendar-Popup-modal ${show ? "show" : ""}`}>
            <div className="Calendar-Popup-modal-popup">
                <div className="Calendar-Popup-modal-header">
                    <h2>Add Event</h2>
                </div>
                {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                <div className="Calendar-Popup-modal-body">
                    Select Lines
                    <ReactBootStrap.Form.Control
                        className='Calendar-Add-Event-dropdown'
                        as="select"
                        onChange={(e) => handleSelectChange(e.target.value)}
                        value={selectedLine}
                    >
                    {lines.map((line) => (
                            <option key={line.Linename} value={line.Linename}>
                                {line.Linename}
                            </option>
                        ))}
                    </ReactBootStrap.Form.Control>
                    <br />
                    {hidepartselect ? (
                        <p></p>
                    ) : (
                        <>
                            Select Part Number
                            <ReactBootStrap.Form.Control
                                className='Calendar-Add-part-Event-dropdown'
                                as="select"
                                value={selectedpartnumbers}
                                onChange={(e) => handlepartnumberchange(e.target.value)}
                            >
                                {partnumbers.map((item) => (
                                    <option key={item.Part_ID} value={item.Part_ID}>
                                        {item.Part_ID}
                                    </option>
                                ))}
                                {/* Add more options here */}
                            </ReactBootStrap.Form.Control>
                            <br />
                            <br />
                            Total Pallets
                            <input className='Calendar-Pallets-Input'
                                type="text"
                                placeholder="Pallets"
                                value={totalPallets}
                                onChange={(e) => setTotalPallets(e.target.value)}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                            />
                        </>
                    )}
                </div>
                <div className="Calendar-Popup-modal-footer">
                    <button className="Calendar-Popup-button" onClick={() => { handleinsertevent() }}>
                        Save
                    </button>
                    <button className="Calendar-Popup-button" onClick={() => { handleClose(); setSelectedLine('Line 3'); sethidepartselect(true); setpartnumbers(null); setTotalPallets(null) }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarAddEvent;
