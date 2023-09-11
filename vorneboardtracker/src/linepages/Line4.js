import Axios from 'axios';
import { partruncontext } from '../contexts/partruncontext';
import { linedatacontext } from '../contexts/linedatacontext';
import { line3partdatacontext } from '../contexts/linepartdatacontext';
import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Toolbar from '../Components/Linepagetoolbar';
import '../Css/linepages.css'

function Line4() {
  const { partruntable, setpartruntable } = useContext(partruncontext);
  const { linedatatable, setlinedatatable } = useContext(linedatacontext);
  const { line3items, setline3items } = useContext(line3partdatacontext);
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

  const handleproductionSelect = (selectedAction) => {
    const selectedEndpointIdentifier = apiEndpoints[selectedAction];
    if (selectedEndpointIdentifier) {
      // Map the endpoint identifier to the full URL
      const selectedEndpoint = `http://10.144.18.208:1433/${selectedEndpointIdentifier}1`;

      // Construct requestData based on the selected action
      let requestData;
      if (selectedAction === 'action1') {
        requestData = { value: 'no_orders' };
      } else if (selectedAction === 'action2') {
        requestData = { value: {} };
      }
      else if (selectedAction === 'action3') {
        requestData = { value: "changeover" };
      }

      // Make the API call based on selected action and row
      Axios.post(selectedEndpoint, requestData)
        .then((response) => {
          console.log('API call success:', response.data);
        })
        .catch((error) => {
          console.error('API call error:', error);
        });
    }
  };

  const getpartnumbers = async () => {
    try {
      const response = await fetch('http://10.144.18.208:1434/api/getline4part', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });

      const data = await response.json();
      if (data) {
        setline3items(data.result.recordset)
      } else {
        console.log("error")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handlereasonSelect = (selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://10.144.18.208:1433/updateprocessstatereasonline4`;

    // Construct requestData based on the selected action
    let requestData;
    if (selectedAction === 'action1') {
      requestData = {
        "enabled": true,
        "reason": "adjustment"
      };
    } else if (selectedAction === 'action2') {
      requestData = {
        "enabled": true,
        "reason": "autonomous_maintenance"
      };
    }
    else if (selectedAction === 'action3') {
      requestData = {
        "enabled": true,
        "reason": "breakdown"
      };
    }
    else if (selectedAction === 'action4') {
      requestData = {
        "enabled": true,
        "reason": "jam"
      };
    }
    else if (selectedAction === 'action5') {
      requestData = {
        "enabled": true,
        "reason": "no_material"
      };
    }
    else if (selectedAction === 'action6') {
      requestData = {
        "enabled": true,
        "reason": "no_operator"
      };
    }

    // Make the API call based on selected action and row
    Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        console.error('API call error:', error);
      });
  };

  const handlepartidSelect = (selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://10.144.18.208:1433/updatepartidline4`;

    // Replace hyphens with "j" globally
    selectedAction = selectedAction.replace(/-/g, 'j');

    // Construct requestData based on the selected action
    let requestData;
    requestData = {
      part_id: selectedAction
    }
    console.log(requestData)

    // Make the API call based on selected action and row
    Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        console.error('API call error:', error);
      });
  };


  const getpartrun = () => {
    Axios.get('http://10.144.18.208:1433/getline4partrun')
      .then((response) => {
        setpartruntable(response.data);
        getprocessstate(response.data)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const getline3data = () => {
    Axios.get('http://10.144.18.208:1433/getline4data')
      .then((response) => {
        setlinedatatable(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handlegoodcount = () => {
    let requestData = {
      count: parseInt(goodcount)
    }
    Axios.post('http://10.144.18.208:1433/updategoodcountline4', requestData)
      .then((response) => {
        setgoodcount(1)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  const handlerejectcount = () => {
    let requestData = {
      count: parseInt(rejectcount)
    }
    Axios.post('http://10.144.18.208:1433/updaterejectcountline4', requestData)
      .then((response) => {
        setrejectcount(1)
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
  };



  const getColorForOEE = (oee) => {
    if (oee < 39.9) return 'darkred';
    else if (oee >= 40 && oee <= 64.9) return 'lightcoral';
    else if (oee >= 65 && oee <= 84.9) return 'yellow';
    else return 'green';
  };


  const getpartname = () => {
    for (let i = 0; i < line3items.length; i++) {
      if (line3items[i].Part_ID === partruntable[0].part_id) {
        return line3items[i].Alternate_Part_ID;
      }
    }
    return "No Part Name"
  }

  useEffect(() => {
    const fetchData = () => {
      getpartrun();
      getline3data();
    };
    getpartnumbers();
  
    // Fetch data when the page opens
    fetchData();
  
    // Fetch data every 10 seconds
    const interval = setInterval(fetchData, 10000);
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="linepage">
      <Toolbar line="Line 4" />
      <br />
      <div className='flexbox-container'>
        <div className='flexbox-item'>
          <p className='textinboxes'>Part ID and Name </p>
          {partruntable[0].part_id}
          <p>{getpartname()}</p>
        </div>
        <div className='flexbox-item'>
          <p className='textinboxes'>Change Production State</p>
          <ReactBootStrap.Form.Control
            className='linepagebutton'
            as="select"
            value={getInitialAction(partruntable[0].process_state)}
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
          {partruntable[0].process_state_reason}
        </div>
        <div className='flexbox-item'>
          <p className='textinboxes'>Change Part</p>
          <ReactBootStrap.Form.Control
            className='linepagebutton'
            as="select"
            value={partruntable[0].part_id}
            onChange={(e) => handlepartidSelect(e.target.value)}
          >
            {line3items.map((item) => (
              <option key={item.Part_ID} value={item.Part_ID}>
                {item.Part_ID}
              </option>
            ))}

            {/* Add more options here */}
          </ReactBootStrap.Form.Control>
        </div>
        <div className='flexbox-item'>
          <p className='textinboxes'>Increment Count & Reject</p>
          <p><button className='linepagebutton2' onClick={handlegoodcount}>+ Good</button>
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
          <p><button className='linepagebutton2' onClick={handlerejectcount}>+ Reject</button>
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
            value={getInitialActionreason(partruntable[0].process_state_reason_down)}
            onChange={(e) => handlereasonSelect(e.target.value)}
            disabled={partruntable[0].process_state_reason === "Running Normally" || partruntable[0].process_state_reason === "No Orders" || partruntable[0].process_state_reason === "Lunch"}
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
    </div>
  );
}

export default Line4;