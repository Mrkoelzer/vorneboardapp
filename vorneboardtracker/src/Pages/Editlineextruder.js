import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Editlineextruder.css';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import { linescontext } from '../contexts/linescontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrashCan, faCheck, faXmark, faArrowLeft, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useErrorlogcontext } from '../contexts/errorlogcontext';
import { errorcontext } from '../contexts/errorcontext';
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';
import DeleteConfirmation from '../Components/DeleteConfirmation';

function Editlineextruder() {
  const navigate = useNavigate();
  const { Geterrorlog, Fetchlines } = useErrorlogcontext();
  const { userdata, setuserdata } = useContext(usercontext);
  const { lines, setlines } = useContext(linescontext);
  const [editlines, seteditlines] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const { localipaddr } = useContext(ipaddrcontext);
  const { seterrorlogstate } = useContext(errorcontext)
  const [isLoading, setIsLoading] = useState(false);
  const { settoolbarinfo } = useContext(Toolbarcontext)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editedData, setEditedData] = useState({
    Linename: '',
    ipaddress: '',
    packline: '',
    extruder: '',
    sqlid: '',
  });
  const [showEditModal, setshowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // State for showing/hiding the add modal
  const [newData, setNewData] = useState({
    Linename: '',
    ipaddress: '',
    packline: 1,
    extruder: 0,
  });
  const [addLineMessage, setAddLineMessage] = useState('');

  useEffect(() => {
    settoolbarinfo([{ Title: 'Vorne Edit Lines' }])
    fetchAndCheckLines();
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

  const fetchAndCheckLines = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://${localipaddr}:1435/api/getlines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data) {
        const promises = data.result.recordset.map(async (record) => {
          try {
            const updateddata = await Axios.get(`http://${record.ipaddress}/rest/cpe/attributes`, { timeout: 500 }); // Set a timeout of 500ms
            if (updateddata.status === 200) {
              record.connected = true;
            } else {
              record.connected = false;
              console.error(`API Call for ${record.Linename} was unsuccessful with status ${updateddata.status}`);
            }
          } catch (error) {
            record.connected = false;
            console.error(`API Call for ${record.Linename} failed with error: ${error}`);
          }
        });
        await Promise.all(promises);
        seteditlines(data.result.recordset);
        setIsLoading(false);
        fetchData();
      } else {
        console.log('error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchData = async () => {
    const data = await Geterrorlog(localipaddr);
    const fetcheddata = await Fetchlines(data, localipaddr);
    setlines(fetcheddata)
    const updateddata = await Geterrorlog(localipaddr);
    seterrorlogstate(updateddata)
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
  }, []);

  const handleEditClick = (index) => {
    setEditRow(index);
    setshowEditModal(true);
    setEditedData(editlines[index]);
  };
  const handledeleteClick = () => {
    setshowEditModal(false);
    setShowDeleteConfirmation(true)
  };

  const handleDelete = () => {
    handledelete(editlines[editRow].lineid);
    setShowDeleteConfirmation(false);
  };

  const handleClosed = () => {
    handleEditClick(editRow)
    setShowDeleteConfirmation(false);
  };

  const closeEditModal = () => {
    setshowEditModal(false);
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
    try {
      let linename;
      for (let i = 0; i < editlines.length; i++) {
        if (editlines[i].lineid === id) {
          linename = editlines[i]
        }
      }
      const response = await fetch(`http://${localipaddr}:1435/api/deleteline/${id}`, {
        method: 'DELETE',
      });

      // Handle response
      if (response.ok) {
        // Line deleted successfully
        NotificationManager.success(`${linename.Linename} Deleted!`)
        handledeletetable(linename)
        fetchAndCheckLines(); // Refresh the line data
        closeEditModal(); // Close the edit modal
      } else {
        NotificationManager.error('Delete Failed!')
        console.error('Delete failed');
      }
    } catch (error) {
      NotificationManager.error('Delete Failed!')
      console.error('Error:', error);
    }
  };

  const checkaddline = () => {
    const regexExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    for (let i = 0; i < editlines.length; i++) {
      if (newData.Linename.trim() === "") {
        setAddLineMessage('Line Name is blank')
        return;
      }
      if (newData.ipaddress.trim() === "") {
        setAddLineMessage('IP Address is blank')
        return
      }
      if (editlines[i].Linename === newData.Linename) {
        setAddLineMessage(`${newData.Linename} is a Duplicate Line Name`);
        return;
      }
      if (editlines[i].ipaddress === newData.ipaddress) {
        setAddLineMessage(`${newData.ipaddress} is being used on ${editlines[i].Linename}`);
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
    for (let i = 0; i < editlines.length; i++) {
      if (i !== editRow) {
        if (editedData.Linename.trim() === "") {
          setAddLineMessage('Line Name is blank')
          return;
        }
        if (editedData.ipaddress.trim() === "") {
          setAddLineMessage('IP Address is blank')
          return
        }
        if (editlines[i].Linename === editedData.Linename) {
          setAddLineMessage(`${editedData.Linename} is a Duplicate Line Name`);
          return;
        }
        if (editlines[i].ipaddress === editedData.ipaddress) {
          setAddLineMessage(`${editedData.ipaddress} is being used on ${editlines[i].Linename}`);
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
      NotificationManager.success(`${editedData.Linename} Updated!`)
      handletablenamechange();
      fetchAndCheckLines()

      // Close the edit pop-up
      closeEditModal();
    } catch (error) {
      NotificationManager.error('Update Failed!')
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
        body: JSON.stringify({ oldtablename: editlines[editRow].Linename, tableName: editedData.Linename }),
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
      NotificationManager.success(`${newData.Linename} Added!`)
      handleaddtable()
      fetchAndCheckLines()

      // Close the add modal
      closeAddModal();
    } catch (error) {
      NotificationManager.error('Add Failed!')
      console.error('Error:', error);
    }
  };

  return (
    <div className="editle">
      <br />
      <NotificationContainer />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="editletable-container">
            <div style={{ display: 'flex' }}>
              <button className="editlebutton" onClick={handleAddClick}>
                <div className="editleicon-wrapper">
                  <FontAwesomeIcon icon={faPlus} className="editleicon" />
                </div>
                <div className="editletext">Add</div>
              </button>
              <button className="editlebutton" onClick={() => navigate('/Account')}>
                <div className="editleicon-wrapper">
                  <FontAwesomeIcon icon={faArrowLeft} className="editleicon" />
                </div>
                <div className="editletext">Go Back</div>
              </button>
            </div>
            <ReactBootStrap.Table striped bordered hover>
              <thead>
                <tr className="header-row">
                  <th style={{ width: '10%' }}>Connection</th>
                  <th>Line Name</th>
                  <th>IP Address</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {editlines.map((rowData, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'} onClick={() => handleEditClick(index)}>
                    <td style={{ backgroundColor: rowData.connected ? 'green' : 'red' }}>
                      {rowData.connected ? (
                        <FontAwesomeIcon icon={faCheck} />
                      ) : (
                        <FontAwesomeIcon icon={faTimes} />
                      )}
                    </td>
                    <td>{rowData.Linename}</td>
                    <td>{rowData.ipaddress}</td>
                    <td>{gettype(rowData.packline, rowData.extruder)}</td>
                  </tr>
                ))}
              </tbody>
            </ReactBootStrap.Table>
          </div>
          {showEditModal && (
            <div className="edit-modal">
              <div className="edit-popup">
                <button className="modal-close-button" onClick={closeEditModal}>
                  X
                </button>
                <h2>Edit Line Data</h2>
                {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                <div className='editleflexbox-item'>
                  Line Name
                  <input
                    className='editle-inputs'
                    type="text"
                    placeholder="Line Name"
                    value={editedData.Linename}
                    onChange={(e) => setEditedData({ ...editedData, Linename: e.target.value })}
                  />
                </div>
                <div className='editleflexbox-item'>
                  IP Address
                  <input
                    className='editle-inputs'
                    type="text"
                    placeholder="IP Address"
                    value={editedData.ipaddress}
                    onChange={(e) => setEditedData({ ...editedData, ipaddress: e.target.value })}
                  />
                </div>
                <div className='editleflexbox-item'>
                  Line Type
                  <select
                    className='editle-dropdown'
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
                </div>
                <br />
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <button className="editlebutton" onClick={checkeditline}>
                    <div className="editleicon-wrapper">
                      <FontAwesomeIcon icon={faCheck} className="editleicon" />
                    </div>
                    <div className="editletext">Save</div>
                  </button>
                  <button className="editlebutton" onClick={closeEditModal}>
                    <div className="editleicon-wrapper">
                      <FontAwesomeIcon icon={faXmark} className="editleicon" />
                    </div>
                    <div className="editletext">Cancel</div>
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <button className="editlebutton" onClick={handledeleteClick}>
                    <div className="editleicon-wrapper">
                      <FontAwesomeIcon icon={faTrashCan} className="editleicon" />
                    </div>
                    <div className="editletext">Delete</div>
                  </button>
                </div>
              </div>
            </div>
          )}
          {showAddModal && (
            <div className="edit-modal">
              <div className="edit-popup">
                <button className="modal-close-button" onClick={closeAddModal}>
                  X
                </button>
                <h2>Add Line Data</h2>
                <div className='editleflexbox-item'>
                  Line Name
                  <input
                    className='editle-inputs'
                    type="text"
                    placeholder="Line Name"
                    value={newData.Linename}
                    onChange={(e) => setNewData({ ...newData, Linename: e.target.value })}
                  />
                </div>
                <div className='editleflexbox-item'>
                  IP Address
                  <input
                    className='editle-inputs'
                    type="text"
                    placeholder="IP Address"
                    value={newData.ipaddress}
                    onChange={(e) => setNewData({ ...newData, ipaddress: e.target.value })}
                  />
                </div>
                <div className='editleflexbox-item'>
                  Line Type
                  <select
                    className='editle-dropdown'
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <button className="editlebutton" onClick={checkaddline}>
                    <div className="editleicon-wrapper">
                      <FontAwesomeIcon icon={faCheck} className="editleicon" />
                    </div>
                    <div className="editletext">Save</div>
                  </button>
                  <button className="editlebutton" onClick={closeAddModal}>
                    <div className="editleicon-wrapper">
                      <FontAwesomeIcon icon={faXmark} className="editleicon" />
                    </div>
                    <div className="editletext">Cancel</div>
                  </button>
                </div>
                {/* Display the message */}
                {addLineMessage && <p className="error-message">{addLineMessage}</p>}
              </div>
            </div>
          )}
          <DeleteConfirmation
            show={showDeleteConfirmation}
            handleDelete={handleDelete}
            handleClose={handleClosed}
            message={`Are you sure you want to delete ${editedData.Linename}?`}
          />
        </>
      )}
    </div>
  );
}

export default Editlineextruder;
