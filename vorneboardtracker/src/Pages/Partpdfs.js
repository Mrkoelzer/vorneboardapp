import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/partpdfs.css';
import Toolbar from '../Components/Partpdfstoobar';
import { linescontext } from '../contexts/linescontext';
import { usercontext } from '../contexts/usercontext';
import * as ReactBootStrap from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import Axios from 'axios';
import { ipaddrcontext } from '../contexts/ipaddrcontext';

function Partpdfs() {
    const navigate = useNavigate();
    const { lines } = useContext(linescontext);
    const [updatedlines, setupdatedlines] = useState([]);
    const [pdfs, setpdfs] = useState([]);
    const { userdata } = useContext(usercontext);
    const [selectedline, setselectedline] = useState(0);
    const [allpartnumbers, setallpartnumbers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(""); // Initialize with an empty string
    const [showEditModal, setshowEditModal] = useState(false);
    const [addLineMessage, setAddLineMessage] = useState('');
    const { localipaddr } = useContext(ipaddrcontext);
    const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
    const [editedData, setEditedData] = useState([]);
    const [ChangeAll, setChangeAll] = useState(false);

    const AllLines = [
        {
            "lineid": -1, // Set a unique lineid or identifier for "All Lines"
            "Linename": "All Lines",
            "ipaddress": "", // You can set this to an appropriate value if needed
            "packline": 0, // You can set this to an appropriate value if needed
            "extruder": 0  // You can set this to an appropriate value if needed
        }
    ];

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        const combinedLines = [...AllLines, ...lines];
        setupdatedlines(combinedLines);
        getparts()
        fetchpdfs()
        setIsLoading(false);
    }, [selectedline]);

    function getselectedline(index) {
        setselectedline(index)
    }
    const handleEditClick = (linename, partid) => {
        setAddLineMessage('');
        for (let i = 0; i < allpartnumbers.length; i++) {
            if (linename === allpartnumbers[i].linename && partid === allpartnumbers[i].part_id) {
                setEditedData(allpartnumbers[i])
            }
        }
        setshowEditModal(true);
    };
    const closeEditModal = () => {
        setshowEditModal(false);
        setChangeAll(false)
    };

    function getparts() {
        if (selectedline === 0) {
            getallpartnumbers()
        }
        else {
            getpartnumbers()
        }
    }

    const getallpartnumbers = async () => {
        try {
            // Send a POST request to the backend with the query in the request body
            const response = await fetch(`http://${localipaddr}:1435/api/getalllinepartnumbers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setallpartnumbers(data.result.recordset);
            } else {
                console.error('Failed to retrieve data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getpartnumbers = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getlinepartnumberspdf?linename=${encodeURIComponent(updatedlines[selectedline].Linename)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setallpartnumbers(data.result.recordset)
            } else {
                console.error('Request failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchpdfs = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getpdfs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                setpdfs(data.result.recordset);
            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const changelinkedpdf = async () => {
        if (ChangeAll) {
            changelinkedpdfAll()
        }
        else {
            changelinkedpdfOne()
        }
    }
    const changelinkedpdfAll = async () => {
        try {
            const requestData = {
                pdfname: pdfs[selectedPdfIndex].pdfname,
                pdf_id: pdfs[selectedPdfIndex].pdf_id,
                part_id: editedData.part_id
            };
            // Send a POST request to the backend with the query in the request body
            const response = await fetch(`http://${localipaddr}:1435/api/changelinkedpdfAll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.pdfupdated) {
                    getparts();
                    closeEditModal()
                }
            } else {
                console.error('Failed to retrieve data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const changelinkedpdfOne = async () => {
        try {
            const requestData = {
                pdfname: pdfs[selectedPdfIndex].pdfname,
                pdf_id: pdfs[selectedPdfIndex].pdf_id,
                part_id: editedData.part_id,
                linename: editedData.linename
            };
            // Send a POST request to the backend with the query in the request body
            const response = await fetch(`http://${localipaddr}:1435/api/changelinkedpdfOne`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.pdfupdated) {
                    getparts();
                    closeEditModal()
                }
            } else {
                console.error('Failed to retrieve data');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Filtered part numbers based on the searchValue
    const filteredPartNumbers = allpartnumbers.filter((rowData) => {
        const searchText = searchValue.toLowerCase();
        return (
            (rowData.part_id && rowData.part_id.toLowerCase().includes(searchText)) ||
            (rowData.pdfname && rowData.pdfname.toLowerCase().includes(searchText))
            //(rowData.Ideal_Cycle_Time_s && typeof rowData.Ideal_Cycle_Time_s === 'string' && rowData.Ideal_Cycle_Time_s.toLowerCase().includes(searchText))
            // Add more fields as needed for searching
            // Example: ||
            // (rowData.OtherField && rowData.OtherField.toLowerCase().includes(searchText))
        );
    });

    useEffect(() => {
        // Find the index of the matching pdfname in pdfs
        const initialSelectedIndex = pdfs.findIndex((pdf) => pdf.pdfname === editedData.pdfname);
        // Set the selectedPdfIndex state to the initialSelectedIndex
        if (initialSelectedIndex !== -1) {
            setSelectedPdfIndex(initialSelectedIndex);
        }
    }, [editedData, pdfs]);

    return (
        <div className='partpdfpage'>
            <div>
                <Toolbar />
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <div className='partpdfs-flexbox-container'>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <select className='partpdfs-inputs' onChange={(e) => getselectedline(e.target.selectedIndex)}>
                                {updatedlines.map((line, index) => (
                                    <option key={index} value={line.Linename}>
                                        {line.Linename}
                                    </option>
                                ))}
                            </select>
                            <input
                                className='partpdfs-search'
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                        <div className="partpdfstable-container">
                            <br />
                            <ReactBootStrap.Table striped bordered hover>
                                <thead>
                                    <tr className="header-row">
                                        <th>Line</th>
                                        <th>Part ID</th>
                                        <th>PDF Name</th>
                                        <th>PDF</th>
                                        <th>Edit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPartNumbers.map((rowData, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                            <td>{rowData.linename}</td>
                                            <td>{rowData.part_id}</td>
                                            <td>{rowData.pdfname}</td>
                                            <td>
                                                {rowData.pdfname === 'No PDF Assigned' ? (
                                                    <FontAwesomeIcon icon={faTimes} /> // Display X if PDF is 'No PDF Assigned'
                                                ) : rowData.pdfname ? (
                                                    <FontAwesomeIcon icon={faCheck} /> // Display checkmark if PDF exists
                                                ) : (
                                                    'Checking...' // Display a loading message while checking
                                                )}
                                            </td>
                                            <td><p className='ppeditdeletebutton' onClick={() => handleEditClick(rowData.linename, rowData.part_id)}><FontAwesomeIcon icon={faGear} /></p></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </ReactBootStrap.Table>
                        </div>
                    </div>
                )}
                {showEditModal && (
                    <div className="ppedit-modal">
                        <div className="ppedit-popup">
                            <button className="ppmodal-close-button" onClick={closeEditModal}>
                                X
                            </button>
                            <h2>Edit Linked PDF</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            <div className='ppflexbox-item'>
                                Part ID: {editedData.part_id}
                                <br />
                                Line: {editedData.linename}
                                <select
                                    className='partpdfs-inputs'
                                    value={pdfs[selectedPdfIndex]?.pdfname}
                                    onChange={(e) => setSelectedPdfIndex(e.target.selectedIndex)}
                                >
                                    {pdfs.map((pdf, index) => (
                                        <option key={index} value={pdf.pdfname}>
                                            {pdf.pdfname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input checked={ChangeAll} className="createaccount-checkbox" type="checkbox" onChange={(e) => setChangeAll(e.target.checked)} />
                            Change All Parts
                            <br />
                            <br />
                            <button className="modalbutton" onClick={changelinkedpdf}>
                                Save
                            </button>
                            <button className="modalbutton" onClick={closeEditModal}>
                                Cancel
                            </button>
                            {/* Display the message */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Partpdfs;
