import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select'
import '../Css/CalendarPopup.css';
import moment from 'moment';
import { linescontext } from '../contexts/linescontext';

function CalendarAddEvent({ data, show, handleClose, handleDelete }) {
    const { lines, setlines } = useContext(linescontext);
    const [selectedLine, setSelectedLine] = useState(null);

    const handleSelectChange = (selectedOptions) => {
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
                    <h2>Add/Edit Event</h2>
                </div>
                <div className="Calendar-Popup-modal-body">
                    Select Lines
                    <Select
                        className='Calendar-Add-Event-dropdown'
                        onChange={handleSelectChange}
                        value={selectedLine}
                        options={options}
                    />
                </div>
                <div className="Calendar-Popup-modal-footer">
                    <button className="Calendar-Popup-button" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CalendarAddEvent;
