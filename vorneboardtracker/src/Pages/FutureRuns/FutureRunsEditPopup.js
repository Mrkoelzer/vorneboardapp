import React, { useContext, useEffect, useState } from 'react';
import '../../Components/CalendarAddEvent/CalendarAddEvent.css';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';

function FutureRunsEditPopup({ data, show, handleClose }) {
    const { localipaddr } = useContext(ipaddrcontext);
    const [remaining, setRemaining] = useState(null);
    const [pallets, setPallets] = useState(null);
    const [addLineMessage, setAddLineMessage] = useState('');

    useEffect(() => {
        if (data !== null) {
            if(data.Remaining){
                setRemaining(data.Remaining);
            }
            else{
                setRemaining(0)
            }
            if(data.Pallets){
                setPallets(data.Pallets)
            }
            else{
                setPallets(0)
            }
        }
    }, [data]); // Add data as a dependency to re-run the effect when data changes

    if (remaining === null) {
        // Return null or loading indicator while remaining is null
        return null;
    }

    const handlesave = async () => {
        if (remaining !== data.Remaining || pallets !== data.Pallets) {
            let requesteddata = {
                event_id: data.event_id,
                Remaining: remaining,
                Pallets: pallets
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
                else {
                    handleClose()
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
        else {
            setPallets(null)
            setRemaining(null)
            handleClose()
        }
    };

    return (
        <div className={`Calendar-Popup-modal ${show ? "show" : ""}`}>
            <div className="Calendar-Popup-modal-popup">
                <div className="Calendar-Popup-modal-header">
                    <h2>Edit Pallets</h2>
                    <h3>{data && data.title !== null ? data.title : ''}</h3>
                </div>
                <div className="Calendar-Popup-modal-body">
                    {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                    <br />
                    Total Pallets
                    <input
                        className='Calendar-Pallets-Input'
                        type="text"
                        placeholder="Pallets"
                        value={pallets}
                        onChange={(e) => setPallets(e.target.value)}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                    />
                    Remaining Pallets
                    <input
                        className='Calendar-Pallets-Input'
                        type="text"
                        placeholder="Remaining"
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
                    <button className="Calendar-Popup-button" onClick={() => { handleClose(); setRemaining(null); setPallets(null) }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FutureRunsEditPopup;
