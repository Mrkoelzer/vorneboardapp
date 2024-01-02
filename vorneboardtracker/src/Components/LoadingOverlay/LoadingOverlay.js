import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isLoading }) => {
  return (
    <div className={`loading-overlay ${isLoading ? 'visible' : 'hidden'}`}>
      <div>
        <i className="fas fa-circle-notch fa-spin"></i>
        <br/>
        <span className='loading-overlay-Text'>Loading...</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;