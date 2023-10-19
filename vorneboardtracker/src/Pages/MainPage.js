import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/mainpage.css';
import Mainpagetoolbar from '../Components/Mainpagetoobar';
import { linescontext } from '../contexts/linescontext';
import { selectedlinecontext } from '../contexts/selectedlinecontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faMagnifyingGlassChart, faWrench } from '@fortawesome/free-solid-svg-icons';

function MainPage() {
  const navigate = useNavigate();
  const { lines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext);

  const handleNavigate = (index) => {
    setselectedline(lines[index].Linename);
    navigate(`/Linepackview`)
  };
  // Create an array of buttons based on the lines data
  const saveDataToLocalStorage = (key, data) => {
    if (key === 'selectedline') {
      localStorage.setItem(key, data); // Store as a string without quotes
    } else {
      localStorage.setItem(key, JSON.stringify(data)); // Store other data as JSON strings
    }
  };
  // Load data from local storage when the component mounts
  useEffect(() => {
    saveDataToLocalStorage('partInfo', []);
    saveDataToLocalStorage('selectedline', '')
    saveDataToLocalStorage('processState', '');
  }, []);
  const lineButtons = lines.map((line, index) => (
    <button
      key={index}
      className='mainpagebutton'
      onClick={() => handleNavigate(index)}
    >
      <div className="icon-wrapper">
        <FontAwesomeIcon icon={faClipboard} className="icon" />
      </div>
      <div className="text">{line.Linename} Pack View</div>
    </button>
  ));

  return (
    <div className='mainpage'>
      <Mainpagetoolbar />
      <div className='mainpage-flexbox-container'>
        <button className='mainpagebutton' onClick={() => navigate('/Tracker')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faMagnifyingGlassChart} className="icon" />
          </div>
          <div className="text">Tracker</div>
        </button>
        <button className='mainpagebutton' onClick={() => navigate('/Updater')}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faWrench} className="icon" />
          </div>
          <div className="text">Updater</div>
        </button>
        {lineButtons}
      </div>
    </div>
  );
}

export default MainPage;