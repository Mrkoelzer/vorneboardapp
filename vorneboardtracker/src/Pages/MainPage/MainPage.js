import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './mainpage.css';
import { linescontext } from '../../contexts/linescontext';
import { selectedlinecontext } from '../../contexts/selectedlinecontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faMagnifyingGlassChart, faWrench } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';

function MainPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { lines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext);
  const { settoolbarinfo } = useContext(Toolbarcontext)

  useEffect(() => {
    settoolbarinfo([{Title: 'Vorne Home Page'}])
    sessionStorage.setItem('LastPage', '')
  }, []);

  const handleNavigate = (index) => {
    setselectedline(lines[index].Linename);
    navigate(`/LineView`)
  };
  // Create an array of buttons based on the lines data
  const saveDataToLocalStorage = (key, data) => {
    if (key === 'selectedline') {
      sessionStorage.setItem(key, data); // Store as a string without quotes
    } else {
      sessionStorage.setItem(key, JSON.stringify(data)); // Store other data as JSON strings
    }
  };
  // Load data from local storage when the component mounts
  useEffect(() => {
    saveDataToLocalStorage('partInfo', []);
    saveDataToLocalStorage('selectedline', '')
    saveDataToLocalStorage('processState', '');
    saveDataToLocalStorage('selectedline', '')
  }, []);

  let lineButtons;
  const selectedTabletLine = localStorage.getItem('selectedtabletline');

  if (!selectedTabletLine) {
    lineButtons = lines.map((line, index) => (
      // Check if extruder is not equal to 1 before rendering the button
      line.extruder !== 1 && (
        <button key={index} className="mainpagebutton" onClick={() => handleNavigate(index)}>
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faClipboard} className="icon" />
          </div>
          <div className="text">{line.Linename} Pack View</div>
        </button>
      )
    ));
  } else {
    const selectedIndex = lines.findIndex((line) => line.Linename === selectedTabletLine);
    if (selectedIndex !== -1) {
      lineButtons = [
        <button
          key={selectedIndex}
          className="mainpagebutton"
          onClick={() => handleNavigate(selectedIndex)}
        >
          <div className="icon-wrapper">
            <FontAwesomeIcon icon={faClipboard} className="icon" />
          </div>
          <div className="text">{lines[selectedIndex].Linename} Pack View</div>
        </button>,
      ];
    } else {
      lineButtons = [];
    }
  }

  return (
    <div className='mainpage'>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default MainPage;