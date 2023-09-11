import * as React from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/App.css';
import {useNavigate} from 'react-router-dom';

function Line9() {
   const navigate = useNavigate(); 

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Vorne Board Line 9
        </p>
        <button className='mainpagebutton' onClick={() => navigate('/Tracker')}>
        Go Back
      </button>
      </header>
    </div>
  );
}

export default Line9;
