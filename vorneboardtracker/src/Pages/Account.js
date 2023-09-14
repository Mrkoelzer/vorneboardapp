import React, { useContext, useEffect} from 'react';
import '../Css/account.css'
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import Accounttoobar from '../Components/Accounttoobar';

function Account() {
    const navigate = useNavigate();
    const { userdata } = useContext(usercontext);
    useEffect(() => {
        if(userdata.loggedin === 1){
            
        }
        else{
            navigate('/')
        }
      }, []);
    return (
        <div className="accountpage">
            <view>
                <Accounttoobar/>
                <button className='accountbutton' onClick={() => navigate('/Createaccount')}>
                    Create a User
                </button>
                <button className='accountbutton' onClick={() => navigate('/Editlineextruder')}>
                    Edit Lines/Extruders
                </button>
                <button className='accountbutton' onClick={() => navigate('/Editlineextruder')}>
                    Add Part Numbers
                </button>
                <button className='accountbutton' onClick={() => navigate('/')}>
                    Go Back
                </button>
            </view>
        </div>
    );
}

export default Account;