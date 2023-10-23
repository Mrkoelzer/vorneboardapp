import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Editlineextruder.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Toolbar from '../Components/Editlineextrudertoolbar';
import { linescontext } from '../contexts/linescontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faTrashCan, faCheck, faXmark, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';


function Editlineextruder() {
  const navigate = useNavigate();
  const { userdata, setuserdata } = useContext(usercontext);
  const { lines, setlines } = useContext(linescontext);
  const [editRow, setEditRow] = useState(null);
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
      const response = await fetch(`http://${localipaddr}:1435/api/getlines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data) {
        setlines(data.result.recordset);
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
        fetchlines(); // Refresh the line data
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
      fetchlines()

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
      fetchlines()

      // Close the add modal
      closeAddModal();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="editle">
      <Toolbar />
      <br />
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
              <th>Line Name</th>
              <th>IP Address</th>
              <th>Type</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((rowData, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                <td>{rowData.Linename}</td>
                <td>{rowData.ipaddress}</td>
                <td>{gettype(rowData.packline, rowData.extruder)}</td>
                <td><p className='eleditdeletebutton' onClick={() => handleEditClick(index)}><FontAwesomeIcon icon={faGear} /></p></td>
                <td><p className='eleditdeletebutton' onClick={() => handledeleteClick(index)}><FontAwesomeIcon icon={faTrashCan} /></p></td>
              </tr>
            ))}
          </tbody>
        </ReactBootStrap.Table>
      </div>
      {editRow !== null && (
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
    </div>
  );
}

export default Editlineextruder;
