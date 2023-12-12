import React, { useContext, useEffect, useState } from 'react';
import '../../Components/CalendarAddEvent/CalendarAddEvent.css';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';

function FutureRunsEditPopup({ data, show, handleClose }) {
    const { localipaddr } = useContext(ipaddrcontext);
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        if (data !== null) {
            setRemaining(data.Remaining);
        }
    }, [data]); // Add data as a dependency to re-run the effect when data changes

    if (remaining === null) {
        // Return null or loading indicator while remaining is null
        return null;
    }

    const handlesave = async () => {
        if (remaining === data.Remaining) {
            handleClose()
        }
        else {
            let requesteddata = {
                event_id: data.event_id,
                Remaining: remaining
            }
            try {
                const response = await fetch(`http://${localipaddr}:1435/api/updatepallets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requesteddata),
                });

                if (!response.ok) {
                    throw new Error('Run Order Update Failed');
                }
                else{
                    handleClose()
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };


    return (
        <div className={`Calendar-Popup-modal ${show ? "show" : ""}`}>
            <div className="Calendar-Popup-modal-popup">
                <div className="Calendar-Popup-modal-header">
                    <h2>Edit Remaining Pallets</h2>
                </div>
                <div className="Calendar-Popup-modal-body">
                    Remaining Pallets
                    <input
                        className='Calendar-Pallets-Input'
                        type="text"
                        placeholder="Pallets"
                        value={remaining}
                        onChange={(e) => setRemaining(e.target.value)}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                    />
                </div>
                <div className="Calendar-Popup-modal-footer">
                    <button className="Calendar-Popup-button" onClick={() => { handlesave() }}>
                        Save
                    </button>
                    <button className="Calendar-Popup-button" onClick={() => { handleClose() }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FutureRunsEditPopup;
