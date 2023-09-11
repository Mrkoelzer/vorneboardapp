import React, {  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/mainpage.css'
import Mainpagetoolbar from '../Components/Mainpagetoobar';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="mainpage">
      <view>
        <Mainpagetoolbar/>
          <div className='mainpage-flexbox-container'>
            <br />
            <div>
              <button className='mainpagebutton' onClick={() => navigate('/Tracker')}>
                Tracker
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Updater')}>
                Updater
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 3 Pack View (Beta)
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 4 Pack View (Beta)
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 5 Pack View (Beta)
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 7 Pack View (Beta)
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 8 Pack View (Beta)
              </button>
              <button className='mainpagebutton' onClick={() => navigate('/Line3packview')}>
                Line 9 Pack View (Beta)
              </button>
            </div>
          </div>
      </view>
    </div>
  );
}

export default MainPage;
