import React, { useState, useContext } from 'react';
import './Dropdown.css';
import { Link, useNavigate } from 'react-router-dom';
import { linescontext } from '../../contexts/linescontext';
import { selectedlinecontext } from '../../contexts/selectedlinecontext';
import { usercontext } from '../../contexts/usercontext';

function Dropdown() {
  const [click, setClick] = useState(false);
  const { lines } = useContext(linescontext);
  const { setselectedline } = useContext(selectedlinecontext)
  const { userdata, setuserdata } = useContext(usercontext);
  const navigate = useNavigate();
  
  const handleClick = () => setClick(!click);

  const handlenavigate =(index)=> {
    const userDataFromLocalStorage = sessionStorage.getItem('userdata');
        let parsedUserData;
        if (userDataFromLocalStorage) {
            parsedUserData = JSON.parse(userDataFromLocalStorage);
            setuserdata(parsedUserData);
        }
        if ((userdata && userdata.loggedin === 1) || (parsedUserData && parsedUserData.loggedin === 1)) {
            if ((userdata && userdata.passwordchange === 1) || (parsedUserData && parsedUserData.pinchange === 1)) {
                navigate('/Changepasswordpin');
            }else{
              setselectedline(lines[index].Linename);
              navigate('/Lineeditor');
            }
        } else {
          console.log('here')
          setselectedline(lines[index].Linename);
          sessionStorage.setItem('LastPage', 'lineeditor')
          navigate('/Login');
        }
    setselectedline(lines[index].Linename);
    setClick(false)
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={click ? 'dropdown-menu clicked' : 'dropdown-menu'}
      >
        {lines.map((item, index) => {
          return (
            <li key={index}>
              <p
                className='dropdown-link'
                onClick={() => handlenavigate(index)}
              >
                {item.Linename}
              </p>
            </li>
          );
        })}
      </div>
    </>
  );
}

export default Dropdown;