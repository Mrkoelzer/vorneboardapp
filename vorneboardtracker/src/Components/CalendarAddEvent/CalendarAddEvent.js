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
    const [selectedLine, setSelectedLine] = useState(null);
    const { localipaddr } = useContext(ipaddrcontext);
    const [partnumbers, setpartnumbers] = useState(null);
    const [selectedpartnumbers, setselectedpartnumbers] = useState(null);
    const [hidepartselect, sethidepartselect] = useState(true);

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
            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleinsertevent = async () => {
        let order = 0
        if(data.length>0){
            for(let i = 0; i<data.length; i++){
                if(data[i].title === selectedLine.value){
                    order++
                }
            }
        }


        let startTime = new Date(), endTime = new Date();
        let requestData = {
            start: startTime,
            end: endTime,
            title: selectedLine.value,
            part: selectedpartnumbers,
            state: 1,
            order: order,
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
                setSelectedLine(null)
                sethidepartselect(true)
                handleClose()
            }
            else {
            }
            // Handle the response as needed
            // Close the add modal
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlepartnumberchange = (e) => {
        setselectedpartnumbers(e)
    }

    const handleSelectChange = (selectedOptions) => {
        getPartNumbers(selectedOptions.value)
        setSelectedLine(selectedOptions);
    };

    const options = lines.map((line, index) => ({
        value: line.Linename,
        label: line.Linename,
    }));
    return (
        <div className={`Calendar-Popup-modal ${show ? "show" : ""}`}>
            <div className="Calendar-Popup-modal-popup">
                <div className="Calendar-Popup-modal-header">
                    <h2>Add Event</h2>
                </div>
                <div className="Calendar-Popup-modal-body">
                    Select Lines
                    <Select
                        className='Calendar-Add-Event-dropdown'
                        onChange={handleSelectChange}
                        value={selectedLine}
                        options={options}
                    />
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
                        </>
                    )}
                </div>
                <div className="Calendar-Popup-modal-footer">
                <button className="Calendar-Popup-button" onClick={() => {handleinsertevent()}}>
                        Save
                    </button>
                    <button className="Calendar-Popup-button" onClick={() => { handleClose(); setSelectedLine(null); sethidepartselect(true); setpartnumbers(null)}}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarAddEvent;
