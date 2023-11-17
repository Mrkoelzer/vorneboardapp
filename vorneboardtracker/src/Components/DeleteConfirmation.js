import React from "react";
import '../Css/DeleteConfirmation.css';

function DeleteConfirmation({ message, show, handleClose, handleDelete }) {
  return (
    <div className={`custom-modal ${show ? "show" : ""}`}>
      <div className="custom-modal-popup">
        <div className="custom-modal-header">
          <h2>Delete Confirmation</h2>
        </div>
        <div className="custom-modal-body">
          <p>{message}</p>
        </div>
        <div className="custom-modal-footer">
          <button className="delete-confirmation-button" onClick={handleClose}>
            Cancel
          </button>
          <button className="delete-confirmation-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
  
  export default DeleteConfirmation;