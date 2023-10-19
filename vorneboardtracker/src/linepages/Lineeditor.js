import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import { linedatacontext } from '../contexts/linedatacontext';
import { line3partdatacontext } from '../contexts/linepartdatacontext';
import { linescontext } from '../contexts/linescontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../Components/Linepagetoolbar';
import '../Css/linepages.css'
import { selectedlinecontext } from '../contexts/selectedlinecontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function Line3() {
  const [linepagedata, setlinepagedata] = useState([]);
  const [linedatatable, setlinedatatable] = useState([]);
  const [lineparts, setlineparts] = useState([]);
  const { selectedline, setselectedline } = useContext(selectedlinecontext)
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const { lines, setlines } = useContext(linescontext);
  const [goodcount, setgoodcount] = useState(1);
  const [rejectcount, setrejectcount] = useState(1);
  const { localipaddr } = useContext(ipaddrcontext);

  const navigate = useNavigate();
  const apiEndpoints = {
    action1: 'updatelinenoorders',
    action2: 'updatelinestartproduction',
    action3: 'updatelinechangeover'
    // Add more mappings as needed
  };

  function getInitialActionreason(processState) {
    if (processState === 'Adjustment') {
      return 'action1'; // Assuming 'No Production' and 'Not Monitored' correspond to 'No Orders' action
    } else if (processState === 'Autonomous Maintenance') {
      return 'action2'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'Breakdown') {
      return 'action3'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'Jam') {
      return 'action4'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'No Material') {
      return 'action5'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'No Operator') {
      return 'action6'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'Missing Reason') {
      return 'action7'
    }
    // Add more conditions as needed for other process states
    return ''; // Default to an empty value if no match is found
  }

  function getInitialAction(processState) {
    if (processState === 'No Production' || processState === 'Not Monitored') {
      return 'action1'; // Assuming 'No Production' and 'Not Monitored' correspond to 'No Orders' action
    } else if (processState === 'Running' || processState === 'Down' || processState === 'Detecting State' || processState === 'Break') {
      return 'action2'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'Changeover') {
      return 'action3'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    // Add more conditions as needed for other process states
    return ''; // Default to an empty value if no match is found
  }

  const handleproductionSelect = async (selectedAction) => {
    const selectedEndpointIdentifier = apiEndpoints[selectedAction];
    let ipaddress = linepagedata[0].lineip
    console.log(linepagedata)
    if (selectedEndpointIdentifier) {
      // Map the endpoint identifier to the full URL
      const selectedEndpoint = `http://${localipaddr}:1433/${selectedEndpointIdentifier}`;

      // Construct requestData based on the selected action
      let requestData;
      if (selectedAction === 'action1') {
        requestData = { value: 'no_orders' }; // Do not include ipaddress here
      } else if (selectedAction === 'action2') {
        requestData = { value: {} }; // Do not include ipaddress here
      } else if (selectedAction === 'action3') {
        requestData = { value: "changeover" }; // Do not include ipaddress here
      }

      // Add ipaddress to the requestData
      requestData.ipaddress = ipaddress;

      // Make the API call based on selected action and row
      await Axios.post(selectedEndpoint, requestData)
        .then((response) => {
          console.log('API call success:', response.data);
        })
        .catch((error) => {
          console.error('API call error:', error);
        });
    }
  };

  const getPartNumbers = async (tableName) => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getlinepart/${tableName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data) {
        setlineparts(data.result.recordset);
      } else {
        console.log('error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlereasonSelect = async (selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://${localipaddr}:1433/updateprocessstatereason`;

    // Construct requestData based on the selected action
    let requestData;
    if (selectedAction === 'action1') {
      requestData = {
        "enabled": true,
        "reason": "adjustment",
        ipaddress: linepagedata[0].lineip
      };
    } else if (selectedAction === 'action2') {
      requestData = {
        "enabled": true,
        "reason": "autonomous_maintenance",
        ipaddress: linepagedata[0].lineip
      };
    }
    else if (selectedAction === 'action3') {
      requestData = {
        "enabled": true,
        "reason": "breakdown",
        ipaddress: linepagedata[0].lineip
      };
    }
    else if (selectedAction === 'action4') {
      requestData = {
        "enabled": true,
        "reason": "jam",
        ipaddress: linepagedata[0].lineip
      };
    }
    else if (selectedAction === 'action5') {
      requestData = {
        "enabled": true,
        "reason": "no_material",
        ipaddress: linepagedata[0].lineip
      };
    }
    else if (selectedAction === 'action6') {
      requestData = {
        "enabled": true,
        "reason": "no_operator",
        ipaddress: linepagedata[0].lineip
      };
    }
    else if (selectedAction === 'action7') {
      return
    }

    // Make the API call based on selected action and row
    await Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        console.error('API call error:', error);
      });
  };

  const handlepartidSelect = async (selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://${localipaddr}:1433/updatepartidline`;

    // Replace hyphens with "j" globally
    selectedAction = selectedAction.replace(/-/g, 'j');
    let selectedpart = selectedAction.replace(/j/g, '-')
    let linedata;
    lineparts.forEach((line) => {
      if (line.Part_ID === selectedpart) {
        linedata = line
      }
    });
    // Construct requestData based on the selected action
    let requestData;
    requestData = {
      part_id: linedata.Part_ID,
      part_description: linedata.Alternate_Part_ID,
      ideal_cycle_time: linedata.Ideal_Cycle_Time_s,
      takt_time: linedata.Takt_Time_s,
      target_labor_per_piece: linedata.Target_Labor_per_Piece_s,
      down_threshold: linedata.Down_s,
      count_multipliers: [
        linedata.Count_Multiplier_1,
        linedata.Count_Multiplier_2,
        linedata.Count_Multiplier_3,
        linedata.Count_Multiplier_4,
        linedata.Count_Multiplier_5,
        linedata.Count_Multiplier_6,
        linedata.Count_Multiplier_7,
        linedata.Count_Multiplier_8,
      ],
      Target_multipliers: linedata.Target_Multiplier,
      start_with_changeover: "false",
      ipaddress: linepagedata[0].lineip
    }

    // Make the API call based on selected action and row
    await Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        console.error('API call error:', error);
      });
  };

  function getshiftname(shift) {
    if (shift === "first_shift") {
      return "First Shift"
    }
    else if (shift === "second_shift") {
      return "Second Shift"
    }
    else if (shift === "third_shift") {
      return "Third Shift"
    }
    else {
      return "Unkown Shift"
    }
  }

  function getsectotime(time) {
    var date = new Date(0);
    date.setSeconds(time); // specify value for SECONDS here
    var timeString = date.toISOString().substring(11, 19);
    return timeString
  }
  const fetchlines = async () => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getlines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });

      const data = await response.json();
      if (data) {
        setlines(data.result.recordset)
        return fetchAllLineData(data.result.recordset)
      } else {
        console.log("error")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const fetchAllLineData = async (data) => {
    const lineDataPromises = data.map(async (line) => {
      const linename = line.Linename;
      const lineip = line.ipaddress;
      const partrunData = await getpartrun(line.ipaddress);
      const linedata = await getlinedata(line.ipaddress);
      const processStateDetailsData = await getprocessstatedetails(line.ipaddress);
      const shiftData = await getshiftdata(line.ipaddress);

      // Combine all the data into a single object
      const lineDataObject = {
        lineip,
        linename,
        partrunData,
        linedata,
        processStateDetailsData,
        shiftData,
      };

      // Use map to check for null values and replace them with 0
      Object.keys(lineDataObject).forEach((key) => {
        if (lineDataObject[key] === null) {
          lineDataObject[key] = 0;
        }
      });

      return lineDataObject;
    });

    // Wait for all promises to resolve
    const lineData = await Promise.all(lineDataPromises);
    // Filter out only the data for the selected line
    const filteredLineData = lineData.filter((data) => data.linename === selectedline);
    filteredLineData.forEach((data) => {
      if (data.linedata) {
        data.linedata = data.linedata.map((value) => (value === null ? 0 : value));
      }
    });

    // Create an array with the predefined structure
    const linedatatable = filteredLineData.map((data) => ({
      shift: getshiftname(data.linedata[0]) || 0, // Replace null with 0
      start_time: data.linedata[1] || '', // Replace null with an empty string
      run_time: getsectotime(data.linedata[2]) || 0, // Replace null with 0
      unplanned_stop_time: getsectotime(data.linedata[3]) || 0, // Replace null with 0
      in_count: data.linedata[4] || 0, // Replace null with 0
      good_count: data.linedata[5] || 0, // Replace null with 0
      reject_count: data.linedata[6] || 0, // Replace null with 0
      average_cycle_time: (Math.round(data.linedata[7] * 100) / 100).toFixed(2) || 0, // Replace null with 0
      ideal_cycle_time: data.linedata[8].toFixed(2) || 0, // Replace null with 0
      oee: (data.linedata[9] * 100).toFixed(1) || 0, // Replace null with 0
    }));
    setlinedatatable(linedatatable);
    return filteredLineData;
  };

  const getpartrun = async (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/part_run`;

    return await Axios.get(apiUrl)
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
  const getprocessstatedetails = async (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/process_state/details`;

    return await Axios.get(apiUrl)
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
  const getshiftdata = async (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=process_state_reason_display_name`;

    return await Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;

        if (data) {
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

  const getlinedata = async (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=shift,start_time,run_time,unplanned_stop_time,in_count,good_count,reject_count,average_cycle_time,ideal_cycle_time,oee`;

    return await Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;

        if (data) {
          return data.data.events[0];
        } else {
          return { ...data, part_id: 'N/A' };
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        return null;
      });
  };

  const handlegoodcount = async () => {
    let requestData = {
      count: parseInt(goodcount),
      ipaddress: linepagedata[0].lineip
    }
    await Axios.post(`http://${localipaddr}:1433/updategoodcount`, requestData)
      .then((response) => {
        setgoodcount(1)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  const handlerejectcount = () => {
    let requestData = {
      count: parseInt(rejectcount),
      ipaddress: linepagedata[0].lineip
    }
    Axios.post(`http://${localipaddr}:1433/updaterejectcount`, requestData)
      .then((response) => {
        setrejectcount(1)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
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




  const getColorForOEE = (oee) => {
    if (oee < 39.9) return 'darkred';
    else if (oee >= 40 && oee <= 64.9) return 'lightcoral';
    else if (oee >= 65 && oee <= 84.9) return 'orange';
    else return 'green';
  };


  const getpartname = () => {
    for (let i = 0; i < lineparts.length; i++) {
      if (lineparts[i].Part_ID === linepagedata[0].partrunData.part_id.replace(/j/g, '-')) {
        return lineparts[i].Alternate_Part_ID;
      }
    }
    return "No Part Name"
  }

  // Initialize an interval reference using a ref
  const saveDataToLocalStorage = (key, data) => {
    if (key === 'selectedline') {
      localStorage.setItem(key, data); // Store as a string without quotes
    } else {
      localStorage.setItem(key, JSON.stringify(data)); // Store other data as JSON strings
    }
  };

  useEffect(() => {
    const savedSelectedLine = localStorage.getItem('selectedline');
    if (savedSelectedLine) {
      setselectedline(savedSelectedLine);
    }
  }, [localStorage.getItem('selectedline')]);

  useEffect(() => {
    // Ensure selectedline is set before fetching data
    if (selectedline) {
      const fetchDataAndSetState = async () => {
        const lineData = await fetchlines();
        if (lineData) {
          // Call the getprocessstate function here
          setlinepagedata(lineData);
          getPartNumbers(selectedline);
          saveDataToLocalStorage('selectedline', selectedline)
        }
      };

      fetchDataAndSetState();

      // Fetch data every 10 seconds
      const interval = setInterval(fetchDataAndSetState, 10000);

      // Clean up the interval when the component unmounts
      return () => clearInterval(interval);
    }
  }, [selectedline]);

  useEffect(() => {
    // This effect will run whenever linepagedata changes
    if (linepagedata.length !== 0) {
      setIsLoading(false); // Data has been loaded, set isLoading to false

    }
  }, [linepagedata]);

  return (
    <div className="linepage">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Toolbar line={linepagedata} />
          <br />
          <div className='lineflexbox-container'>

            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Part ID and Name </p>
              {linepagedata[0].partrunData.part_id.replace(/j/g, '-')}
              <p>{getpartname()}</p>
            </div>
            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Change Production State</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={getInitialAction(linepagedata[0].processStateDetailsData)}
                onChange={(e) => handleproductionSelect(e.target.value)}
              >
                <option value="action1">No Orders</option>
                <option value="action2">Running Production</option>
                <option value="action3">Changeover</option>
                {/* Add more options here */}
              </ReactBootStrap.Form.Control>
            </div>
            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Process State Reason</p>
              {linepagedata[0].shiftData.events[0][0]}
            </div>
            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Change Part</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={linepagedata[0].partrunData.part_id.replace(/j/g, '-')}
                onChange={(e) => handlepartidSelect(e.target.value)}
              >
                {lineparts.map((item) => (
                  <option key={item.Part_ID} value={item.Part_ID}>
                    {item.Part_ID}
                  </option>
                ))}
                {/* Add more options here */}
              </ReactBootStrap.Form.Control>
            </div>
            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Increment Count & Reject</p>
              <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
                <button className="goodrejectbutton" onClick={handlegoodcount}>
                  <div className="goodrejecticon-wrapper">
                    <FontAwesomeIcon icon={faPlus} className="goodrejecticon" />
                  </div>
                </button>
                <input
                  className='linepagebutton2'
                  value={goodcount}
                  onChange={(e) => setgoodcount(e.target.value)}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
                <button className="goodrejectbutton" onClick={handlerejectcount}>
                  <div className="goodrejecticon-wrapper">
                    <FontAwesomeIcon icon={faMinus} className="goodrejecticon" />
                  </div>
                </button>
                <input
                  className='linepagebutton2'
                  value={rejectcount}
                  onChange={(e) => setrejectcount(e.target.value)}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            <div className='lineflexbox-item'>
              <p className='linetextinboxes'>Change Reason</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={getInitialActionreason(linepagedata[0].shiftData.events[0][0])}
                onChange={(e) => handlereasonSelect(e.target.value)}
                disabled={linepagedata[0].shiftData.events[0][0] === "Running Normally" || linepagedata[0].shiftData.events[0][0] === "No Orders" || linepagedata[0].shiftData.events[0][0] === "Lunch"}
              >
                <option value="action1">Adjustment</option>
                <option value="action2">Maintenance</option>
                <option value="action3">Breakdown</option>
                <option value="action4">Jam</option>
                <option value="action5">No Materials</option>
                <option value="action6">No Operator</option>
                <option value="action7">Missing Reason</option>
                {/* Add more options here */}
              </ReactBootStrap.Form.Control>
            </div>
            <div className="linetable-container">
              <ReactBootStrap.Table striped bordered hover>
                <thead>
                  <tr className="header-row">
                    <th>Shift</th>
                    <th>Run Time</th>
                    <th>Down Time</th>
                    <th>OEE</th>
                    <th>In Count</th>
                    <th>Good Count</th>
                    <th>Reject Count</th>
                    <th>Avg. Cycle Time</th>
                    <th>Ideal Cycle Time</th>
                  </tr>
                </thead>
                <tbody>
                  {linedatatable.map((rowData, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                      <td>{rowData.shift}</td>
                      <td>{rowData.run_time}</td>
                      <td>{rowData.unplanned_stop_time}</td>
                      <td style={{ backgroundColor: getColorForOEE(rowData.oee) }}>{rowData.oee}%</td>
                      <td>{rowData.in_count}</td>
                      <td>{rowData.good_count}</td>
                      <td>{rowData.reject_count}</td>
                      <td>{rowData.average_cycle_time}</td>
                      <td>{rowData.ideal_cycle_time}</td>
                    </tr>
                  ))}
                </tbody>
              </ReactBootStrap.Table>
            </div>
          </div>
        </>
      )}
      <div style={{ display: 'flex', justifyContent: "space-evenly" }}>
        <button className="goodreject2button" onClick={() => navigate('/Tracker')}>
          <div className="goodreject2icon-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} className="goodreject2icon" />
          </div>
          <div className="goodreject2text">Go Back</div>
        </button>
      </div>
    </div>
  );
}

export default Line3;