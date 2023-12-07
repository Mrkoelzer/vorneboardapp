import React, { useContext, useEffect, useState } from 'react';
import './LineView.css';
import * as ReactBootStrap from 'react-bootstrap';
import { linescontext } from '../../contexts/linescontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import Axios from 'axios';

function NextJobsPopup({ show, handleClose, selectedline }) {
    const { lines, setlines } = useContext(linescontext);
    const { localipaddr } = useContext(ipaddrcontext);
    const [data, setData] = useState([
        {
            event_id: Number,
            title: String,
            part: String,
            start: String,
            end: String,
            order: Number,
            state: Number
        }
    ]);

    useEffect(() => {
        fetchruns()
    }, [show]);

    const fetchruns = async () => {
        if (lines.length === 0) {
            const storedLines = sessionStorage.getItem('lines');
            // Parse the retrieved string back into an array
            const parsedLines = storedLines ? JSON.parse(storedLines) : [];
            // Set the retrieved data into useState
            setlines(parsedLines);
            return getfutureruns(parsedLines)
        }
        else {
            return getfutureruns(lines)
        }
    }

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
                setData(data.result.recordset.filter(rowData => rowData.title === selectedline))

            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className={`FR-Popup-modal ${show ? 'show' : ''}`}>
            <div className="FR-Popup-modal-popup">
                <div className="FR-Popup-modal-header">
                    <h2>{selectedline} Next Jobs</h2>
                </div>
                <div className="FR-Popup-modal-body">
                    {data.length === 0 ? (
                        <h3 className='pdfpopuptext'>No Next Jobs</h3>
                    ) : (
                        <ReactBootStrap.Table striped bordered hover>
                            <thead>
                                <tr className="header-row">
                                    <th style={{ width: '5%' }}>Order</th>
                                    <th>Part Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data
                                    .filter(rowData => rowData.title === selectedline)
                                    .slice(0, 5) // Add this line to limit the rows to the first 5
                                    .map((rowData, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                            <td>{rowData.order}</td>
                                            <td>{rowData.part}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </ReactBootStrap.Table>
                    )}
                </div>

                <div className="Calendar-Popup-modal-footer">
                    <button className="Calendar-Popup-button" onClick={() => handleClose()}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NextJobsPopup;
