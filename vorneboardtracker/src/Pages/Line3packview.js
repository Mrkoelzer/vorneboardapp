import React, { useState } from 'react';
import '../Css/App.css';
import '../Css/toolbar.css';
import '../Css/editline.css';
import '../Css/PDF.css'
import PDFViewer from '../Components/PDFViewer';
import { useNavigate } from 'react-router-dom';
import Pin from '../Components/Pin';

function Line3packview() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isPopupOpen2, setIsPopupOpen2] = useState(false);
    const navigate = useNavigate();

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };
    const togglePopup2 = () => {
        setIsPopupOpen2(!isPopupOpen2);
    };
    return (
        <div className='pdf-container'>
            <br />
            <div className='page'>
                <PDFViewer />
            </div>
            <br />
            <div className='buttonlayout'>
                <button className='pdfbuttonsstartprod'>Start Product</button>
                <button className='pdfbuttonsnoorders'>No Orders</button>
                <button className='pdfbuttonsbreak'>Break</button>
                <button className='pdfbuttonsdown' onClick={togglePopup}>Down Reasons</button>
            </div>
            <div className='pdftextnotif'>
                Process State Future Addition
                <button className='pdfbuttonsetup' onClick={togglePopup2}>Setup</button>
            </div>
            {isPopupOpen && (
                <div className='popup'>
                    <div className='popup-content'>
                        <button className='popup-close' onClick={togglePopup}>X</button>
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
                        <button className='popup-close2' onClick={togglePopup2}>X</button>
                        <Pin/>
                    </div>
                </div>
            )}
        </div>
    );
}


export default Line3packview;
