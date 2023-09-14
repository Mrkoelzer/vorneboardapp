import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/mainpage.css';
import Mainpagetoolbar from '../Components/Mainpagetoobar';
import { linescontext } from '../contexts/linescontext';
import { selectedlinecontext } from '../contexts/selectedlinecontext';

function MainPage() {
  const navigate = useNavigate();
  const { lines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext);

  const handleNavigate = (index) => {
    setselectedline(lines[index].Linename);
      navigate(`/Linepackview`)
  };
  // Create an array of buttons based on the lines data
  const lineButtons = lines.map((line, index) => (
    <button
      key={index}
      className='mainpagebutton'
      onClick={() => handleNavigate(index)}
    >
      {line.Linename} Pack View (beta)
    </button>
  ));

  return (
    <div className='mainpage'>
      <view>
        <Mainpagetoolbar />
        <div className='mainpage-flexbox-container'>
          <br />
          <div>
            <button className='mainpagebutton' onClick={() => navigate('/Tracker')}>
              Tracker
            </button>
            <button className='mainpagebutton' onClick={() => navigate('/Updater')}>
              Updater
            </button>
            {lineButtons}
          </div>
        </div>
      </view>
    </div>
  );
}

export default MainPage;