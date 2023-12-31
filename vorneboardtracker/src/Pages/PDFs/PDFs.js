import React, { useContext, useEffect, useState } from 'react';
import * as ReactBootStrap from 'react-bootstrap';
import './PDFs.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../../contexts/usercontext';
import { linescontext } from '../../contexts/linescontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { faGear, faTrashCan, faXmark, faArrowLeft, faCheck, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { Toolbarcontext } from '../../Components/Navbar/Toolbarcontext';
import DeleteConfirmation from '../../Components/DeleteConfirmation/DeleteConfirmation';

function PDFs() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    const [pdfs, setpdfs] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const { localipaddr } = useContext(ipaddrcontext);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); // State for showing/hiding the add modal
    const [addLineMessage, setAddLineMessage] = useState('');
    const [pdfname, setpdfname] = useState('');
    const { settoolbarinfo } = useContext(Toolbarcontext)

    useEffect(() => {
        settoolbarinfo([{ Title: 'Vorne Edit PDFs' }])
        const userDataFromLocalStorage = sessionStorage.getItem('userdata');
        let parsedUserData;
        if (userDataFromLocalStorage) {
            parsedUserData = JSON.parse(userDataFromLocalStorage);
            setuserdata(parsedUserData);
        }
        if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
            if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
                navigate('/Changepasswordpin');
            }
        } else {
            navigate('/');
        }
    }, [setuserdata, navigate]);

    const fetchpdfs = async () => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getpdfs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (data) {
                setpdfs(data.result.recordset);
            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (userdata.loggedin !== 1) {
            navigate('/');
        }
        fetchpdfs();
    }, []);

    const handledeleteClick = (pdfname) =>{
        setpdfname(pdfname)
        setShowDeleteConfirmation(true)
    }

    const handleDelete = () => {
        deletePdf(pdfname)
        setShowDeleteConfirmation(false);
      };

      const handleClosed = () => {
        setShowDeleteConfirmation(false);
      };

    const handleAddClick = () => {
        setShowAddModal(true);
        setAddLineMessage('');
    };

    const closeAddModal = () => {
        setShowAddModal(false);
    };

    const filteredPartNumbers = pdfs.filter((rowData) => {
        const searchText = searchValue.toLowerCase();
        return (
            (rowData.pdfname && rowData.pdfname.toLowerCase().includes(searchText))
            //(rowData.Ideal_Cycle_Time_s && typeof rowData.Ideal_Cycle_Time_s === 'string' && rowData.Ideal_Cycle_Time_s.toLowerCase().includes(searchText))
            // Add more fields as needed for searching
            // Example: ||
            // (rowData.OtherField && rowData.OtherField.toLowerCase().includes(searchText))
        );
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const handlesqlfileupload = async () => {
        try {
            if (!selectedFile) {
                setAddLineMessage('Please select a PDF file to upload.');
                return;
            }

            const fileNameWithoutExtension = selectedFile.name.replace('.pdf', '');
            const requestData = { pdfname: fileNameWithoutExtension };
            for (let i = 0; i < pdfs.length; i++) {
                if (pdfs[i].pdfname === requestData.pdfname) {
                    setAddLineMessage(requestData.pdfname + ' | File Name Already Exist')
                    return
                }
            }
            const response = await fetch(`http://${localipaddr}:1435/api/insertpdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            const data = await response.json();
            if (data.pdfadded) {
                handleFileUpload()
            }
            else {
                setAddLineMessage('An Error Occured')
            }
            // Handle the response as needed
            // Close the add modal
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFileUpload = () => {

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('pdfFile', selectedFile);

        // Send the file to the server using AJAX (you can use Axios, Fetch, or other libraries)
        fetch(`http://${localipaddr}:1433/api/upload-pdf`, {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    NotificationManager.success(`Pdf Added!`)
                    fetchpdfs();
                    closeAddModal();
                    setAddLineMessage('PDF file uploaded successfully.');
                    // Optionally, you can perform additional actions here
                } else {
                    NotificationManager.error(`Pdf Add failed`)
                    setAddLineMessage('Failed to upload PDF file.');
                }
            })
            .catch((error) => {
                NotificationManager.error(`Pdf Add failed`)
                console.error('Error uploading PDF file:', error);
                setAddLineMessage('An error occurred while uploading the PDF file.');
            });
    };

    const deletePdf = async (pdfNameToDelete) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/delete-pdf/${pdfNameToDelete}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.deleted) {
                fetchpdfs()
                NotificationManager.success(`${pdfNameToDelete} Deleted!`)
                // File and SQL entry deleted successfully
                // You may want to update your PDF list here
            } else {
                NotificationManager.error('Delete Failed!')
                console.error('Failed to delete PDF:', pdfNameToDelete);
            }
        } catch (error) {
            NotificationManager.error('Delete Failed!')
            console.error('Error deleting PDF:', error);
        }
    };

    return (
        <div className="pdfs">
            <view>
                <div className="pdfstable-container">
                    <NotificationContainer />
                    <br />
                    <div style={{ display: 'flex', alignSelf: 'center' }}>
                        <button className="pdfsbutton" onClick={handleAddClick}>
                            <div className="pdfsicon-wrapper">
                                <FontAwesomeIcon icon={faFilePdf} className="pdfsicon" />
                            </div>
                            <div className="pdfstext">Add PDF</div>
                        </button>
                        <button className="pdfsbutton" onClick={() => navigate('/Updater')}>
                            <div className="pdfsicon-wrapper">
                                <FontAwesomeIcon icon={faArrowLeft} className="pdfsicon" />
                            </div>
                            <div className="pdfstext">Go Back</div>
                        </button>
                    </div>
                    <input
                        className='pdfs-search'
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <br />
                    <ReactBootStrap.Table striped bordered hover>
                        <thead>
                            <tr className="header-row">
                                <th>PDF's</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPartNumbers.map((rowData, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                                    <td>{rowData.pdfname}</td>
                                    <td><p className='pdfseditdeletebutton' onClick={() => handledeleteClick(rowData.pdfname)}><FontAwesomeIcon icon={faTrashCan} /></p></td>
                                </tr>
                            ))}
                        </tbody>
                    </ReactBootStrap.Table>
                </div>
            </view>
            {showAddModal && (
                <div className="pdfsedit-modal">
                    <div className="pdfsedit-popup">
                        <button className="pdfsmodal-close-button" onClick={closeAddModal}>
                            X
                        </button>
                        <h2>Add PDF File</h2>
                        <input type="file" accept=".pdf" className='pdfsaddfile' onChange={handleFileChange} />
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <button className="pdfsbutton" onClick={handlesqlfileupload}>
                                <div className="pdfsicon-wrapper">
                                    <FontAwesomeIcon icon={faCheck} className="pdfsicon" />
                                </div>
                                <div className="pdfstext">Save</div>
                            </button>
                            <button className="pdfsbutton" onClick={closeAddModal}>
                                <div className="pdfsicon-wrapper">
                                    <FontAwesomeIcon icon={faXmark} className="pdfsicon" />
                                </div>
                                <div className="pdfstext">Cancel</div>
                            </button>
                        </div>
                        {/* Display the message */}
                        {addLineMessage && <p className="error-message">{addLineMessage}</p>}
                    </div>
                </div>
            )}
            <DeleteConfirmation
                show={showDeleteConfirmation}
                handleDelete={handleDelete}
                handleClose={handleClosed}
                message={`Are you sure you want to delete PDF: ${pdfname}?`}
            />
        </div>
    );
}

export default PDFs;
