import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import "react-pdf/dist/esm/Page/AnnotationLayer.css";


function PDFViewer() {
  useEffect(() => { pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;});
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPageNumber(1)
  };

  return (
    <div>
      <Document file="/PDF/112-40019-2.pdf" onLoadSuccess={onDocumentLoadSuccess} >
        <Page scale={1.5} pageNumber={pageNumber}  renderTextLayer={false} />
      </Document>
    </div>
  );
};


export default PDFViewer;
