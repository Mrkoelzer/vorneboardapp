import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import '../Css/tracker.css';
import Trackertoolbar from '../Components/Trackertoolbar';
import { linescontext } from '../contexts/linescontext';
import { selectedlinecontext } from '../contexts/selectedlinecontext';

function Tracker() {
  const { partruntable, setpartruntable } = useContext(partruncontext);
  const { lines } = useContext(linescontext);
  const { selectedline, setselectedline } = useContext(selectedlinecontext)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  const handleNavigate = (index) => {
    setselectedline(lines[index].Linename);
      navigate('/lineeditor');
  };

  const fetchAllLineData = async () => {
    const lineDataPromises = lines.map(async (line) => {
      const linename = line.Linename;
      const partrunData = await getpartrun(line.ipaddress);
      const processStateDetailsData = await getprocessstatedetails(line.ipaddress);
      const processStateReasonData = await getprocessstatereason(line.ipaddress);

      // Combine all the data into a single object
      return {
        linename,
        partrunData,
        processStateDetailsData,
        processStateReasonData,
      };
    });

    // Wait for all promises to resolve
    const lineData = await Promise.all(lineDataPromises);
    //console.log(lineData)
    // Filter out any null values if needed
    const filteredLineData = lineData.filter((data) => data !== null);
    return filteredLineData;
  };

  const getpartrun = (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/part_run`;

    return Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;

        if (data && data.data.part_id) {
          return data.data;
        } else {
          return { ...data, part_id: 'N/A' };
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        return null;
      });
  };

  const getprocessstatedetails = (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/process_state/details`;

    return Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;
        if (data) {
          let updateddata = getprocessstate(data.data);
          // Ensure data.part_id exists before accessing it
          return updateddata;
        } else {
          // Handle the case where part_id is missing or undefined
          return { ...data, part_id: 'N/A' };
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        return null;
      });
  };

  const getprocessstatereason = (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=process_state_reason_display_name`;

    return Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;
        if (data) {
          // Ensure data.part_id exists before accessing it
          return data.data.events[0][0];
        } else {
          // Handle the case where part_id is missing or undefined
          return { ...data, part_id: 'N/A' };
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        return null;
      });
  };

  const getprocessstate = (data) => {
    if (data.break.active === true) {
      return 'Break';
    } else if (data.changeover.active === true) {
      return 'changover';
    } else if (data.detecting_state.active === true) {
      return 'Detecting State';
    } else if (data.down.active === true) {
      return 'Down';
    } else if (data.no_production.active === true) {
      return 'No Production';
    } else if (data.not_monitored.active === true) {
      return 'Not Monitored';
    } else if (data.running.active === true) {
      return 'Running';
    }
    return 'error';
  };

  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const lineData = await fetchAllLineData();
      if (lineData.every((data) => data !== null)) {
        // Call the getprocessstate function here
        setpartruntable(lineData);
        console.log(lineData);
        setIsLoading(false); // Data has been loaded, set isLoading to false
      }
    };
  
    fetchDataAndSetState();
  
    // Fetch data every 10 seconds
    const interval = setInterval(fetchDataAndSetState, 10000);
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tracker">
      <Trackertoolbar />
      <br />
      <div className="table-container">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
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
                    {rowData.processStateDetailsData === 'Running' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'green' }} />
                    ) : rowData.processStateDetailsData === 'Down' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'red' }} />
                    ) : rowData.processStateDetailsData === 'No Production' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'blue' }} />
                    ) : rowData.processStateDetailsData === 'Not Monitored' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'lightblue' }} />
                    ) : rowData.processStateDetailsData === 'Detecting State' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'grey' }} />
                    ) : rowData.processStateDetailsData === 'Changeover' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'yellow' }} />
                    ) : rowData.processStateDetailsData === 'Break' ? (
                      <FontAwesomeIcon icon={faCircle} style={{ color: 'darkblue' }} />
                    ) : (
                      <FontAwesomeIcon icon={faCircle} />
                    )}
                  </td>
                  <td>{rowData.linename}</td>
                  <td>{rowData.partrunData.part_id.replace(/j/g, '-')}</td>
                  <td>{rowData.processStateDetailsData}</td>
                  <td>
                    <button className='trackerbutton' onClick={() => handleNavigate(index)}>More</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ReactBootStrap.Table>
        )}
      </div>
    </div>
  );
}

export default Tracker;
