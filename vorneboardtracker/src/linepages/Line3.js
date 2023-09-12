import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import { linedatacontext } from '../contexts/linedatacontext';
import { line3partdatacontext } from '../contexts/linepartdatacontext';
import { linescontext } from '../contexts/linescontext';
import React, { useContext, useEffect, useState, useRef } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../Components/Linepagetoolbar';
import '../Css/linepages.css'
import { selectedlinecontext } from '../contexts/selectedlinecontext';

function Line3() {
  const { partruntable, setpartruntable } = useContext(partruncontext);
  const [ linedatatable, setlinedatatable ] = useState([]);
  const [ lineparts, setlineparts ] = useState([]);
  const { selectedline } = useContext(selectedlinecontext)
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const { lines } = useContext(linescontext);
  const [goodcount, setgoodcount] = useState(1);
  const [rejectcount, setrejectcount] = useState(1);

  const navigate = useNavigate();
  const apiEndpoints = {
    action1: 'updatelinenoorders',
    action2: 'updatelinestartproduction',
    action3: 'updatelinechangeover'
    // Add more mappings as needed
  };

  function getInitialActionreason(processState) {
    if (processState === 'adjustment') {
      return 'action1'; // Assuming 'No Production' and 'Not Monitored' correspond to 'No Orders' action
    } else if (processState === 'autonomous_maintenance') {
      return 'action2'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'breakdown') {
      return 'action3'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'jam') {
      return 'action4'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'no_material') {
      return 'action5'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
    }
    else if (processState === 'no_operator') {
      return 'action6'; // Assuming 'Running', 'Down', 'Detecting State', and 'Break' correspond to 'Start Production' action
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
    let ipaddress = partruntable[0].lineip
    if (selectedEndpointIdentifier) {
      // Map the endpoint identifier to the full URL
      const selectedEndpoint = `http://10.144.18.208:1433/${selectedEndpointIdentifier}`;
  
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
      const response = await fetch(`http://10.144.18.208:1434/api/getlinepart/${tableName}`, {
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

  const handlereasonSelect = async(selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://10.144.18.208:1433/updateprocessstatereason`;

    // Construct requestData based on the selected action
    let requestData;
    if (selectedAction === 'action1') {
      requestData = {
        "enabled": true,
        "reason": "adjustment",
        ipaddress: partruntable[0].lineip
      };
    } else if (selectedAction === 'action2') {
      requestData = {
        "enabled": true,
        "reason": "autonomous_maintenance",
        ipaddress: partruntable[0].lineip
      };
    }
    else if (selectedAction === 'action3') {
      requestData = {
        "enabled": true,
        "reason": "breakdown",
        ipaddress: partruntable[0].lineip
      };
    }
    else if (selectedAction === 'action4') {
      requestData = {
        "enabled": true,
        "reason": "jam",
        ipaddress: partruntable[0].lineip
      };
    }
    else if (selectedAction === 'action5') {
      requestData = {
        "enabled": true,
        "reason": "no_material",
        ipaddress: partruntable[0].lineip
      };
    }
    else if (selectedAction === 'action6') {
      requestData = {
        "enabled": true,
        "reason": "no_operator"
      };
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

  const handlepartidSelect = async(selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://10.144.18.208:1433/updatepartidline`;

    // Replace hyphens with "j" globally
    selectedAction = selectedAction.replace(/-/g, 'j');

    // Construct requestData based on the selected action
    let requestData;
    requestData = {
      part_id: selectedAction,
      ipaddress: partruntable[0].lineip
    }
    console.log(requestData)

    // Make the API call based on selected action and row
    await Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        console.error('API call error:', error);
      });
  };

  function getshiftname(shift){
    if(shift==="first_shift"){
      return "First Shift"
    }
    else if(shift==="second_shift"){
      return "Second Shift"
    }
    else if(shift==="third_shift"){
      return "Third Shift"
    }
    else{
      return "Unkown Shift"
    }
  }

  function getsectotime(time){
    var date = new Date(0);
    date.setSeconds(time); // specify value for SECONDS here
    var timeString = date.toISOString().substring(11, 19);
    return timeString
  }

  const fetchAllLineData = async () => {
    const lineDataPromises = lines.map(async (line) => {
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
  
    // Update null values to 0 in the linedata array
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
      average_cycle_time: (Math.round(data.linedata[7]*100)/100).toFixed(2) || 0, // Replace null with 0
      ideal_cycle_time: data.linedata[8].toFixed(2) || 0, // Replace null with 0
      oee: (data.linedata[9]*100).toFixed(1) || 0, // Replace null with 0
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
      ipaddress: partruntable[0].lineip
    }
    await Axios.post('http://10.144.18.208:1433/updategoodcount', requestData)
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
      ipaddress: partruntable[0].lineip
    }
    Axios.post('http://10.144.18.208:1433/updaterejectcount', requestData)
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
    else if (oee >= 65 && oee <= 84.9) return 'yellow';
    else return 'green';
  };


  const getpartname = () => {
    for (let i = 0; i < lineparts.length; i++) {
      if (lineparts[i].Part_ID === partruntable[0].partrunData.part_id.replace('j', '-')){
        return lineparts[i].Alternate_Part_ID;
      }
    }
    return "No Part Name"
  }

  // Initialize an interval reference using a ref


  useEffect(() => {
    const fetchDataAndSetState = async () => {
      const lineData = await fetchAllLineData();
      if (lineData.every((data) => data !== null)) {
        // Call the getprocessstate function here
        setpartruntable(lineData);
        getPartNumbers(selectedline);
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
    <div className="linepage">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Toolbar line={partruntable[0].linename} />
          <br />
          <div className='flexbox-container'>

            <div className='flexbox-item'>
              <p className='textinboxes'>Part ID and Name </p>
              {partruntable[0].partrunData.part_id.replace('j', '-')}
              <p>{getpartname()}</p>
            </div>
            <div className='flexbox-item'>
              <p className='textinboxes'>Change Production State</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={getInitialAction(partruntable[0].processStateDetailsData)}
                onChange={(e) => handleproductionSelect(e.target.value)}
              >
                <option value="action1">No Orders</option>
                <option value="action2">Running Production</option>
                <option value="action3">Changeover</option>
                {/* Add more options here */}
              </ReactBootStrap.Form.Control>
            </div>
            <div className='flexbox-item'>
              <p className='textinboxes'>Process State Reason</p>
              {partruntable[0].shiftData.events[0]}
            </div>
            <div className='flexbox-item'>
              <p className='textinboxes'>Change Part</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={partruntable[0].partrunData.part_id.replace('j', '-')}
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
            <div className='flexbox-item'>
              <p className='textinboxes'>Increment Count & Reject</p>
              <p>
                <button className='linepagebutton2' onClick={handlegoodcount}>+ Good</button>
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
              </p>
              <p>
                <button className='linepagebutton2' onClick={handlerejectcount}>+ Reject</button>
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
              </p>
            </div>
            <div className='flexbox-item'>
              <p className='textinboxes'>Change Reason</p>
              <ReactBootStrap.Form.Control
                className='linepagebutton'
                as="select"
                value={getInitialActionreason('adjustment')}
                onChange={(e) => handlereasonSelect(e.target.value)}
                disabled={partruntable[0].shiftData.events[0] === "Running Normally" || partruntable[0].shiftData.events[0] === "No Orders" || partruntable[0].shiftData.events[0] === "Lunch"}
              >
                <option value="action1">Adjustment</option>
                <option value="action2">Maintenance</option>
                <option value="action3">Breakdown</option>
                <option value="action4">Jam</option>
                <option value="action5">No Materials</option>
                <option value="action6">No Operator</option>
                {/* Add more options here */}
              </ReactBootStrap.Form.Control>
            </div>
            <div className="table-container">
              <ReactBootStrap.Table striped bordered hover>
                <thead>
                  <tr>
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
                    <tr key={index}>
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
          <button className='linepagebutton' onClick={() => navigate('/Tracker')}>
            Go Back
          </button>
        </>
      )}
    </div>
  );
}

export default Line3;