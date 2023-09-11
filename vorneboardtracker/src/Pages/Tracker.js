import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import '../Css/tracker.css'
import Trackertoolbar from '../Components/Trackertoolbar';

function Tracker() {
  const { partruntable, setpartruntable } = useContext(partruncontext);
  const navigate = useNavigate();

  const handleNavigate = (index) => {
    if (index === 0) {
      navigate('/line3')
    }
    else if (index === 1) {
      navigate('/line4')
    }
    else if (index === 2) {
      navigate('/line5')
    }
    else if (index === 3) {
      navigate('/line7')
    }
    else if (index === 4) {
      navigate('/line8')
    }
    else if (index === 5) {
      navigate('/line9')
    }
  };

  const getpartrun = () => {
    Axios.get('http://10.144.18.208:1433/getpartrun')
      .then((response) => {
        setpartruntable(response.data);
        getprocessstate(response.data)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const getprocessstate = (partruntableData) => {
    if (!Array.isArray(partruntableData)) {
      console.error('Invalid data:', partruntableData);
      return;
    }
    const updatedPartruntable = partruntableData.map(item => {
      if (item.process_state_break === true) {
        item.process_state = "Break";
      } else if (item.process_state_changeover === true) {
        item.process_state = "changover";
      } else if (item.process_state_detecting_state === true) {
        item.process_state = "Detecting State";
      } else if (item.process_state_down === true) {
        item.process_state = "Down";
      } else if (item.process_state_no_production === true) {
        item.process_state = "No Production";
      } else if (item.process_state_not_monitored === true) {
        item.process_state = "Not Monitored";
      } else if (item.process_state_running === true) {
        item.process_state = "Running";
      }
      return item;
    });

    setpartruntable(updatedPartruntable);
    console.log(updatedPartruntable);
  };

  useEffect(() => {
    // Fetch data when the page opens
    getpartrun();
    // Fetch data every 10 seconds
    const interval = setInterval(getpartrun, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tracker">
      <Trackertoolbar/>
      <br />
      <div className="table-container">
        <ReactBootStrap.Table striped bordered hover>
          <thead>
            <tr>
              <th>X</th>
              <th>Line Name</th>
              <th>Part ID</th>
              <th>Process State</th>
              <th>More Information</th>
            </tr>
          </thead>
          <tbody>
            {partruntable.map((rowData, index) => (
              <tr key={index}>
                <td className="icon-cell">
                  {rowData.process_state === 'Running' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'green' }} />
                  ) : rowData.process_state === 'Down' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'red' }} />
                  ) : rowData.process_state === 'No Production' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'blue' }} />
                  ) : rowData.process_state === 'Not Monitored' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'lightblue' }} />
                  ) : rowData.process_state === 'Detecting State' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'grey' }} />
                  ) : rowData.process_state === 'Changeover' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'yellow' }} />
                  ) : rowData.process_state === 'Break' ? (
                    <FontAwesomeIcon icon={faCircle} style={{ color: 'darkblue' }} />
                  ) : (
                    <FontAwesomeIcon icon={faCircle} />
                  )}
                </td>
                <td>{rowData.line_name}</td>
                <td>{rowData.part_id}</td>
                <td>{rowData.process_state}</td>
                <td>
                  <button className='trackerbutton' onClick={() => handleNavigate(index)}>More</button>
                </td>
              </tr>
            ))}
          </tbody>
        </ReactBootStrap.Table>
      </div>
    </div>
  );
}

export default Tracker;