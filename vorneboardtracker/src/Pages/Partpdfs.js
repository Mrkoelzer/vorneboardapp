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
    const { userdata } = useContext(usercontext);
    const [selectedline, setselectedline] = useState(0);
    const [partnumbers, setpartnumbers] = useState([]);
    const [allpartnumbers, setallpartnumbers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(""); // Initialize with an empty string
    const [showEditModal, setshowEditModal] = useState(false);
    const [addLineMessage, setAddLineMessage] = useState('');
    const { localipaddr } = useContext(ipaddrcontext);
    const [editlines, seteditlines] = useState([])

    const [editedData, setEditedData] = useState({
        Linename: '',
        oldPart_ID: '',
        Part_ID: '',
        Alternate_Part_ID: '',
        Ideal_Cycle_Time_s: 5,
        Takt_Time_s: 6,
        Target_Labor_per_Piece_s: 30,
        Down_s: 60,
        Count_Multiplier_1: 1,
        Count_Multiplier_2: 1,
        Count_Multiplier_3: 1,
        Count_Multiplier_4: 1,
        Count_Multiplier_5: 1,
        Count_Multiplier_6: 1,
        Count_Multiplier_7: 1,
        Count_Multiplier_8: 1,
        Target_Multiplier: 1,
        Start_with_Changeover: 'No',
        The_changeover_Reason_is: 'Part Change',
        Set_a_target_time_of_s: '0',
        End_Event: 'By Barcode'
    });

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
        setIsLoading(false);
    }, [selectedline]);

    const checkeditpart = () => {
        if (editedData.Part_ID.trim() === "") {
            setAddLineMessage('Part ID is blank')
            return;
        }
        if (editedData.Alternate_Part_ID.trim() === "") {
            setAddLineMessage('Alternate Part ID is blank')
            return
        }
        if (editedData.Ideal_Cycle_Time_s === "") {
            setAddLineMessage('Ideal Cycle Time is blank')
            return
        }
        if (editedData.Takt_Time_s === "") {
            setAddLineMessage('Takt Time is blank')
            return
        }
        if (editedData.Target_Labor_per_Piece_s === "") {
            setAddLineMessage('Target labor Per Piece is blank')
            return
        }
        if (editedData.Down_s === "") {
            setAddLineMessage('Down(s) is blank')
            return
        }
        if (editedData.Ideal_Cycle_Time_s === '0') {
            setAddLineMessage(`Ideal Cycle Time Can't Be 0`)
            return
        }
        if (parseFloat(editedData.Takt_Time_s) < parseFloat(editedData.Ideal_Cycle_Time_s)) {
            setAddLineMessage(`The Takt Time must be greater than or equal to Ideal Cycle Time`)
            return
        }
        if (parseFloat(editedData.Down_s) <= 0) {
            setAddLineMessage(`Down(s) Can't Equal To 0 or Be Less Than 0`)
            return
        }
        updatepartnumbers();
    };

    const updatepartnumbers = async () => {
        try {
            // Send a POST request to insert the new part
            const response = await fetch(`http://${localipaddr}:1435/api/updatepartnumber`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            if (response.ok) {
                getparts();
                setAddLineMessage('');
                closeEditModal();
                console.log('Part Updated successfully');
            } else {
                console.error('Failed to Update part');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function getselectedline(index) {
        setselectedline(index)
    }
    const handleEditClick = (index, partid) => {
        setAddLineMessage('');
        geteditlines(partid)
        setEditedData(partnumbers[index])
        setEditedData((prevData) => ({
            ...prevData,
            Linename: lines[selectedline].Linename, // Assuming 'selectedline' contains the new value
            oldPart_ID: partid
        }));
        setshowEditModal(true);

    };
    const closeEditModal = () => {
        seteditlines([])
        setshowEditModal(false);
        setEditedData({
            Linename: '',
            oldPart_ID: '',
            Part_ID: '',
            Alternate_Part_ID: '',
            Ideal_Cycle_Time_s: 5,
            Takt_Time_s: 6,
            Target_Labor_per_Piece_s: 30,
            Down_s: 60,
            Count_Multiplier_1: 1,
            Count_Multiplier_2: 1,
            Count_Multiplier_3: 1,
            Count_Multiplier_4: 1,
            Count_Multiplier_5: 1,
            Count_Multiplier_6: 1,
            Count_Multiplier_7: 1,
            Count_Multiplier_8: 1,
            Target_Multiplier: 1,
            Start_with_Changeover: 'No',
            The_changeover_Reason_is: 'Part Change',
            Set_a_target_time_of_s: '0',
            End_Event: 'By Barcode'
        })
    };

    function getparts(){
        if(selectedline === 0){
            getallpartnumbers()
        }
        else{
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

    function geteditlines(id) {
        const newEditLines = [...editlines]; // Create a copy of the existing array

        for (let i = 0; i < allpartnumbers.length; i++) {
            if (allpartnumbers[i].Part_ID === id) { // Use '===' for comparison, not '='
                newEditLines.push(allpartnumbers[i].Line_Name); // Add the new value to the copied array
            }
        }

        seteditlines(newEditLines); // Update the state with the new array
    }
    const lineLabels = editlines.map((line, index) => `${line}`).join(', ');

    return (
        <div className='partpdfpage'>
            <div>
                <Toolbar />
                <div className='partpdfs-flexbox-container'>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div>
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
                            <div className="partpdfstable-container">
                                <ReactBootStrap.Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Line</th>
                                            <th>Part ID</th>
                                            <th>PDF Name</th>
                                            <th>PDF</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPartNumbers.map((rowData, index) => (
                                            <tr key={index}>
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
                                                <td><button className='ppeditdeletebutton' onClick={() => handleEditClick(index, rowData.Part_ID)}>
                                                    <FontAwesomeIcon icon={faGear} />
                                                </button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </ReactBootStrap.Table>
                            </div>
                        </div>
                    )}
                </div>
                {showEditModal && (
                    <div className="ppedit-modal">
                        <div className="ppedit-popup">
                            <button className="ppmodal-close-button" onClick={closeEditModal}>
                                X
                            </button>
                            <h2>Edit Part</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            <div className='ppflexbox-item'>
                                This Part ID is in
                                <p>{lineLabels}</p>
                            </div>
                            <div className='ppflexbox-item'>
                                Part ID
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Part ID"
                                    value={editedData.Part_ID}
                                    onChange={(e) => setEditedData({ ...editedData, Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='ppflexbox-item'>
                                Alternate Part ID
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Alternate Part ID"
                                    value={editedData.Alternate_Part_ID}
                                    onChange={(e) => setEditedData({ ...editedData, Alternate_Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='ppflexbox-item'>
                                Ideal Cycle Time (s)
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Ideal Cycle Time"
                                    value={editedData.Ideal_Cycle_Time_s}
                                    onChange={(e) => setEditedData({ ...editedData, Ideal_Cycle_Time_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            Takt Time(s)
                            <div className='ppflexbox-item'>
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Takt Time(s)"
                                    value={editedData.Takt_Time_s}
                                    onChange={(e) => setEditedData({ ...editedData, Takt_Time_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className='ppflexbox-item'>
                                Target Laber Per Piece(s)
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Target labor per Piece(s)"
                                    value={editedData.Target_Labor_per_Piece_s}
                                    onChange={(e) => setEditedData({ ...editedData, Target_Labor_per_Piece_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className='ppflexbox-item'>
                                Down(s)
                                <input
                                    className='partpdfs-add-input'
                                    type="text"
                                    placeholder="Down(s)"
                                    value={editedData.Down_s}
                                    onChange={(e) => setEditedData({ ...editedData, Down_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <br />
                            <button className="modalbutton" onClick={checkeditpart}>
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
