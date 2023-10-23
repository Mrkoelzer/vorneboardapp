import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCircleInfo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../Css/tracker.css';
import Trackertoolbar from '../Components/Liveviewtoolbar';

function Livecameraviews() {
  const navigate = useNavigate();

  return (
    <div className="tracker">
      <Trackertoolbar />
      <br />
      <div className="table-container">
      <iframe allow="fullscreen" frameborder="0" height="800vh" width="100%" src="https://console.rhombussystems.com/share/videowall/AjNIug9vTb-rQ5inCkrYCw"></iframe>
        <button className="trackerbutton" onClick={() => navigate('/Tracker')}>
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

export default Livecameraviews;