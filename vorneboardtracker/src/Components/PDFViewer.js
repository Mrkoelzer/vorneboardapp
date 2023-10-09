import React, { useState, useEffect, useContext } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

function PDFViewer({ partnumber }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null); // State to store the PDF URL
  const { localipaddr } = useContext(ipaddrcontext);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  
    // Construct the request body
    const requestBody = {
      filename: partnumber + '.pdf', // Adjust the filename as needed
    };
  
    // Fetch the PDF file URL from the server and set it in the state
    fetch(`http://${localipaddr}:1433/api/pdfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    .then(async response => {
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
    .catch(error => {
      console.error('Fetch error:', error);
      setPdfError(true); // Handle errors
    });
  }, [partnumber]);

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