import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import '../Css/Editlineextruder.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Toolbar from '../Components/Editlineextrudertoolbar';
import { linescontext } from '../contexts/linescontext';

function Editlineextruder() {
  const navigate = useNavigate();
  const { userdata } = useContext(usercontext);
  const { lines, setlines } = useContext(linescontext);
  const [editRow, setEditRow] = useState(null);
  const [editedData, setEditedData] = useState({
    Linename: '',
    ipaddress: '',
    packline: '',
    extruder: '',
    sqlid:'',
  });
  const [showAddModal, setShowAddModal] = useState(false); // State for showing/hiding the add modal
  const [newData, setNewData] = useState({
    Linename: '',
    ipaddress: '',
    packline: 1,
    extruder: 0,
  });
  const [addLineMessage, setAddLineMessage] = useState('');

  const fetchlines = async () => {
    try {
      const response = await fetch('http://10.144.18.208:1434/api/getlines', {
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
    console.log(lines);
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
      sqlid:'',
    });
  };

  const handledelete = async (id) => {
    try {
        let linename;
        for(let i = 0; i<lines.length; i++){
            if(lines[i].lineid = id){
                linename = lines[i]
            }
        }
      const response = await fetch(`http://10.144.18.208:1434/api/deleteline/${id}`, {
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
    }
    handleSaveAdd();
  };

  const checkeditline = () => {
    console.log(editedData)
    const regexExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    for (let i = 0; i < lines.length; i++) {
      if(i!==editRow){
        if(editedData.Linename.trim() === ""){
            setAddLineMessage('Line Name is blank')
            return;
        }
        if(editedData.ipaddress.trim() === ""){
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
        if(editedData.Linename.trim() === ""){
            setAddLineMessage('IP Address is blank')
            return;
        }
        if(editedData.ipaddress.trim() === ""){
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
      const response = await fetch('http://10.144.18.208:1434/api/updateline', {
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
      const response = await fetch('http://10.144.18.208:1434/api/updatetablename', {
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
      const response = await fetch('http://10.144.18.208:1434/api/addnewtable', {
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
    try {
      const response = await fetch('http://10.144.18.208:1434/api/deletetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({Linename: linename}),
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSaveAdd = async () => {
    try {
      const response = await fetch('http://10.144.18.208:1434/api/insertnewline', {
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
      <view>
        <Toolbar />
        <br />
        <div className="editletable-container">
          <ReactBootStrap.Table striped bordered hover>
            <thead>
              <tr>
                <th>Line Name</th>
                <th>IP Address</th>
                <th>Type</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((rowData, index) => (
                <tr key={index}>
                  <td>{rowData.Linename}</td>
                  <td>{rowData.ipaddress}</td>
                  <td>{gettype(rowData.packline, rowData.extruder)}</td>
                  <td>
                    <button className="trackerbutton" onClick={() => handleEditClick(index)}>
                      Edit
                    </button>
                  </td>
                  <td>
                    <button className="trackerbutton" onClick={() => handledeleteClick(index)}>
                      Delete
                    </button>
                  </td>
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
        <button className="editlebutton" onClick={handleAddClick}>
          Add
        </button>
        <button className="editlebutton" onClick={() => navigate('/Account')}>
          Go Back
        </button>
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

export default Editlineextruder;
