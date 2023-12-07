import React, { useState, useEffect, useContext, useRef, forwardRef, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ipaddrcontext } from '../contexts/ipaddrcontext';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useReactToPrint } from 'react-to-print';

const PDFViewer = forwardRef(({ partnumber, linename }, ref) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const { localipaddr } = useContext(ipaddrcontext);
  const [pdfs, setpdfs] = useState([]);
  const componentRef = useRef();

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  }, []);

  useEffect(() => {
    fetchpdfs();
  }, []);

  useEffect(() => {
    let requestBody = {};
    for (let i = 0; i < pdfs.length; i++) {
      if (pdfs[i].linename === linename && pdfs[i].part_id === partnumber) {
        requestBody = {
          filename: pdfs[i].pdfname + '.pdf',
        };
        break;
      }
    }

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
              setPdfError(true);
            }
          } else {
            console.log('Error Status:', response.status);
            setPdfError(true);
          }
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          setPdfError(true);
        });
    }
  }, [partnumber, pdfs, linename, localipaddr]);

  const fetchpdfs = async () => {
    try {
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
    console.log(componentRef.current)
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    setPdfError(true);
  };

  // Use the useReactToPrint hook
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  
  useImperativeHandle(ref, () => ({
    handlePrint, // Make handlePrint accessible from the parent component
  }));

  return (
    <div ref={componentRef}>
      {pdfError ? (
        <div>Error loading PDF</div>
      ) : (
        <Document file={pdfUrl} onLoadError={onDocumentLoadError} onLoadSuccess={onDocumentLoadSuccess}>
          <Page scale={1.7} pageNumber={pageNumber} renderTextLayer={false} />
        </Document>
      )}
    </div>
  );
});

export default PDFViewer;
