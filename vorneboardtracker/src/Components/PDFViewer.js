import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

function PDFViewer({ partnumber }) {
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
  });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPageNumber(1);
  };

  const onDocumentLoadError = () => {
    // Handle the error and set the pdfError state to true
    setPdfError(true);
  };

  return (
    <div>
      {pdfError ? (
        <Document file="/PDF/nofile.pdf" onLoadSuccess={onDocumentLoadSuccess}>
          <Page scale={1.5} pageNumber={pageNumber} renderTextLayer={false} />
        </Document>
      ) : (
        <Document file={`/PDF/${partnumber}.pdf`} onLoadError={onDocumentLoadError} onLoadSuccess={onDocumentLoadSuccess}>
          <Page scale={1.5} pageNumber={pageNumber} renderTextLayer={false} />
          {/* Adjust the height prop to control the visible portion */}
        </Document>
      )}
    </div>
  );
}

export default PDFViewer;