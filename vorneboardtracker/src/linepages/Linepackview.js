import React, { useContext, useState, useEffect } from 'react';
import '../Css/App.css';
import '../Css/toolbar.css';
import '../Css/editline.css';
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
    const { selectedline } = useContext(selectedlinecontext);
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
      useEffect(() => {
        const fetchDataAndSetState = async () => {
          const lineData = await fetchAllLineData();
          if (lineData.every((data) => data !== null)) {
            // Call the getprocessstate function here
            setpartinfo(lineData);
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
        <div className='pdf-container'>
          <br />
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <div className='page'>
                <PDFViewer partnumber={partinfo[0].partrunData.part_id.replace('j', '-')} />
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
                Process State Future Addition
                <button className='pdfbuttonsetup' onClick={togglePopup2}>
                  Setup
                </button>
              </div>
              {isPopupOpen && (
                <div className='popup'>
                  <div className='popup-content'>
                    <button className='popup-close' onClick={togglePopup}>
                      X
                    </button>
                    <button className='popup-button'>Maintenance</button>
                    <button className='popup-button'>Adjustment</button>
                    <button className='popup-button'>Breakdown</button>
                    <button className='popup-button'>Jam</button>
                    <button className='popup-button'>No Material</button>
                    <button className='popup-button'>No Operator</button>
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
