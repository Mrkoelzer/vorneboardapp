import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Editlineextruder.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Toolbar from '../Components/Editlineextrudertoolbar';
import { linescontext } from '../contexts/linescontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrash } from '@fortawesome/free-solid-svg-icons';

function Pdfs() {
    const navigate = useNavigate();
    const { userdata } = useContext(usercontext);
    const { lines, setlines } = useContext(linescontext);
    const [pdfs, setpdfs] = useState([]);
    const [editRow, setEditRow] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const { localipaddr } = useContext(ipaddrcontext);
    const [editedData, setEditedData] = useState({
        Linename: '',
        ipaddress: '',
        packline: '',
        extruder: '',
        sqlid: '',
    });
    const [showAddModal, setShowAddModal] = useState(false); // State for showing/hiding the add modal
    const [newData, setNewData] = useState({
        Linename: '',
        ipaddress: '',
        packline: 1,
        extruder: 0,
    });
    const [addLineMessage, setAddLineMessage] = useState('');

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

    function gettype(packline, extruder) {
        if (packline === 1) {
            return 'Pack Line';
        }
        if (extruder === 1) {
            return 'Extruder';
        } else {
            return 'Not Set';
        }
    }

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        fetchpdfs();
    }, []);

    const handleEditClick = (index) => {
        setEditRow(index);
        setEditedData(lines[index]);
    };
    const handledeleteClick = (index) => {
        handledelete(lines[index].lineid);
    };

    const closeEditModal = () => {
        setEditRow(null);
        setEditedData({
            Linename: '',
            ipaddress: '',
            packline: '',
            extruder: '',
            sqlid: '',
        });
    };

    const handledelete = async (id) => {
        console.log(id)
        try {
            let linename;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].lineid === id) {
                    linename = lines[i]
                }
            }
            const response = await fetch(`http://${localipaddr}:1435/api/deleteline/${id}`, {
                method: 'DELETE',
            });

            // Handle response
            if (response.ok) {
                // Line deleted successfully
                handledeletetable(linename)
                fetchpdfs(); // Refresh the line data
                closeEditModal(); // Close the edit modal
            } else {
                console.error('Delete failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const checkaddline = () => {
        const regexExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        for (let i = 0; i < lines.length; i++) {
            if (newData.Linename.trim() === "") {
                setAddLineMessage('Line Name is blank')
                return;
            }
            if (newData.ipaddress.trim() === "") {
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
        }
        handleSaveAdd();
    };

    const checkeditline = () => {
        console.log(editedData)
        const regexExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        for (let i = 0; i < lines.length; i++) {
            if (i !== editRow) {
                if (editedData.Linename.trim() === "") {
                    setAddLineMessage('Line Name is blank')
                    return;
                }
                if (editedData.ipaddress.trim() === "") {
                    setAddLineMessage('IP Address is blank')
                    return
                }
                if (lines[i].Linename === editedData.Linename) {
                    setAddLineMessage(`${editedData.Linename} is a Duplicate Line Name`);
                    return;
                }
                if (lines[i].ipaddress === editedData.ipaddress) {
                    setAddLineMessage(`${editedData.ipaddress} is being used on ${lines[i].Linename}`);
                    return;
                }
                if (!regexExp.test(editedData.ipaddress)) {
                    setAddLineMessage(`${editedData.ipaddress} is an Invalid IP Address`);
                    return;
                }
            }
            if (editedData.Linename.trim() === "") {
                setAddLineMessage('IP Address is blank')
                return;
            }
            if (editedData.ipaddress.trim() === "") {
                setAddLineMessage('Line Name is blank')
                return
            }
            if (!regexExp.test(editedData.ipaddress)) {
                setAddLineMessage(`${editedData.ipaddress} is an Invalid IP Address`);
                return;
            }
        }
        handleSaveEdit();
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/updateline`, {
                method: 'POST', // or 'POST' depending on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedData),
            });

            // Handle response and update the data if needed
            handletablenamechange();
            fetchpdfs()

            // Close the edit pop-up
            closeEditModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handletablenamechange = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/updatetablename`, {
                method: 'POST', // or 'POST' depending on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ oldtablename: lines[editRow].Linename, tableName: editedData.Linename }),
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAddClick = () => {
        setShowAddModal(true);
        setAddLineMessage('');
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setNewData({
            Linename: '',
            ipaddress: '',
            packline: 1,
            extruder: 0,
        });
    };

    const handleaddtable = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/addnewtable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handledeletetable = async (linename) => {
        console.log(linename)
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/deletetable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Linename: linename }),
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSaveAdd = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/insertnewline`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newData),
            });
            handleaddtable()
            fetchpdfs()

            // Close the add modal
            closeAddModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const filteredPartNumbers = pdfs.filter((rowData) => {
        const searchText = searchValue.toLowerCase();
        return (
            (rowData.pdfname && rowData.pdfname.toLowerCase().includes(searchText))
            //(rowData.Ideal_Cycle_Time_s && typeof rowData.Ideal_Cycle_Time_s === 'string' && rowData.Ideal_Cycle_Time_s.toLowerCase().includes(searchText))
            // Add more fields as needed for searching
            // Example: ||
            // (rowData.OtherField && rowData.OtherField.toLowerCase().includes(searchText))
        );
    });


    return (
        <div className="editle">
            <view>
                <Toolbar />
                <br />
                <button className="editlebutton" onClick={handleAddClick}>
                    Add
                </button>
                <button className="editlebutton" onClick={() => navigate('/Account')}>
                    Go Back
                </button>
                <input
                                className='partpdfs-search'
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                <div className="editletable-container">
                    <ReactBootStrap.Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>PDF's</th>
                                <th>Edit</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPartNumbers.map((rowData, index) => (
                                <tr key={index}>
                                    <td>{rowData.pdfname}</td>
                                    <td><button className='eleditdeletebutton' onClick={() => handleEditClick(index, rowData.Part_ID)}>
                                        <FontAwesomeIcon icon={faGear} />
                                    </button></td>
                                    <td><button className='eleditdeletebutton' onClick={() => handledeleteClick(index)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button></td>
                                </tr>
                            ))}
                        </tbody>
                    </ReactBootStrap.Table>
                </div>
                {editRow !== null && (
                    <div className="edit-modal">
                        <div className="edit-modal">
                            <div className="edit-popup">
                                <button className="modal-close-button" onClick={closeEditModal}>
                                    X
                                </button>
                                <h2>Edit Line Data</h2>
                                <input
                                    className='editle-inputs'
                                    type="text"
                                    placeholder="Line Name"
                                    value={editedData.Linename}
                                    onChange={(e) => setEditedData({ ...editedData, Linename: e.target.value })}
                                />
                                <input
                                    className='editle-inputs'
                                    type="text"
                                    placeholder="IP Address"
                                    value={editedData.ipaddress}
                                    onChange={(e) => setEditedData({ ...editedData, ipaddress: e.target.value })}
                                />
                                <select
                                    className='editle-inputs'
                                    value={editedData.packline === 1 ? 'Pack Line' : 'Extruder'}
                                    onChange={(e) =>
                                        setEditedData({
                                            ...editedData,
                                            packline: e.target.value === 'Pack Line' ? 1 : 0,
                                            extruder: e.target.value === 'Extruder' ? 1 : 0,
                                        })
                                    }
                                >
                                    <option value="Pack Line">Pack Line</option>
                                    <option value="Extruder">Extruder</option>
                                </select>
                                <button className="modalbutton" onClick={checkeditline}>
                                    Save
                                </button>
                                <button className="modalbutton" onClick={closeEditModal}>
                                    Cancel
                                </button>
                                {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                            </div>
                        </div>
                    </div>
                )}
            </view>
            {showAddModal && (
                <div className="edit-modal">
                    <div className="edit-popup">
                        <button className="modal-close-button" onClick={closeAddModal}>
                            X
                        </button>
                        <h2>Add Line Data</h2>
                        <input
                            className='editle-inputs'
                            type="text"
                            placeholder="Line Name"
                            value={newData.Linename}
                            onChange={(e) => setNewData({ ...newData, Linename: e.target.value })}
                        />
                        <input
                            className='editle-inputs'
                            type="text"
                            placeholder="IP Address"
                            value={newData.ipaddress}
                            onChange={(e) => setNewData({ ...newData, ipaddress: e.target.value })}
                        />
                        <select
                            className='editle-inputs'
                            value={newData.packline === 1 ? 'Pack Line' : 'Extruder'}
                            onChange={(e) =>
                                setNewData({
                                    ...newData,
                                    packline: e.target.value === 'Pack Line' ? 1 : 0,
                                    extruder: e.target.value === 'Extruder' ? 1 : 0,
                                })
                            }
                        >
                            <option value="Pack Line">Pack Line</option>
                            <option value="Extruder">Extruder</option>
                        </select>
                        <button className="modalbutton" onClick={checkaddline}>
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
    );
}

export default Pdfs;
