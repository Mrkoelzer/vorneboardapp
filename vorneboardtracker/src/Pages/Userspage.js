import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Userspage.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Toolbar from '../Components/Createtoolbar';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faGear, faTrashCan, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons';


function Userspage() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const [users, setusers] = useState([])
    const { localipaddr } = useContext(ipaddrcontext);
    const [editedData, setEditedData] = useState({
        userid: 0,
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        pin: '',
        email: '',
        admin: false,
        superadmin: false,
        guest: false,
        passwordchange: true,
        pinchange: true
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
        admin: false,
        superadmin: false,
        guest: false,
        passwordchange: true,
        pinchange: true
    });
    const [addLineMessage, setAddLineMessage] = useState('');

    useEffect(() => {
        const userDataFromLocalStorage = sessionStorage.getItem('userdata');
        let parsedUserData;
        if (userDataFromLocalStorage) {
            parsedUserData = JSON.parse(userDataFromLocalStorage);
            setuserdata(parsedUserData);
        }
        if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
            if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
                navigate('/Changepasswordpin');
            }
        } else {
            navigate('/');
        }
    }, [setuserdata, navigate]);

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

    const checkusername = async (username, userid, addedit) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/checkusername`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();
            if (data.result.recordset.length === 0 || data.result.recordset[0].userid === userid) {
                if (addedit === 1) {
                    console.log('here')
                    handleSaveAdd();
                }
                else if (addedit === 2) {
                    handleSaveEdit();
                }
            } else {
                setAddLineMessage(`Username is used by ${data.result.recordset[0].first_name} ${data.result.recordset[0].last_name}`)
                return;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const checkaddline = () => {
        if (newData.first_name.trim() === "") {
            setAddLineMessage('First Name is blank')
            return;
        }
        if (newData.last_name.trim() === "") {
            setAddLineMessage('Last Name is blank')
            return
        }
        if (newData.username.trim() === "") {
            setAddLineMessage('Username is blank')
            return
        }
        if (newData.password.trim() === "") {
            setAddLineMessage('Password is blank')
            return
        }
        if (newData.pin.trim() === "") {
            setAddLineMessage('Pin is blank')
            return
        }
        if (newData.email.trim() === "") {
            setAddLineMessage('Email is blank')
            return
        }
        if (newData.pin.length < 4 || newData.pin.length > 4) {
            setAddLineMessage('Pin needs to be 4 digits')
            return
        }
        if (newData.admin === false && newData.superadmin === false && newData.guest === false) {
            setAddLineMessage('Access Needs to Be Set')
            return
        }
        checkusername(newData.username, 0, 1)
    };

    const checkeditline = () => {
        if (editedData.first_name.trim() === "") {
            setAddLineMessage('First Name is blank')
            return;
        }
        if (editedData.last_name.trim() === "") {
            setAddLineMessage('Last Name is blank')
            return
        }
        if (editedData.username.trim() === "") {
            setAddLineMessage('Username is blank')
            return
        }
        if (editedData.password.trim() === "") {
            setAddLineMessage('Password is blank')
            return
        }
        if (editedData.pin.length === 0) {
            setAddLineMessage('Pin is blank')
            return
        }
        if (editedData.email.trim() === "") {
            setAddLineMessage('Email is blank')
            console.log(editedData.admin)
            return
        }
        if (editedData.pin.length < 4 || editedData.pin.length > 4) {
            setAddLineMessage('Pin needs to be 4 digits')
            return
        }
        const updatedData = { ...editedData };
        for (const key in updatedData) {
            if (typeof updatedData[key] === 'boolean') {
                updatedData[key] = updatedData[key] ? 1 : 0;
            }
        }
        if (updatedData.admin === 0
            && updatedData.superadmin === 0
            && updatedData.guest === 0) {
            setAddLineMessage('Access Needs to Be Set')
            return
        }
        checkusername(editedData.username, editedData.userid, 2)
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
            if (response.ok) {
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
            admin: false,
            superadmin: false,
            guest: false,
            passwordchange: true,
            pinchange: true
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
                    admin: false,
                    superadmin: false,
                    guest: false,
                    passwordchange: true,
                    pinchange: true
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
            <div className="userpagetable-container">
                <div style={{ display: 'flex' }}>
                    <button className="userpagebutton" onClick={handleAddClick}>
                        <div className="usericon-wrapper">
                            <FontAwesomeIcon icon={faUserPlus} className="usericon" />
                        </div>
                        <div className="usertext">Add</div>
                    </button>
                    <button className="userpagebutton" onClick={() => navigate('/Account')}>
                        <div className="usericon-wrapper">
                            <FontAwesomeIcon icon={faArrowLeft} className="usericon" />
                        </div>
                        <div className="usertext">Go Back</div>
                    </button>
                </div>
                <ReactBootStrap.Table striped bordered hover>
                    <thead>
                        <tr className="header-row">
                            <th style={{ width: '20%' }}>Name</th>
                            <th style={{ width: '5%' }}>Admin</th>
                            <th style={{ width: '8%' }}>Super Admin</th>
                            <th style={{ width: '10%' }}>Password Change</th>
                            <th style={{ width: '10%' }}>Pin Change</th>
                            <th style={{ width: '3%' }}>Edit</th>
                            <th style={{ width: '3%' }}>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((rowData, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                <td>{rowData.first_name} {rowData.last_name}</td>
                                <td>{getvalues(rowData.admin)}</td>
                                <td>{getvalues(rowData.superadmin)}</td>
                                <td>{getvalues(rowData.passwordchange)}</td>
                                <td>{getvalues(rowData.pinchange)}</td>
                                <td><p className='userpageeditdeletebutton' onClick={() => handleEditClick(index, rowData.Part_ID)}><FontAwesomeIcon icon={faGear} /></p></td>
                                <td><p className='userpageeditdeletebutton' onClick={() => handledeleteClick(index)}><FontAwesomeIcon icon={faTrashCan} /></p></td>
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
                                type="password"
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
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button className="userpagebutton" onClick={checkaddline}>
                                <div className="usericon-wrapper">
                                    <FontAwesomeIcon icon={faCheck} className="usericon" />
                                </div>
                                <div className="usertext">Save</div>
                            </button>
                            <button className="userpagebutton" onClick={closeAddModal}>
                                <div className="usericon-wrapper">
                                    <FontAwesomeIcon icon={faXmark} className="usericon" />
                                </div>
                                <div className="usertext">Cancel</div>
                            </button>
                        </div>
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
                                type="password"
                                placeholder="Password"
                                value={editedData.password}
                                onChange={(e) => setEditedData({ ...editedData, password: e.target.value })}
                            />
                        </div>
                        <div className='userpageflexbox-item'>
                            Pin
                            <input
                                className='userpage-add-input'
                                type="password"
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
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <button className="userpagebutton" onClick={checkeditline}>
                                <div className="usericon-wrapper">
                                    <FontAwesomeIcon icon={faCheck} className="usericon" />
                                </div>
                                <div className="usertext">Save</div>
                            </button>
                            <button className="userpagebutton" onClick={closeEditModal}>
                                <div className="usericon-wrapper">
                                    <FontAwesomeIcon icon={faXmark} className="usericon" />
                                </div>
                                <div className="usertext">Cancel</div>
                            </button>
                        </div>

                        {/* Display the message */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Userspage;
