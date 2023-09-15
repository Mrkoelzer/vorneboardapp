import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/Addeditpartnumbers.css';
import Toolbar from '../Components/AddeditpartsToolbar';
import { linescontext } from '../contexts/linescontext';
import { usercontext } from '../contexts/usercontext';
import * as ReactBootStrap from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrashCan } from '@fortawesome/free-solid-svg-icons';

function Addeditpartnumbers() {
    const navigate = useNavigate();
    const { lines } = useContext(linescontext);
    const { userdata } = useContext(usercontext);
    const [selectedline, setselectedline] = useState(0);
    const [partnumbers, setpartnumbers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState(""); // Initialize with an empty string
    const [showAddModal, setShowAddModal] = useState(false);
    const [addLineMessage, setAddLineMessage] = useState('');
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

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        getpartnumbers()
        setIsLoading(false);
    }, [selectedline]);

    const checkaddpart = () => {
        /*const regexExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        for (let i = 0; i < lines.length; i++) {
            if(newData.Linename.trim() === ""){
                setAddLineMessage('Line Name is blank')
                return;
            }
            if(newData.ipaddress.trim() === ""){
                setAddLineMessage('IP Address is blank')
                return
            }
          if (lines[i].Linename === newData.Linename) {
            setAddLineMessage(`${newData.Linename} is a Duplicate Line Name`);
            return;
          }
          if (lines[i].ipaddress === newData.ipaddress) {
            setAddLineMessage(`${newData.ipaddress} is being used on ${lines[i].Linename}`);
            return;
          }
          if (!regexExp.test(newData.ipaddress)) {
            setAddLineMessage(`${newData.ipaddress} is an Invalid IP Address`);
            return;
          }
        }*/
        handleSaveAdd();
    };

    const handledelete = async (id) => {
        let linename = lines[selectedline].Linename
        console.log(linename)
        try {
            const response = await fetch(`http://10.144.18.208:1434/api/deleteline`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ linename, id }), // Send linename in the request body
            });

            // Handle response
            if (response.ok) {
                getpartnumbers()
            } else {
                console.error('Delete failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function addpartreset() {
        setNewData({
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
    }

    const handleSaveAdd = async () => {
        try {
            const response = await fetch('http://10.144.18.208:1434/api/insertnewpart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });
            // Close the add modal
            getpartnumbers();
            addpartreset();
            closeAddModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    function getselectedline(index) {
        setselectedline(index)
        let linename = lines[index].Linename;
        console.log(linename)
        setNewData({
            ...newData, // Spread the existing properties of newData
            Linename: linename // Set the Linename property
        });
    }

    const handleAddClick = () => {
        setShowAddModal(true);
        //setAddLineMessage('');
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const getpartnumbers = async () => {
        console.log(lines[selectedline].Linename)
        try {
            const response = await fetch(`http://10.144.18.208:1434/api/getlinepartnumbers?linename=${encodeURIComponent(lines[selectedline].Linename)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                console.log(data.result.recordset)
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
                                            <th></th>
                                            <th></th>
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
                                                <td><FontAwesomeIcon icon={faGear} /></td>
                                                <button onClick={() => handledelete(rowData.Part_ID)}>
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </button>
                                            </tr>
                                        ))}
                                    </tbody>
                                </ReactBootStrap.Table>
                            </div>
                        </div>
                    )}
                </div>
                {showAddModal && (
                    <div className="edit-modal">
                        <div className="edit-popup">
                            <button className="modal-close-button" onClick={closeAddModal}>
                                X
                            </button>
                            <h2>Add Part</h2>
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
                                />
                            </div>
                            <div className='aeflexbox-item'>
                                Takt Time(s)
                                <input
                                    className='aepartnumbers-add-input'
                                    type="text"
                                    placeholder="Target labor per Piece(s)"
                                    value={newData.Target_Labor_per_Piece_s}
                                    onChange={(e) => setNewData({ ...newData, Target_Labor_per_Piece_s: e.target.value })}
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
                            {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Addeditpartnumbers;
