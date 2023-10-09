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
        if(userdata.loggedin === 1 || parsedUserData.loggedin === 1){
            if(userdata.passwordchange === 1 || userdata.pinchange === 1){
                navigate('/Changepasswordpin')
            }
        }
        else{
            navigate('/')
        }
      }, [userdata]);
    return (
        <div className="accountpage">
            <view>
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
                    Add/Edit PDFs
                </button>
                <button className='accountbutton' onClick={() => navigate('/Partpdfs')}>
                    Edit Linked PDFs
                </button>
                <button className='accountbutton' onClick={() => navigate('/')}>
                    Go Back
                </button>
            </view>
        </div>
    );
}

export default Account;