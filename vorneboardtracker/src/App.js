import React, { useState, useEffect } from 'react';
import './Css/App.css'
import MainPage from './Pages/MainPage';
import Tracker from './Pages/Tracker';
import Updater from './Pages/Updater';
import Linepackview from './linepages/Linepackview';
import Line3setup from './Pages/Line3setup'
import Login from './Pages/Login';
import Userspage from './Pages/Userspage';
import Account from './Pages/Account';
import Partpdfs from './Pages/Partpdfs';
import Createaccount from './Pages/Createaccount';
import Editlineextruder from './Pages/Editlineextruder'
import Addeditpartnumbers from './Pages/Addeditpartnumbers';
import Changepasswordpin from './Pages/Changepasswordpin'
import Livecameraviews from './Pages/Livecameraviews';
import Selecttablet from './Pages/Selecttablet';
import Pdfs from './Pages/Pdfs';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { partruncontext } from './contexts/partruncontext';
import { linedatacontext } from './contexts/linedatacontext';
import { usercontext } from './contexts/usercontext';
import { linescontext } from './contexts/linescontext';
import { selectedlinecontext } from './contexts/selectedlinecontext';
import { partnumbercontext } from './contexts/partnumbercontext';
import Lineeditor from './linepages/Lineeditor';
import { line3partdatacontext } from './contexts/linepartdatacontext';
import { ipaddrcontext } from './contexts/ipaddrcontext';


function App() {
  const [line3items, setline3items] = useState([]);
  const [lines, setlines] = useState([]);
  const [partnumber, setpartnumber] = useState('')
  const [selectedline, setselectedline] = useState('');
  const [localipaddr, setlocalipaddr] = useState('10.144.18.208');

  useEffect(() => { 
    // Fetch data when the page opens
    fetchlines();
  
    // Fetch data every 10 seconds
    const interval = setInterval(fetchlines, 10000);
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  const fetchlines = async () => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getlines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });

      const data = await response.json();
      if (data) {
        setlines(data.result.recordset)
      } else {
        console.log("error")
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  

  const [partruntable, setpartruntable] = useState([])

  const [linedatatable, setlinedatatable] = useState([{
    "shift": String,
    "start_time": String,
    "run_time": Number,
    "unplanned_stop_time": Number,
    "in_count": Number,
    "good_count": Number,
    "reject_count": Number,
    "average_cycle_time": Number,
    "ideal_cycle_time": Number,
    "oee": Number,
  }
  ])

  const [userdata, setuserdata] = useState([{
    "userid": Number,
    "admin": Number,
    "email": String,
    "first_name": String,
    "guest": Number,
    "last_name": String,
    "password": String,
    "passwordchange": String,
    "pinchange":Number,
    "pin": Number,
    "superadmin": Number,
    "username": String,
    "loggedin": Number,
  }])

  const getuserdata = async () => {
    const userDataFromLocalStorage = localStorage.getItem('userdata');
    if (userDataFromLocalStorage) {
      const parsedUserData = JSON.parse(userDataFromLocalStorage);
      setuserdata(parsedUserData);
    }
  }
  useEffect(() => {
    getuserdata();
  }, []);

  return (
    <BrowserRouter>
      <linescontext.Provider value={{ lines, setlines }}>
        <selectedlinecontext.Provider value={{ selectedline, setselectedline }}>
        <partruncontext.Provider value={{ partruntable, setpartruntable }}>
          <linedatacontext.Provider value={{ linedatatable, setlinedatatable }}>
            <line3partdatacontext.Provider value={{ line3items, setline3items }}>
              <partnumbercontext.Provider value={{partnumber, setpartnumber}}>
              <usercontext.Provider value={{ userdata, setuserdata }}>
                <ipaddrcontext.Provider value={{localipaddr, setlocalipaddr}}>
                <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/Tracker" element={<Tracker />} />
                <Route path="/Updater" element={<Updater />} />
                <Route path="/Lineeditor" element={<Lineeditor />} />
                <Route path="/Linepackview" element={<Linepackview />} />
                <Route path="/Line3setup" element={<Line3setup />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/Createaccount" element={<Createaccount />} />
                <Route path="/Editlineextruder" element={<Editlineextruder />} />
                <Route path="/Addeditpartnumbers" element={<Addeditpartnumbers />} />
                <Route path="/Changepasswordpin" element={<Changepasswordpin/>}/>
                <Route path="/Users" element={<Userspage/>}/>
                <Route path="/Partpdfs" element={<Partpdfs/>}/>
                <Route path="/Pdfs" element={<Pdfs/>}/>
                <Route path="/Livecameraviews" element={<Livecameraviews/>}/>
                <Route path="/Selecttablet" element={<Selecttablet/>}/>
              </Routes>
              </ipaddrcontext.Provider>
              </usercontext.Provider>
              </partnumbercontext.Provider>
            </line3partdatacontext.Provider>
          </linedatacontext.Provider>
        </partruncontext.Provider>
        </selectedlinecontext.Provider>
      </linescontext.Provider>
    </BrowserRouter>
  );
}

export default App;
