import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faCircleInfo, faArrowLeft, faVideo } from '@fortawesome/free-solid-svg-icons';
import '../Css/tracker.css';
import { linescontext } from '../contexts/linescontext';
import { selectedlinecontext } from '../contexts/selectedlinecontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { usercontext } from '../contexts/usercontext';
import { Toolbarcontext } from '../Components/Navbar/Toolbarcontext';

function Tracker() {
  const { partruntable, setpartruntable } = useContext(partruncontext);
  const { lines, setlines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const { localipaddr } = useContext(ipaddrcontext);
  const { userdata, setuserdata } = useContext(usercontext);
  const { settoolbarinfo } = useContext(Toolbarcontext)

  useEffect(() => {
    settoolbarinfo([{Title: 'Vorne Tracker Page'}])
  }, []);

  const handleNavigate = (index) => {
    setselectedline(lines[index].Linename);
    navigate('/lineeditor');
  };
  const saveDataToLocalStorage = (key, data) => {
    if (key === 'selectedline') {
      localStorage.setItem(key, data); // Store as a string without quotes
    }
  };
  useEffect(() => {
    const userDataFromLocalStorage = sessionStorage.getItem('userdata');
    let parsedUserData;
    if (userDataFromLocalStorage) {
        parsedUserData = JSON.parse(userDataFromLocalStorage);
        setuserdata(parsedUserData);
    }
    if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
        if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
            navigate('/Changepasswordpin');
        }
    } else {
      sessionStorage.setItem('LastPage', 'Tracker')
        navigate('/login');
    }
}, [setuserdata, navigate]);
  // Load data from local storage when the component mounts
  useEffect(() => {
    saveDataToLocalStorage('selectedline', '')
  }, []);
  const fetchlines = async () => {
    if (lines.length === 0) {
      const storedLines = localStorage.getItem('lines');
      // Parse the retrieved string back into an array
      const parsedLines = storedLines ? JSON.parse(storedLines) : [];
      console.log(parsedLines)
      // Set the retrieved data into useState
      setlines(parsedLines);
      return fetchAllLineData(parsedLines)
  }
  else{
    console.log(lines)
    return fetchAllLineData(lines)
  }
  };
  const fetchAllLineData = async (data) => {
    console.log(data)
    const lineDataPromises = data.map(async (line) => {
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
      const lineData = await fetchlines();
      if (lineData) {
        // Call the getprocessstate function here
        setpartruntable(lineData);
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
      <br />
      <div className="table-container">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ReactBootStrap.Table striped bordered hover>
            <thead>
              <tr className="header-row">
                <th>X</th>
                <th>Line Name</th>
                <th>Part ID</th>
                <th>Process State</th>
                <th>Process State Reason</th>
                <th style={{ width: '10%' }}>More Information</th>
              </tr>
            </thead>
            <tbody>
              {partruntable.map((rowData, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
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
                  <td>{rowData.processStateReasonData}</td>
                  <td><p className='trackermorebutton' onClick={() => handleNavigate(index)}><FontAwesomeIcon icon={faCircleInfo} /></p></td>
                </tr>
              ))}
            </tbody>
          </ReactBootStrap.Table>
        )}
        <div style={{ display: 'flex', alignSelf: 'center' }}>
          <button className="trackerbutton" onClick={() => navigate('/Livecameraviews')}>
          <div className="trackericon-wrapper">
            <FontAwesomeIcon icon={faVideo} className="trackericon" />
          </div>
          <div className="trackertext">Live Views</div>
        </button>
        <button className="trackerbutton" onClick={() => navigate('/')}>
          <div className="trackericon-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} className="trackericon" />
          </div>
          <div className="trackertext">Go Back</div>
        </button>
        </div>
      </div>
      <br />
    </div>
  );
}

export default Tracker;
