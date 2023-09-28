import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

function CheckPDFExists({ partId }) {
  const [pdfExists, setPdfExists] = useState(null);

  useEffect(() => {
    // Construct the URL where the PDF file is expected to be
    const pdfUrl = `/PDF/${partId}.pdf`; // Modify this URL as needed

    // Send a HEAD request to check if the PDF file exists
    fetch(pdfUrl, { method: 'HEAD' })
      .then((response) => {
        console.log(response.status)
        if (response.status >= 200 && response.status < 300) {
          setPdfExists(true); // File exists if status code is in the 2xx range
        } else {
          setPdfExists(false); // File does not exist
          console.log("false")
        }
      })
      .catch((error) => {
        console.error('Error checking PDF:', error);
        setPdfExists(false); // Handle errors by assuming the file does not exist
      });
  }, [partId]);

  return pdfExists === true ? (
    <FontAwesomeIcon icon={faCheck} /> // Display checkmark if PDF exists
  ) : pdfExists === false ? (
    <FontAwesomeIcon icon={faTimes} /> // Display X if PDF does not exist
  ) : (
    'Checking...' // Display a loading message while checking
  );
}
export default CheckPDFExists;