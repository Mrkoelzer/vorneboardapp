import React, { useContext, useEffect, useState } from 'react';
import './PastRuns.css';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import * as ReactBootStrap from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons';
import DeleteConfirmation from '../../Components/DeleteConfirmation/DeleteConfirmation';
import { NotificationContainer, NotificationManager } from 'react-notifications';

function PastRunsPopup({ data, show, handleClose }) {
    const { localipaddr } = useContext(ipaddrcontext);
    const [remaining, setRemaining] = useState(null);
    const [pallets, setPallets] = useState(null);
    const [addLineMessage, setAddLineMessage] = useState('');
    const [finished, setFinished] = useState(0);
    const [selectedState, setSelectedState] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    useEffect(() => {
        setAddLineMessage('')
        setRemaining(data.Remaining)
        setPallets(data.Pallets)
        console.log('here')
        if(data.state === 0){
            setFinished(true)
        }
        else{
            setFinished(false)
        }
    }, [data]);

    const handleSelectedState = (e) => {
        setSelectedState(e)
        if (e === true) {
            setFinished(true)
            setAddLineMessage("Warning: Finishing a run will set remaining to 0 and WON'T be editable or useable in future runs.")
        }
        else {
            setFinished(false)
            setAddLineMessage('')
        }
    }

    const handlesave = async () => {
        if (remaining !== data.Remaining || pallets !== data.Pallets || selectedState !== data.state) {
            let requesteddata;
            if (selectedState === true) {
                requesteddata = {
                    event_id: data.event_History_id,
                    Remaining: 0,
                    Pallets: pallets,
                    state: 0,
                    end: new Date()
                }
            }
            else {
                requesteddata = {
                    event_id: data.event_History_id,
                    Remaining: remaining,
                    Pallets: pallets,
                    state: data.state,
                    end: data.end
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

    const handleDelete = async () => {
        try {
            let event_History_id = data.event_History_id
            const response = await fetch(`http://${localipaddr}:1435/api/deletehistoryevent`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event_History_id }), // Pass the id in the request body
            });

            // Handle response
            if (response.ok) {
                // Line deleted successfully
                NotificationManager.success(`Delete Successful!`)
                handleClose()
                handleClosed()
            } else {
                NotificationManager.error('Deleted Failed')
                console.error('Delete failed');
            }
        } catch (error) {
            NotificationManager.error('Deleted Failed')
            console.error('Error:', error);
        }
    };

    const getstate = (info) => {
        if(info === 0){
            return 'Finished'
        }
        else if(info === 1){
            return 'Active'
        }
        else{
            return 'Pending'
        }
    };

    const handleDeleteConfirmation = async () => {
        setShowDeleteConfirmation(true)
    }
    const handleClosed = () => {
        setShowDeleteConfirmation(false);
    };
    return (
        <div className={`PREvents-Popup-modal ${show ? "show" : ""}`}>
            <div className="PREvents-Popup-modal-popup">
                <div className="PREvents-Popup-modal-header">
                    <h2>Past Event</h2>
                    <h3>{data.part}</h3>
                    <h3>State: {getstate(data.state)}</h3>
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
                <button className={`PastRunsFinishedButton ${finished ? "finished" : ""}`}
                 onClick={() => { handleSelectedState(!finished) }} 
                 hidden={data.state != 2}>
                    Finished
                </button>
                <div className="PREvents-Popup-modal-footer">
                    {data.state !== 0 && (
                        <button className="PREvents-Popup-button" onClick={() => { handlesave() }}>
                            <div className="PastRunsicon-wrapper">
                                <FontAwesomeIcon icon={faCheck} className="PastRunsicon" />
                            </div>
                            <div className="PastRunstext">Save</div>
                        </button>
                    )}
                    <button className="PREvents-Popup-button" onClick={() => { handleClose() }}>
                        <div className="PastRunsicon-wrapper">
                            <FontAwesomeIcon icon={faXmark} className="PastRunsicon" />
                        </div>
                        <div className="PastRunstext">Close</div>
                    </button>
                </div>
                {data.state !== 0 && data.state !== 1 && (
                    <div className="PREvents-Popup-modal-footer">
                        <button className="PastRunsbutton" onClick={() => handleDeleteConfirmation()}>
                            <div className="PastRunsicon-wrapper">
                                <FontAwesomeIcon icon={faTrashCan} className="PastRunsicon" />
                            </div>
                            <div className="PastRunstext">Delete</div>
                        </button>
                    </div>
                )}
            </div>
            <DeleteConfirmation
                show={showDeleteConfirmation}
                handleDelete={handleDelete}
                handleClose={handleClosed}
                message={`Are you sure you want to Part: ${data.part} from History on ${data.title}?`}
            />
        </div>
    );
}

export default PastRunsPopup;
