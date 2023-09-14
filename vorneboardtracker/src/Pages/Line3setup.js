import * as React from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/linesetup.css';
import {useNavigate} from 'react-router-dom';
import Toolbar from '../Components/Linesetuptoolbar';

function Line3setup() {
   const navigate = useNavigate(); 

  return (
    <div className="linesetuppage">
      <Toolbar/>
        <button className='mainpagebutton' onClick={() => navigate('/')}>
        Go Back
      </button>
    </div>
  );
}

export default Line3setup;
