import React from "react";
import './ErrorLogPopup.css';
import * as ReactBootStrap from 'react-bootstrap';

function ErrorLogPopup({ data, show, handleClose }) {
  return (
    <div className={`ErrorLog-modal ${show ? "show" : ""}`}>
      <div className="ErrorLog-modal-popup">
        <div className="ErrorLog-modal-header">
          <h2>Error Log</h2>
        </div>
        <div className="ErrorLog-modal-body">
        <ReactBootStrap.Table striped bordered hover>
                    <thead>
                        <tr className="header-row">
                            <th>Type</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((rowData, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                <td>{rowData.error_type.charAt(0).toUpperCase() + rowData.error_type.slice(1)}</td>
                                <td>{rowData.error_message}</td>
                            </tr>
                        ))}
                    </tbody>
                </ReactBootStrap.Table>
        </div>
        <div className="ErrorLog-modal-footer">
          <button className="ErrorLog-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
  
  export default ErrorLogPopup;