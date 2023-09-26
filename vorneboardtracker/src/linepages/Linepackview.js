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

function Line3packview() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupOpen2, setIsPopupOpen2] = useState(false);
  const { selectedline, setselectedline } = useContext(selectedlinecontext);
  const [processstate, setprocessstate]= useState('No Orders')
  const { lines } = useContext(linescontext);
  //const [partnumber, setpartnumber] = useContext(partnumbercontext)
  const [partinfo, setpartinfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
            <button className='pdfbuttonsstartprod'>Start Product</button>
            <button className='pdfbuttonsnoorders'>No Orders</button>
            <button className='pdfbuttonsbreak'>Break</button>
            <button className='pdfbuttonsdown' onClick={togglePopup}>
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
              {/* Rest of your component code */}
            </div>
          )}
          {isPopupOpen2 && (
            <div className='popup-form'>
              {/* Rest of your component code */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default Line3packview;
