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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { faBone, faDownLong, faGear, faHillRockslide, faMugSaucer, faPlay, faRoadBarrier, faScrewdriver, faScrewdriverWrench, faSliders, faStop, faUserSlash, faUsersSlash, faXmark } from '@fortawesome/free-solid-svg-icons';

function Line3packview() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const { selectedline, setselectedline } = useContext(selectedlinecontext);
  const [processstate, setprocessstate] = useState('No Orders')
  const { lines } = useContext(linescontext);
  const [ip, setip] = useState('');
  //const [partnumber, setpartnumber] = useContext(partnumbercontext)
  const [partinfo, setpartinfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { localipaddr } = useContext(ipaddrcontext);
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
          NotificationManager.success('Updating Production State!')
          console.log('API call success:', response.data);
        })
        .catch((error) => {
          NotificationManager.error('Updating Production State Failed!')
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
        NotificationManager.success('Updating to Break!')
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        NotificationManager.error('Updating to Break Failed!')
        console.error('API call error:', error);
      });
  };

  const handlereasonSelect = async (selectedAction) => {
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
        NotificationManager.success(`Updating Down State!`)
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        NotificationManager.error('Updating Down State Failed!')
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
      sessionStorage.setItem(key, data); // Store as a string without quotes
    } else {
      sessionStorage.setItem(key, JSON.stringify(data)); // Store other data as JSON strings
    }
  };

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedPartInfo = sessionStorage.getItem('partInfo');
    if (savedPartInfo) {
      const parsedPartInfo = JSON.parse(savedPartInfo);
      setpartinfo(parsedPartInfo);
    }

    const savedProcessState = sessionStorage.getItem('processState');
    if (savedProcessState) {
      setprocessstate(savedProcessState);
    }

    const savedSelectedLine = sessionStorage.getItem('selectedline');
    if (savedSelectedLine && !selectedline) {
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
    if (partinfo.length !== 0) {
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
      <NotificationContainer/>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className='page'>
            {partinfo[0] && partinfo[0].partrunData ? (
              <PDFViewer partnumber={partinfo[0].partrunData.part_id.replace(/j/g, '-')} linename={partinfo[0].linename} />
            ) : (
              <p>No part data available.</p>
            )}
          </div>
          <br />
          <div className='buttonlayout'>
            <button className="pdfbuttonsstartprod" onClick={() => handleproductionSelect('action2')}>
              <div className="pdficon-wrapper">
                <FontAwesomeIcon icon={faPlay} className="pdficon" />
              </div>
              <div className="pdftext">Start Product</div>
            </button>
            <button className="pdfbuttonsnoorders" onClick={() => handleproductionSelect('action1')}>
              <div className="pdficon-wrapper">
                <FontAwesomeIcon icon={faStop} className="pdficon" />
              </div>
              <div className="pdftext">No Orders</div>
            </button>
            <button className="pdfbuttonsbreak" onClick={() => handleBreakSelect()}>
              <div className="pdficon-wrapper">
                <FontAwesomeIcon icon={faMugSaucer} className="pdficon" />
              </div>
              <div className="pdftext">Break</div>
            </button>
            <button className="pdfbuttonsdown" onClick={togglePopup}
            disabled={processstate === "Running Normally" || processstate === "No Orders" || processstate === "Lunch" || processstate === "Break"}
            >
              <div className="pdficon-wrapper">
                <FontAwesomeIcon icon={faDownLong} className="pdficon" />
              </div>
              <div className="pdftext">Down Reasons</div>
            </button>
          </div>
          <div className='pdftextnotif'>
            {partinfo[0] && partinfo[0].partrunData ? (
              <>
                {partinfo[0].partrunData.part_id.replace(/j/g, '-')} | {processstate}
                <button className="pdfbuttons" onClick={togglePopup2}>
              <div className="pdf2icon-wrapper">
                <FontAwesomeIcon icon={faGear} className="pdf2icon" />
              </div>
              <div className="pdf2text">Setup</div>
            </button>
              </>
            ) : (
              <p>No part data available.</p>
            )}
          </div>
          {isPopupOpen && (
            <div className='popup'>
              <div className='popup-content'>
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <button className="popup-button"  onClick={togglePopup}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faXmark} className="pdficon" />
                  </div>
                  <div className="pdftext">Close</div>
                </button>


                </div>
                <div style={{width: '100%', display: 'flex', justifyContent: 'space-evenly'}}>
                <button className="popup-button" onClick={() => handlereasonSelect('action1')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faSliders} className="pdficon" />
                  </div>
                  <div className="pdftext">Adjustment</div>
                </button>
                <button className="popup-button" onClick={() => handlereasonSelect('action2')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faScrewdriverWrench} className="pdficon" />
                  </div>
                  <div className="pdftext">Maintenance</div>
                </button>
                <button className="popup-button" onClick={() => handlereasonSelect('action3')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faHillRockslide} className="pdficon" />
                  </div>
                  <div className="pdftext">Breakdown</div>
                </button>
                </div>


                <button className="popup-button" onClick={() => handlereasonSelect('action4')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faRoadBarrier} className="pdficon" />
                  </div>
                  <div className="pdftext">Jam</div>
                </button>
                <button className="popup-button" onClick={() => handlereasonSelect('action5')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faBone} className="pdficon" />
                  </div>
                  <div className="pdftext">No Material</div>
                </button>
                <button className="popup-button" onClick={() => handlereasonSelect('action6')}>
                  <div className="pdficon-wrapper">
                    <FontAwesomeIcon icon={faUsersSlash} className="pdficon" />
                  </div>
                  <div className="pdftext">No Operator</div>
                </button>
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
