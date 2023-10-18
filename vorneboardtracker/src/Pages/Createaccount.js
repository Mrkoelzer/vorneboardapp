import React, { useState, useContext, useEffect } from 'react';
import logo from '../IMAGES/jsix-brand-logo.png';
import '../Css/App.css';
import { useNavigate } from 'react-router-dom';
import { usercontext } from '../contexts/usercontext';
import '../Css/createaccount.css'
import Createtoobar from '../Components/Createtoolbar';
import { ipaddrcontext } from '../contexts/ipaddrcontext';

function Createaccount() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const { userdata } = useContext(usercontext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email, setEmail] = useState('');
  const [guest, setGuest] = useState(false);
  const [changepass, setChangepass] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [superadmin, setSuperadmin] = useState(false);
  const { localipaddr } = useContext(ipaddrcontext);

  useEffect(() => {
    if (userdata.loggedin === 1 || userdata.superadmin === 1) {

    }
    else {
      navigate('/')
    }
  }, []);
  const handlecreateaccount = async () => {
    try {
      let gueststate;
      if (guest) {
        gueststate = 1
      }
      else {
        gueststate = 0
      }
      let changepassstate;
      if (changepass) {
        changepassstate = 1
      }
      else {
        changepassstate = 0
      }
      let adminstate;
      if (admin) {
        adminstate = 1
      }
      else {
        adminstate = 0
      }
      let superadminstate;
      if (superadmin) {
        superadminstate = 1
      }
      else {
        superadminstate = 0
      }
      let pinchangestate = 1;

      let pinstate = 1111;


      const response = await fetch(`http://${localipaddr}:1435/api/createaccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, first_name, last_name, email, gueststate, changepassstate, adminstate, superadminstate, pinstate, pinchangestate }),
      });

      const data = await response.json();

      if (data.createdauthenticated) {
        setAuthenticated(true);
        setUsername('');
        setPassword('');
        setFirst_name('');
        setLast_name('');
        setEmail('');
        setGuest('');
        setChangepass('');
        setAdmin('');
        setSuperadmin('');
        setTimeout(() => {
          setAuthenticated(false);
        }, 5000);
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <div className="createaccountpage">
      <Createtoobar />
      <div className="createaccount-flexbox-container">
        <div className="createaccount-flexbox-item">
          <p className="createaccount-textinboxes">
            First Name: <br />
            <input
              className="createaccount-inputs"
              type="text"
              placeholder="First Name"
              value={first_name}
              onChange={(e) => setFirst_name(e.target.value)}
            />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p className="createaccount-textinboxes">
            Last Name: <br />
            <input
              className="createaccount-inputs"
              type="text"
              placeholder="Last Name"
              value={last_name}
              onChange={(e) => setLast_name(e.target.value)}
            />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p className="createaccount-textinboxes">
            Username: <br />
            <input
              className="createaccount-inputs"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p className="createaccount-textinboxes">
            Password: <br />
            <input
              className="createaccount-inputs"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p className="createaccount-textinboxes">
            Email: <br />
            <input
              className="createaccount-inputs"
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </p>
        </div>
      </div>
      <div className="createaccount-flexbox-container">
        <div className="createaccount-flexbox-item">
          <p>
            Change Password After First Login:
            <input checked={changepass} className="createaccount-checkbox" type="checkbox" onChange={(e) => setChangepass(e.target.checked)} />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p>
            Guest:
            <input checked={guest} className="createaccount-checkbox" type="checkbox" onChange={(e) => setGuest(e.target.checked)} />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p>
            Admin:
            <input checked={admin} className="createaccount-checkbox" type="checkbox" onChange={(e) => setAdmin(e.target.checked)} />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <p>
            Super Admin:
            <input checked={superadmin} className="createaccount-checkbox" type="checkbox" onChange={(e) => setSuperadmin(e.target.checked)} />
          </p>
        </div>
        <div className="createaccount-flexbox-item">
          <button className="createaccountbutton" onClick={handlecreateaccount}>Create Account</button>
        </div>
        <div className="createaccount-flexbox-item">
          {authenticated && <p>Account Created</p>}
        </div>
      </div>
    </div>
  );
}

export default Createaccount;