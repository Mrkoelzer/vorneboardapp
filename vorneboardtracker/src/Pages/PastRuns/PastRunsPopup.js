import React, { useContext, useEffect, useState } from 'react';
import './PastRuns.css';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import * as ReactBootStrap from 'react-bootstrap';

function PastRunsPopup({ data, show, handleClose }) {
    const { localipaddr } = useContext(ipaddrcontext);
    const [remaining, setRemaining] = useState(null);
    const [pallets, setPallets] = useState(null);
    const [addLineMessage, setAddLineMessage] = useState('');
    const [selectedState, setSelectedState] = useState(0)

    useEffect(() => {
        setAddLineMessage('')
        setRemaining(data.Remaining)
        setPallets(data.Pallets)
        setSelectedState(data.state)
    }, [data]);

    const handleSelectedState = (e) => {
        setSelectedState(e)
        if (e === '0') {
            setAddLineMessage("Warning: Finishing a run will set remaining to 0 and WON'T be editable or useable in future runs.")
        }
        else {
            setAddLineMessage('')
        }
    }

    const handlesave = async () => {
        if (remaining !== data.Remaining || pallets !== data.Pallets || selectedState !== data.state) {
            let requesteddata;
            if (selectedState === '0') {
                requesteddata = {
                    event_id: data.event_History_id,
                    Remaining: 0,
                    Pallets: pallets,
                    state: selectedState
                }
            }
            else {
                requesteddata = {
                    event_id: data.event_History_id,
                    Remaining: remaining,
                    Pallets: pallets,
                    state: selectedState
                }
            }
            try {
                const response = await fetch(`http://${localipaddr}:1435/api/updatehistoryruns`, {
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
            handleClose()
        }
    };

    return (
        <div className={`PREvents-Popup-modal ${show ? "show" : ""}`}>
            <div className="PREvents-Popup-modal-popup">
                <div className="PREvents-Popup-modal-header">
                    <h2>Past Event</h2>
                    <h3>{data.part}</h3>
                </div>
                <div className="PREvents-Popup-modal-body">
                    {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                    <br />
                    Total Pallets
                    <input
                        className='PREvents-Pallets-Input'
                        type="text"
                        placeholder="Pallets"
                        value={pallets}
                        onChange={(e) => setPallets(e.target.value)}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                        readOnly={data.state === 0}
                    />
                    Remaining Pallets
                    <input
                        className='PREvents-Pallets-Input'
                        type="text"
                        placeholder="Remaining"
                        value={remaining}
                        onChange={(e) => setRemaining(e.target.value)}
                        onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                                event.preventDefault();
                            }
                        }}
                        readOnly={data.state === 0}
                    />
                </div>
                <ReactBootStrap.Form.Control
                    className='PastRunsDropdown'
                    as="select"
                    value={selectedState}
                    onChange={(e) => handleSelectedState(e.target.value)}
                    disabled={data.state === 0}
                >
                    <option key={0} value={0}>
                        Finished
                    </option>
                    <option key={1} value={1}>
                        Active
                    </option>
                    <option key={2} value={2}>
                        Pending
                    </option>
                </ReactBootStrap.Form.Control>
                <div className="PREvents-Popup-modal-footer">
                    {data.state !== 0 && (
                        <button className="PREvents-Popup-button" onClick={() => { handlesave() }}>
                            Save
                        </button>
                    )}
                    <button className="PREvents-Popup-button" onClick={() => { handleClose() }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PastRunsPopup;
