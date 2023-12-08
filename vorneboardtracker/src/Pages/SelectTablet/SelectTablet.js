import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { linescontext } from '../../contexts/linescontext';
import { usercontext } from '../../contexts/usercontext';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';

function SelectTablet() {
  const navigate = useNavigate();
  const { lines } = useContext(linescontext);
  const [currentline, setcurrentline] = useState(localStorage.getItem('selectedtabletline') || '');
  const [message, setMessage] = useState('');
  const { userdata, setuserdata } = useContext(usercontext);
  const { settoolbarinfo } = useContext(Toolbarcontext)

  useEffect(() => {
    settoolbarinfo([{Title: 'Vorne Select Tablet'}])
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

  const handleSelectedTabletLine = (line) => {
    setcurrentline(line);
    localStorage.setItem('selectedtabletline', line);
    setMessage('Selected Tablet Line Has Been Updated');
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  useEffect(() => {
    const savedSelectedLine = localStorage.getItem('selectedtabletline');
    if (savedSelectedLine) {
      setcurrentline(savedSelectedLine);
    }
  }, []);

  return (
    <div className="tracker">
      <br />
      <div className="table-container">
        Tablet's Currently Selected Line: 
        <ReactBootStrap.Form.Control
          className='linepagebutton'
          as="select"
          value={currentline}
          onChange={(e) => handleSelectedTabletLine(e.target.value)}
        >
          <option value="">None Selected</option>
          {lines.map((line) => (
            <option key={line.Linename} value={line.Linename}>
              {line.Linename}
            </option>
          ))}
        </ReactBootStrap.Form.Control>
        {message && <p>{message}</p>}
        <button className="trackerbutton" onClick={() => navigate('/Settings')}>
          <div className="trackericon-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} className="trackericon" />
          </div>
          <div className="trackertext">Go Back</div>
        </button>
      </div>
      <br />
    </div>
  );
}

export default SelectTablet;
