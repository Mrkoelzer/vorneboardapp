import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Userspage.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Toolbar from '../Components/Createtoolbar';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { linescontext } from '../contexts/linescontext';

function Userspage() {
    const navigate = useNavigate();
    const { userdata } = useContext(usercontext);
    const [users, setusers] = useState([])
    const [editRow, setEditRow] = useState(null);
    const { lines, setlines } = useContext(linescontext);
    const { localipaddr } = useContext(ipaddrcontext);
    const [editedData, setEditedData] = useState({
        userid: 0,
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        pin: '',
        email: '',
        admin: 0,
        superadmin: 0,
        guest: 0,
        passwordchange: 0,
        pinchange: 0
    });
    const [showEditModal, setshowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false); // State for showing/hiding the add modal
    const [newData, setNewData] = useState({
        userid: 0,
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        pin: '',
        email: '',
        admin: 0,
        superadmin: 0,
        guest: 0,
        passwordchange: 0,
        pinchange: 0
    });
    const [addLineMessage, setAddLineMessage] = useState('');

    const fetchlines = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getusers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                setusers(data.result.recordset);
            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEditClick = (index) => {
        setAddLineMessage('');
        setEditedData(users[index])
        setshowEditModal(true);

    };
    
    const closeEditModal = () => {
        setshowEditModal(false);
    };

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        fetchlines()
    }, []);

    const handledeleteClick = (index) => {
        handledelete(users[index].userid);
    };

    const handledelete = async (userid) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/deleteuser`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid }), // Pass the id in the request body
            });
    
            // Handle response
            if (response.ok) {
                // Line deleted successfully
    
                fetchlines(); // Refresh the line data
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
            const updatedData = { ...editedData };
            for (const key in updatedData) {
                if (typeof updatedData[key] === 'boolean') {
                    updatedData[key] = updatedData[key] ? 1 : 0;
                }
            }
            const response = await fetch(`http://${localipaddr}:1435/api/updateuser`, {
                method: 'POST', // or 'POST' depending on your API
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            // Handle response and update the data if needed
            if(response.ok){
                fetchlines()

                // Close the edit pop-up
                closeEditModal();
            }
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
            userid: 0,
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            pin: '',
            email: '',
            admin: 0,
            superadmin: 0,
            guest: 0,
            passwordchange: 0,
            pinchange: 0
        });
    };

    const handleSaveAdd = async () => {
        try {
            // Create a copy of newData and update values
            const updatedData = { ...newData };
            for (const key in updatedData) {
                if (typeof updatedData[key] === 'boolean') {
                    updatedData[key] = updatedData[key] ? 1 : 0;
                }
            }
            const response = await fetch(`http://${localipaddr}:1435/api/createaccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            const data = await response.json();
            if (data.createdauthenticated) {
                // Reset newData to initial state
                setNewData({
                    userid: 0,
                    username: '',
                    password: '',
                    first_name: '',
                    last_name: '',
                    pin: '',
                    email: '',
                    admin: 0,
                    superadmin: 0,
                    guest: 0,
                    passwordchange: 0,
                    pinchange: 0,
                });
            } else {
                // Handle the case where the creation was not successful
            }
            
            fetchlines();
    
            // Close the add modal
            closeAddModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    function getvalues(value) {
        if (value === 1) {
            return 'True'
        }
        else {
            return 'False'
        }
    }

    return (
        <div className="userpage">
            <Toolbar />
            <br />
            <div className="userpagetable-container">
                <div style={{ display: 'flex', gap: '10px', width: '70%' }}>
                    <button className="userpagebutton" onClick={handleAddClick}>
                        Add
                    </button>
                    <button className="userpagebutton" onClick={() => navigate('/Account')}>
                        Go Back
                    </button>
                </div>
                <ReactBootStrap.Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Admin</th>
                            <th>Super Admin</th>
                            <th>Password Change</th>
                            <th>Pin Change</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((rowData, index) => (
                            <tr key={index}>
                                <td>{rowData.first_name} {rowData.last_name}</td>
                                <td>{getvalues(rowData.admin)}</td>
                                <td>{getvalues(rowData.superadmin)}</td>
                                <td>{getvalues(rowData.passwordchange)}</td>
                                <td>{getvalues(rowData.pinchange)}</td>
                                <td>
                                    <button className="userpageeditdeletebutton" onClick={() => handleEditClick(index)}>
                                        Edit
                                    </button>
                                </td>
                                <td>
                                    <button className="userpageeditdeletebutton" onClick={() => handledeleteClick(index)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </ReactBootStrap.Table>
            </div>
            {showAddModal && (
                <div className="userpageedit-modal">
                    <div className="userpageedit-popup">
                        <button className="userpagemodal-close-button" onClick={closeAddModal}>
                            X
                        </button>
                        <h2>Add User</h2>
                        {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                        <div className='userpageflexbox-item'>
                            First Name
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="First Name"
                                value={newData.first_name}
                                onChange={(e) => setNewData({ ...newData, first_name: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Last Name
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Last Name"
                                value={newData.last_name}
                                onChange={(e) => setNewData({ ...newData, last_name: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Username
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Username"
                                value={newData.username}
                                onChange={(e) => setNewData({ ...newData, username: e.target.value })}
                            />
                        </div>
                        Password
                        <div className='userpageflexbox-item'>
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Password"
                                value={newData.password}
                                onChange={(e) => setNewData({ ...newData, password: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Pin
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Pin"
                                value={newData.pin}
                                onChange={(e) => setNewData({ ...newData, pin: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Email
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Email"
                                value={newData.email}
                                onChange={(e) => setNewData({ ...newData, email: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Admin</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={newData.admin}
                                onChange={(e) => setNewData({ ...newData, admin: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Super Admin</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={newData.superadmin}
                                onChange={(e) => setNewData({ ...newData, superadmin: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Guest</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={newData.guest}
                                onChange={(e) => setNewData({ ...newData, guest: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Password Change</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={newData.passwordchange}
                                onChange={(e) => setNewData({ ...newData, passwordchange: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Pin Change</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={newData.pinchange}
                                onChange={(e) => setNewData({ ...newData, pinchange: e.target.checked })}
                            />
                        </div>
                        <br />
                        <button className="modalbutton" onClick={handleSaveAdd}>
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
                <div className="userpageedit-modal">
                    <div className="userpageedit-popup">
                        <button className="userpagemodal-close-button" onClick={closeEditModal}>
                            X
                        </button>
                        <h2>Edit User</h2>
                        {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                        <div className='userpageflexbox-item'>
                            First Name
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="First Name"
                                value={editedData.first_name}
                                onChange={(e) => setEditedData({ ...editedData, first_name: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Last Name
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Last Name"
                                value={editedData.last_name}
                                onChange={(e) => setEditedData({ ...editedData, last_name: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Username
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Username"
                                value={editedData.username}
                                onChange={(e) => setEditedData({ ...editedData, username: e.target.value })}
                            />
                        </div>
                        Password
                        <div className='userpageflexbox-item'>
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Password"
                                value={editedData.password}
                                onChange={(e) => setEditedData({ ...editedData, password: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Pin
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Pin"
                                value={editedData.pin}
                                onChange={(e) => setEditedData({ ...editedData, pin: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Email
                            <input
                                className='userpage-add-input'
                                type="text"
                                placeholder="Email"
                                value={editedData.email}
                                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Admin</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={editedData.admin}
                                onChange={(e) => setEditedData({ ...editedData, admin: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Super Admin</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={editedData.superadmin}
                                onChange={(e) => setEditedData({ ...editedData, superadmin: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Guest</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={editedData.guest}
                                onChange={(e) => setEditedData({ ...editedData, guest: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Password Change</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={editedData.passwordchange}
                                onChange={(e) => setEditedData({ ...editedData, passwordchange: e.target.checked })}
                            />
                        </div>
                        <div className='userpageflexbox-item' style={{ display: 'flex', alignItems: 'center' }}>
                            <span>Pin Change</span>
                            <input
                                className='userpage-checkbox'
                                type="checkbox"
                                checked={editedData.pinchange}
                                onChange={(e) => setEditedData({ ...editedData, pinchange: e.target.checked })}
                            />
                        </div>
                        <br />
                        <button className="modalbutton" onClick={handleSaveEdit}>
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
    );
}

export default Userspage;
