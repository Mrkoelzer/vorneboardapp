import React, { useState, useEffect, useContext } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

function PDFViewer({ partnumber, linename }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // State to store the PDF URL
  const { localipaddr } = useContext(ipaddrcontext);
  const [pdfs, setpdfs] = useState([]);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  useEffect(() => {
    // Fetch the PDF files list when the component mounts
    fetchpdfs();
  }, []);

  useEffect(() => {
    // Find the matching PDF
    let requestBody = {};
    for (let i = 0; i < pdfs.length; i++) {
      if (pdfs[i].linename === linename && pdfs[i].part_id === partnumber) {
        requestBody = {
          filename: pdfs[i].pdfname + '.pdf', // Adjust the filename as needed
        };
        break; // Exit the loop once a match is found
      }
    }

    // Fetch the PDF file URL from the server and set it in the state
    if (Object.keys(requestBody).length !== 0) {
      fetch(`http://${localipaddr}:1433/api/pdfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then(async (response) => {
          if (response.ok) {
            try {
              const blob = await response.blob();
              const pdfUrl = URL.createObjectURL(blob);
              setPdfUrl(pdfUrl);
            } catch (error) {
              console.error('Error reading response body:', error);
              setPdfError(true); // Handle errors
            }
          } else {
            console.log('Error Status:', response.status);
            setPdfError(true); // Handle errors
          }
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          setPdfError(true); // Handle errors
        });
    }
  }, [partnumber, pdfs, linename, localipaddr]);

  const fetchpdfs = async () => {
    try {
      // Send a POST request to the backend with the query in the request body
      const response = await fetch(`http://${localipaddr}:1435/api/getalllinepartnumbers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setpdfs(data.result.recordset);
      } else {
        console.error('Failed to retrieve data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    setPdfError(true);
  };

  return (
    <div>
      {pdfError ? (
        <div>Error loading PDF</div>
      ) : (
        <Document file={pdfUrl} onLoadError={onDocumentLoadError} onLoadSuccess={onDocumentLoadSuccess}>
          <Page scale={1.5} pageNumber={pageNumber} renderTextLayer={false} />
        </Document>
      )}
    </div>
  );
}

export default PDFViewer;
