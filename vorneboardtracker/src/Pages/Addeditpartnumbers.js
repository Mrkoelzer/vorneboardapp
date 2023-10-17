import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Addeditpartnumbers.css';
import Toolbar from '../Components/AddeditpartsToolbar';
import { linescontext } from '../contexts/linescontext';
import { usercontext } from '../contexts/usercontext';
import * as ReactBootStrap from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrashCan, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
//import Axios from 'axios';
import Select from 'react-select'
import { ipaddrcontext } from '../contexts/ipaddrcontext';

function Addeditpartnumbers() {
    const navigate = useNavigate();
    const { lines } = useContext(linescontext);
    const { userdata } = useContext(usercontext);
    const [selectedline, setselectedline] = useState(0);
    const [partnumbers, setpartnumbers] = useState([]);
    const [allpartnumbers, setallpartnumbers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(""); // Initialize with an empty string
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setshowEditModal] = useState(false);
    const [addLineMessage, setAddLineMessage] = useState('');
    const { localipaddr } = useContext(ipaddrcontext);
    const [editlines, seteditlines] = useState([])
    const [newData, setNewData] = useState({
        Linename: '',
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
    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        getallpartnumbers()
        getpartnumbers()
        setIsLoading(false);
    }, [selectedline]);

    const checkaddpart = () => {
        if (newData.Part_ID.trim() === "") {
            setAddLineMessage('Part ID is blank')
            return;
        }
        if (newData.Alternate_Part_ID.trim() === "") {
            setAddLineMessage('Alternate Part ID is blank')
            return
        }
        if (newData.Ideal_Cycle_Time_s === "") {
            setAddLineMessage('Ideal Cycle Time is blank')
            return
        }
        if (newData.Takt_Time_s === "") {
            setAddLineMessage('Takt Time is blank')
            return
        }
        if (newData.Target_Labor_per_Piece_s === "") {
            setAddLineMessage('Target labor Per Piece is blank')
            return
        }
        if (newData.Down_s === "") {
            setAddLineMessage('Down(s) is blank')
            return
        }
        if (newData.Ideal_Cycle_Time_s === '0') {
            setAddLineMessage(`Ideal Cycle Time Can't Be 0`)
            return
        }
        if (parseFloat(newData.Takt_Time_s) < parseFloat(newData.Ideal_Cycle_Time_s)) {
            setAddLineMessage(`The Takt Time must be greater than or equal to Ideal Cycle Time`)
            return
        }
        if (parseFloat(newData.Down_s) <= 0) {
            setAddLineMessage(`Down(s) Can't Equal To 0 or Be Less Than 0`)
            return
        }
        addnewpartnumbers();
    };

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

    const handledelete = async (id) => {
        let linename = lines[selectedline].Linename
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/deletepartnumber`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ linename, id }), // Send linename in the request body
            });

            // Handle response
            if (response.ok) {
                handlepartpdfdelete(id);
                getpartnumbers()
            } else {
                console.error('Delete failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlepartpdfdelete = async (id) => {
        let linename = lines[selectedline].Linename
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/deletepartpdf`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ linename, id }), // Send linename in the request body
            });

            // Handle response
            if (response.ok) {
                getallpartnumbers();
            } else {
                console.error('Delete failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    function addpartreset() {
        setNewData({
            Linename: lines[selectedline].Linename,
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
        setSelectedLines([])
    }

    const addNewParttopartpdf = async (data) => {
        try {
            // Send a POST request to insert the new part
            const response = await fetch(`http://${localipaddr}:1435/api/insertnewpartpartpdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log('Part added to PartPDF successfully');
            } else {
                console.error('Failed to add part');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    let passed = false;
    const addNewPartWithLine = async (lineSelected) => {
        // Create a copy of newData with the selected line
        const updatedData = {
            ...newData,
            Linename: lineSelected,
        };
        for (let i = 0; i < allpartnumbers.length; i++) {
            if (updatedData.Part_ID === allpartnumbers[i].part_id && updatedData.Linename === allpartnumbers[i].linename) {
                console.log(updatedData.Linename)
                passed = false
                setAddLineMessage(`Duplicate Part ID in ${allpartnumbers[i].linename}`)
                return
            }
        }
        try {
            // Send a POST request to insert the new part
            const response = await fetch(`http://${localipaddr}:1435/api/insertnewpart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                passed = true
                addNewParttopartpdf(updatedData);
                console.log('Part added successfully');
            } else {
                console.error('Failed to add part');
            }
        } catch (error) {
            console.error('Error:', error);
        }
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
                getpartnumbers();
                getallpartnumbers();
                setAddLineMessage('');
                if(editedData.part_id !== editedData.oldPart_ID){
                    updatepartpdfpartnumbers();
                }
                closeEditModal();
                console.log('Part Updated successfully');
            } else {
                console.error('Failed to Update part');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    
    const updatepartpdfpartnumbers = async () => {
        const updatedData = {
            ...editedData,
            Linename: lines[selectedline].Linename,
        };
        console.log(updatedData)
        try {
            // Send a POST request to insert the new part
            const response = await fetch(`http://${localipaddr}:1435/api/updatepartpdfpartnumber`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                console.log('PartPDF Updated successfully');
            } else {
                console.error('Failed to Update part');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Function to add new parts for selected lines
    const addNewPartsForSelectedLines = async () => {
        for (const lineSelected of selectedLines) {
            // Call addNewPartWithLine to add a part for each selected line
            await addNewPartWithLine(lineSelected);
        }

        // After adding all parts, perform other actions (getpartnumbers, reset, close modal, etc.)
        if (passed === true) {
            getpartnumbers();
            getallpartnumbers();
            setAddLineMessage('');
            addpartreset();
            closeAddModal();
        }
    };

    // Function to handle the save button click
    const addnewpartnumbers = () => {
        // Check if selectedLines is empty
        if (selectedLines.length === 0) {
            setAddLineMessage('Please select at least one line.');
        } else {
            // Call the function to add new parts for selected lines
            addNewPartsForSelectedLines();
        }
    };

    function getselectedline(index) {
        setselectedline(index)
    }

    const handleAddClick = () => {
        setShowAddModal(true);
        setAddLineMessage('');
    };
    const handleEditClick = (index, partid) => {
        setAddLineMessage('');
        geteditlines(partid)
        for(let i = 0; i < partnumbers.length; i++){
            if(partid === partnumbers[i].Part_ID){
                setEditedData(partnumbers[i])
                setEditedData((prevData) => ({
                    ...prevData,
                    Linename: lines[selectedline].Linename, // Assuming 'selectedline' contains the new value
                    oldPart_ID: partid
                }));
            }
        }
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

    const closeAddModal = () => {
        setShowAddModal(false);
    };

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
            const response = await fetch(`http://${localipaddr}:1435/api/getlinepartnumbers?linename=${encodeURIComponent(lines[selectedline].Linename)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setpartnumbers(data.result.recordset)
            } else {
                console.error('Request failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Filtered part numbers based on the searchValue
    const filteredPartNumbers = partnumbers.filter((rowData) => {
        const searchText = searchValue.toLowerCase();
        return (
            (rowData.Part_ID && rowData.Part_ID.toLowerCase().includes(searchText)) ||
            (rowData.Alternate_Part_ID && rowData.Alternate_Part_ID.toLowerCase().includes(searchText))
            //(rowData.Ideal_Cycle_Time_s && typeof rowData.Ideal_Cycle_Time_s === 'string' && rowData.Ideal_Cycle_Time_s.toLowerCase().includes(searchText))
            // Add more fields as needed for searching
            // Example: ||
            // (rowData.OtherField && rowData.OtherField.toLowerCase().includes(searchText))
        );
    });
    const [selectedLines, setSelectedLines] = useState([]);

    const handleSelectChange = (selectedOptions) => {
        // Extract the values of selected options
        const selectedValues = selectedOptions.map((option) => option.value);
        setSelectedLines(selectedValues);
    };
    const options = lines.map((line, index) => ({
        value: line.Linename,
        label: line.Linename,
    }));

    function geteditlines(id) {
        const newEditLines = [...editlines]; // Create a copy of the existing array
        console.log(lines[selectedline].Linename)
        for (let i = 0; i < allpartnumbers.length; i++) {
            if (allpartnumbers[i].part_id === id) {
                newEditLines.push(allpartnumbers[i].linename); // Add the new value to the copied array
            }
        }

        seteditlines(newEditLines); // Update the state with the new array
    }

    function checkpdf(id) {
        for (let i = 0; i < allpartnumbers.length; i++) {
            if (allpartnumbers[i].linename === selectedline && allpartnumbers[i].part_id === id) {
                return true;
            }
        }
        return false;
    }

    const handleAddAllOptions = () => {
        const allOptionValues = options.map((option) => option.value);
        setSelectedLines(allOptionValues);
      };

    const lineLabels = editlines.map((line, index) => `${line}`).join(', ');

    return (
        <div className='aepartnumberpage'>
            <div>
                <Toolbar />
                <div className='aepartnumbers-flexbox-container'>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <div>
                            <select className='aepartnumbers-inputs' onChange={(e) => getselectedline(e.target.selectedIndex)}>
                                {lines.map((line, index) => (
                                    <option key={index} value={line.Linename}>
                                        {line.Linename}
                                    </option>
                                ))}
                            </select>

                            <button className='aepartnumberbutton' onClick={handleAddClick}>
                                Add Part
                            </button>
                            <input
                                className='aepartnumbers-search'
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <div className="aepartnumberstable-container">
                                <ReactBootStrap.Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Part ID</th>
                                            <th>Alternate Part ID</th>
                                            <th>Ideal Cycle Time (s)</th>
                                            <th>Takt Time (s)</th>
                                            <th>Target Labor per Piece (s)</th>
                                            <th>Down (s)</th>
                                            <th>Count Multiplier</th>
                                            <th>Start with Changeover</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                            <th>PDF</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPartNumbers.map((rowData, index) => (
                                            <tr key={index}>
                                                <td>{rowData.Part_ID}</td>
                                                <td>{rowData.Alternate_Part_ID}</td>
                                                <td>{rowData.Ideal_Cycle_Time_s}</td>
                                                <td>{rowData.Takt_Time_s}</td>
                                                <td>{rowData.Target_Labor_per_Piece_s}</td>
                                                <td>{rowData.Down_s}</td>
                                                <td>
                                                    {`${rowData.Count_Multiplier_1}, ${rowData.Count_Multiplier_2}, ${rowData.Count_Multiplier_3}, ${rowData.Count_Multiplier_4}, ${rowData.Count_Multiplier_5}, ${rowData.Count_Multiplier_6}, ${rowData.Count_Multiplier_7}, ${rowData.Count_Multiplier_8}, ${rowData.Target_Multiplier}`}
                                                </td>
                                                <td>{rowData.Start_with_Changeover}</td>
                                                <td><button className='aeeditdeletebutton' onClick={() => handleEditClick(index, rowData.Part_ID)}>
                                                    <FontAwesomeIcon icon={faGear} />
                                                </button></td>
                                                <td>
                                                    <button className='aeeditdeletebutton' onClick={() => handledelete(rowData.Part_ID)}>
                                                        <FontAwesomeIcon icon={faTrashCan} />
                                                    </button>
                                                </td>
                                                <td>
                                                    {checkpdf(rowData.Part_ID) ? ( // Check if PDF exists
                                                        <FontAwesomeIcon icon={faCheck} /> // Display checkmark if PDF exists
                                                    ) : (
                                                        <FontAwesomeIcon icon={faTimes} /> // Display X if PDF does not exist
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </ReactBootStrap.Table>
                            </div>
                        </div>
                    )}
                </div>
                {showAddModal && (
                    <div className="aeedit-modal">
                        <div className="aeedit-popup">
                            <button className="aemodal-close-button" onClick={closeAddModal}>
                                X
                            </button>
                            <h2>Add Part</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            <div className='aeflexbox-item'>
                                Select Lines
                                <Select
                                    className='aepartnumbers-checkbox'
                                    isMulti
                                    onChange={handleSelectChange}
                                    value={options.filter((option) => selectedLines.includes(option.value))}
                                    options={options}
                                />
                                <button onClick={handleAddAllOptions}>Add All Lines</button>
                            </div>
                            <div className='aeflexbox-item'>
                                Part ID
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Part ID"
                                    value={newData.Part_ID}
                                    onChange={(e) => setNewData({ ...newData, Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Alternate Part ID
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Alternate Part ID"
                                    value={newData.Alternate_Part_ID}
                                    onChange={(e) => setNewData({ ...newData, Alternate_Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Ideal Cycle Time (s)
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Ideal Cycle Time"
                                    value={newData.Ideal_Cycle_Time_s}
                                    onChange={(e) => setNewData({ ...newData, Ideal_Cycle_Time_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            Takt Time(s)
                            <div className='aeflexbox-item'>
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Takt Time(s)"
                                    value={newData.Takt_Time_s}
                                    onChange={(e) => setNewData({ ...newData, Takt_Time_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Target Laber Per Piece(s)
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Target labor per Piece(s)"
                                    value={newData.Target_Labor_per_Piece_s}
                                    onChange={(e) => setNewData({ ...newData, Target_Labor_per_Piece_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Down(s)
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Down(s)"
                                    value={newData.Down_s}
                                    onChange={(e) => setNewData({ ...newData, Down_s: e.target.value })}
                                    onKeyPress={(event) => {
                                        if (!/[0-9]/.test(event.key)) {
                                            event.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <br />
                            <button className="modalbutton" onClick={checkaddpart}>
                                Save
                            </button>
                            <button className="modalbutton" onClick={closeAddModal}>
                                Cancel
                            </button>
                            {/* Display the message */}
                        </div>
                    </div>
                )}
                {showEditModal && (
                    <div className="aeedit-modal">
                        <div className="aeedit-popup">
                            <button className="aemodal-close-button" onClick={closeEditModal}>
                                X
                            </button>
                            <h2>Edit Part</h2>
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            <div className='aeflexbox-item'>
                                This Part ID is in
                                <p>{lineLabels}</p>
                            </div>
                            <div className='aeflexbox-item'>
                                Part ID
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Part ID"
                                    value={editedData.Part_ID}
                                    onChange={(e) => setEditedData({ ...editedData, Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Alternate Part ID
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Alternate Part ID"
                                    value={editedData.Alternate_Part_ID}
                                    onChange={(e) => setEditedData({ ...editedData, Alternate_Part_ID: e.target.value })}
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Ideal Cycle Time (s)
                                <input
                                    className='aepartnumbers-add-input'
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
                            <div className='aeflexbox-item'>
                                <input
                                    className='aepartnumbers-add-input'
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
                            <div className='aeflexbox-item'>
                                Target Laber Per Piece(s)
                                <input
                                    className='aepartnumbers-add-input'
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
                            <div className='aeflexbox-item'>
                                Down(s)
                                <input
                                    className='aepartnumbers-add-input'
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

export default Addeditpartnumbers;
