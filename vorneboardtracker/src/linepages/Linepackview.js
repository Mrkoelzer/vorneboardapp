import React, { useContext, useState, useEffect } from 'react';
import '../Css/App.css';
import '../Css/toolbar.css';
import '../Css/PDF.css'
import PDFViewer from '../Components/PDFViewer';
import { useNavigate } from 'react-router-dom';
import Pin from '../Components/Pin';
import Axios from 'axios';
import { selectedlinecontext } from '../contexts/selectedlinecontext';
import { partnumbercontext } from '../contexts/partnumbercontext';
import { linescontext } from '../contexts/linescontext';
import { ipaddrcontext } from '../contexts/ipaddrcontext';

function Line3packview() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const { selectedline, setselectedline } = useContext(selectedlinecontext);
  const [processstate, setprocessstate]= useState('No Orders')
  const { lines } = useContext(linescontext);
  const [ip, setip] = useState('');
  //const [partnumber, setpartnumber] = useContext(partnumbercontext)
  const [partinfo, setpartinfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {localipaddr} = useContext(ipaddrcontext);
  const navigate = useNavigate();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };
  const togglePopup2 = () => {
    setIsPopupOpen2(!isPopupOpen2);
  };
  const fetchAllLineData = async () => {
    const lineDataPromises = lines.map(async (line) => {
      const linename = line.Linename;
      const lineip = line.ipaddress;
      const partrunData = await getpartrun(lineip);

      // Combine all the data into a single object
      const lineDataObject = {
        lineip,
        linename,
        partrunData,
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
    return filteredLineData;
  };
  const apiEndpoints = {
    action1: 'updatelinenoorders',
    action2: 'updatelinestartproduction',
    action3: 'updatelinechangeover'
    // Add more mappings as needed
  };
  const handleproductionSelect = async (selectedAction) => {
    const selectedEndpointIdentifier = apiEndpoints[selectedAction];
    let ipaddress = ip
    console.log(selectedEndpointIdentifier)
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
  
  const handleBreakSelect = async () => {
    let ipaddress = ip
      // Map the endpoint identifier to the full URL
      const selectedEndpoint = `http://${localipaddr}:1433/updatebreak`;
  
      // Construct requestData based on the selected action
      let requestData = {
        enabled: true,
        reason: "break"
      } // Do not include ipaddress here
  
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
  };

  const handlereasonSelect = async(selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://${localipaddr}:1433/updateprocessstatereason`;
    let ipaddress = ip;
    // Construct requestData based on the selected action
    let requestData;
    if (selectedAction === 'action1') {
      requestData = {
        "enabled": true,
        "reason": "adjustment",
        ipaddress: ipaddress
      };
    } else if (selectedAction === 'action2') {
      requestData = {
        "enabled": true,
        "reason": "autonomous_maintenance",
        ipaddress: ipaddress
      };
    }
    else if (selectedAction === 'action3') {
      requestData = {
        "enabled": true,
        "reason": "breakdown",
        ipaddress: ipaddress
      };
    }
    else if (selectedAction === 'action4') {
      requestData = {
        "enabled": true,
        "reason": "jam",
        ipaddress: ipaddress
      };
    }
    else if (selectedAction === 'action5') {
      requestData = {
        "enabled": true,
        "reason": "no_material",
        ipaddress: ipaddress
      };
    }
    else if (selectedAction === 'action6') {
      requestData = {
        "enabled": true,
        "reason": "no_operator",
        ipaddress: ipaddress
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

  const saveDataToLocalStorage = (key, data) => {
    if (key === 'selectedline') {
      localStorage.setItem(key, data); // Store as a string without quotes
    } else {
      localStorage.setItem(key, JSON.stringify(data)); // Store other data as JSON strings
    }
  };

   // Load data from local storage when the component mounts
   useEffect(() => {
    const savedPartInfo = localStorage.getItem('partInfo');
    if (savedPartInfo) {
      const parsedPartInfo = JSON.parse(savedPartInfo);
      setpartinfo(parsedPartInfo);
    }
  
    const savedProcessState = localStorage.getItem('processState');
    if (savedProcessState) {
      setprocessstate(savedProcessState);
    }
  
    const savedSelectedLine = localStorage.getItem('selectedline');
    if (savedSelectedLine) {
      setselectedline(savedSelectedLine);
    }
  
    setIsLoading(false);
  }, []);

  // Fetch data and update state
  useEffect(() => {
    const fetchDataAndSetState = async () => {
      let ipaddress = '';

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].Linename === selectedline) {
          ipaddress = lines[i].ipaddress;
          setip(ipaddress)
        }
      }
      const lineData = await getshiftdata(ipaddress);
      if (lineData !== null) {
        // Call the getprocessstate function here
        setprocessstate(lineData.events[0][0]);
        saveDataToLocalStorage('processState', lineData.events[0][0]);
      }
    };

    const fetchDataAndSetPartInfo = async () => {
      const lineData = await fetchAllLineData();
      if (lineData.every((data) => data !== null) && lineData.length !== 0) {
        // Call the getprocessstate function here
        setpartinfo(lineData);
        saveDataToLocalStorage('partInfo', lineData);
        saveDataToLocalStorage('selectedline', selectedline)
        setIsLoading(false); // Data has been loaded, set isLoading to false
      }
    };

    fetchDataAndSetState();
    fetchDataAndSetPartInfo();

    // Fetch data every 10 seconds for both functions
    const interval = setInterval(() => {
      fetchDataAndSetState();
      fetchDataAndSetPartInfo();
    }, 10000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [selectedline, lines]);

  const [currentPartId, setCurrentPartId] = useState('');

  // Watch for changes in partinfo[0].partrunData.part_id
  useEffect(() => {
    console.log(partinfo)
    if(partinfo.length !== 0){
      if (partinfo[0].partrunData.part_id !== currentPartId) {
        // Update the currentPartId state
        setCurrentPartId(partinfo[0].partrunData.part_id);
  
        // Reload the page
        //window.location.reload();
      }
    }
  }, [partinfo]);

  return (
    <div className='pdf-container'>
      <br />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className='page'>
            {partinfo[0] && partinfo[0].partrunData ? (
              <PDFViewer partnumber={partinfo[0].partrunData.part_id.replace(/j/g, '-')} />
            ) : (
              <p>No part data available.</p>
            )}
          </div>
          <br />
          <div className='buttonlayout'>
            <button className='pdfbuttonsstartprod' onClick={() => handleproductionSelect('action2')}>Start Product</button>
            <button className='pdfbuttonsnoorders' onClick={() => handleproductionSelect('action1')}>No Orders</button>
            <button className='pdfbuttonsbreak' onClick={() => handleBreakSelect()}>Break</button>
            <button className='pdfbuttonsdown' onClick={togglePopup}
            disabled={processstate === "Running Normally" || processstate === "No Orders" || processstate === "Lunch" || processstate === "Break"}
            >
              Down Reasons
            </button>
          </div>
          <div className='pdftextnotif'>
            {partinfo[0] && partinfo[0].partrunData ? (
              <>
                {partinfo[0].partrunData.part_id.replace(/j/g, '-')} | {processstate}
                <button className='pdfbuttonsetup' onClick={togglePopup2}>
                  Setup
                </button>
              </>
            ) : (
              <p>No part data available.</p>
            )}
          </div>
          {isPopupOpen && (
                <div className='popup'>
                  <div className='popup-content'>
                    <button className='popup-close' onClick={togglePopup}>
                      X
                    </button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action1')}>Adjustment</button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action2')}>Maintenance</button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action3')}>Breakdown</button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action4')}>Jam</button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action5')}>No Material</button>
                    <button className='popup-button' onClick={() => handlereasonSelect('action6')}>No Operator</button>
                  </div>
                </div>
              )}
          {isPopupOpen2 && (
                <div className='popup-form'>
                  <div className='popup-form-content'>
                    <button className='popup-close2' onClick={togglePopup2}>
                      X
                    </button>
                    <Pin />
                  </div>
                </div>
              )}
        </div>
      )}
    </div>
  );
}


export default Line3packview;
