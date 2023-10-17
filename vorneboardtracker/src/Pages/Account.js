import React, { useContext, useEffect} from 'react';
import '../Css/account.css'
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Accounttoobar from '../Components/Accounttoobar';

function Account() {
    const navigate = useNavigate();
    const { userdata, setuserdata } = useContext(usercontext);
    
    useEffect(() => {
        const userDataFromLocalStorage = localStorage.getItem('userdata');
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
    return (
        <div className="accountpage">
                <Accounttoobar/>
                <button className='accountbutton' onClick={() => navigate('/Users')}>
                    Users
                </button>
                <button className='accountbutton' onClick={() => navigate('/Changepasswordpin')}>
                    Change Password/Pin
                </button>
                <button className='accountbutton' onClick={() => navigate('/Editlineextruder')}>
                    Edit Lines/Extruders
                </button>
                <button className='accountbutton' onClick={() => navigate('/Addeditpartnumbers')}>
                    Add/Edit Part Numbers
                </button>
                <button className='accountbutton' onClick={() => navigate('/Pdfs')}>
                    Add/Delete PDFs
                </button>
                <button className='accountbutton' onClick={() => navigate('/Partpdfs')}>
                    Edit Linked PDFs
                </button>
                <button className='accountbutton' onClick={() => navigate('/')}>
                    Go Back
                </button>
        </div>
    );
}

export default Account;