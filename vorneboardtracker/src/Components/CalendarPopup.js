import React from "react";
import '../Css/CalendarPopup.css';

function CalendarPopup({ data, show, handleClose, handleDelete }) {
  console.log(data);

  // Function to group data by shift
  const groupDataByShift = () => {
    const groupedData = {};

    data.forEach(shift => {
      const shiftName = shift.shift_display_name;
      if (!groupedData[shiftName]) {
        groupedData[shiftName] = [];
      }

      groupedData[shiftName].push(shift);
    });

    return groupedData;
  };

  const formatDate = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString();
  };

  const formatRunTime = (secondsWithFractions) => {
    const seconds = Math.floor(secondsWithFractions);
    const milliseconds = (secondsWithFractions % 1) * 1000;
  
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    const formattedMilliseconds = String(Math.floor(milliseconds)).padStart(3, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  // Function to render a table for each shift
  const renderTables = () => {
    const groupedData = groupDataByShift();

    return Object.entries(groupedData).map(([shiftName, shiftData]) => (
      <div key={shiftName}>
        <h3>{shiftName}</h3>
        <table>
          <thead>
            <tr className="header-row">
              <th>Title</th>
              <th>Part Display Name</th>
              <th>Process States</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Run Time</th>
              <th>In Count</th>
              <th>Good Count</th>
              <th>Reject Count</th>
              
              {/* Add more table headers as needed */}
            </tr>
          </thead>
          <tbody>
            {shiftData.map((shift, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                <td>{shift.title}</td>
                <td>{shift.part_display_name}</td>
                <td>{Array.isArray(shift.process_state) ? shift.process_state.join(', ') : shift.process_state}</td>
                <td>{formatDate(shift.start_time)}</td>
                <td>{formatDate(shift.end_time)}</td>
                <td>{formatRunTime(shift.run_time)}</td>
                <td>{shift.in_count}</td>
                <td>{shift.good_count}</td>
                <td>{shift.reject_count}</td>
                {/* Add more table data cells as needed */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className={`Calendar-Popup-modal ${show ? "show" : ""}`}>
      <div className="Calendar-Popup-modal-popup">
        <div className="Calendar-Popup-modal-header">
          <h2>Day's Shift Information</h2>
        </div>
        <div className="Calendar-Popup-modal-body">
          {renderTables()}
        </div>
        <div className="Calendar-Popup-modal-footer">
          <button className="Calendar-Popup-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarPopup;
