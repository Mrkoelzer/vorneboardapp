import React, { useState, useEffect, useContext } from 'react';
import './Css/App.css'
import MainPage from './Pages/MainPage';
import Tracker from './Pages/Tracker';
import Updater from './Pages/Updater';
import Linepackview from './linepages/Linepackview';
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
import Modifyevents from './Pages/Modifyevents';
import Pdfs from './Pages/Pdfs';
import Calendarview from './Pages/Calendarview';
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
import { useErrorlogcontext } from './contexts/errorlogcontext';
import { errorcontext } from './contexts/errorcontext';
import { Toolbarcontext } from './Components/Navbar/Toolbarcontext'
import Navbar from './Components/Navbar/Navbar';
import ShowNavBar from './Components/Navbar/ShowNavBar';
//import { ErrorLogProvider } from './contexts/errorlogcontext';
import Axios from 'axios';

function App() {
  const [line3items, setline3items] = useState([]);
  const [lines, setlines] = useState([]);
  const [partnumber, setpartnumber] = useState('')
  const [selectedline, setselectedline] = useState('');
  const [localipaddr, setlocalipaddr] = useState('10.144.18.208');
  const { Geterrorlog, Fetchlines } = useErrorlogcontext();
  const [errorlogstate, seterrorlogstate] = useState([])
  const [toolbarinfo, settoolbarinfo] = useState([
    {
      Title: "Vorne Home Page"
    }
  ]);

  useEffect(() => {
    // Fetch data when the page opens
    const fetchData = async () => {
      const data = await Geterrorlog(localipaddr);
      const fetcheddata = await Fetchlines(data, localipaddr);
      setlines(fetcheddata)
      const updateddata = await Geterrorlog(localipaddr);
      seterrorlogstate(updateddata)
    };

    // Fetch data when the page opens
    fetchData();

    // Fetch data every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

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
    "pinchange": Number,
    "pin": Number,
    "superadmin": Number,
    "username": String,
    "loggedin": Number,
  }])

  const getuserdata = async () => {
    const userDataFromLocalStorage = sessionStorage.getItem('userdata');
    localStorage.removeItem('userdata')
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
      <errorcontext.Provider value={{ errorlogstate, seterrorlogstate }}>
        <linescontext.Provider value={{ lines, setlines }}>
          <selectedlinecontext.Provider value={{ selectedline, setselectedline }}>
            <partruncontext.Provider value={{ partruntable, setpartruntable }}>
              <linedatacontext.Provider value={{ linedatatable, setlinedatatable }}>
                <line3partdatacontext.Provider value={{ line3items, setline3items }}>
                  <partnumbercontext.Provider value={{ partnumber, setpartnumber }}>
                    <usercontext.Provider value={{ userdata, setuserdata }}>
                      <ipaddrcontext.Provider value={{ localipaddr, setlocalipaddr }}>
                        <Toolbarcontext.Provider value={{ toolbarinfo, settoolbarinfo }}>
                          <ShowNavBar>
                            <Navbar />
                          </ShowNavBar>
                          <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/Tracker" element={<Tracker />} />
                            <Route path="/Updater" element={<Updater />} />
                            <Route path="/Lineeditor" element={<Lineeditor />} />
                            <Route path="/Linepackview" element={<Linepackview />} />
                            <Route path="/Login" element={<Login />} />
                            <Route path="/Account" element={<Account />} />
                            <Route path="/Createaccount" element={<Createaccount />} />
                            <Route path="/Editlineextruder" element={<Editlineextruder />} />
                            <Route path="/Addeditpartnumbers" element={<Addeditpartnumbers />} />
                            <Route path="/Changepasswordpin" element={<Changepasswordpin />} />
                            <Route path="/Users" element={<Userspage />} />
                            <Route path="/Partpdfs" element={<Partpdfs />} />
                            <Route path="/Pdfs" element={<Pdfs />} />
                            <Route path="/Livecameraviews" element={<Livecameraviews />} />
                            <Route path="/Selecttablet" element={<Selecttablet />} />
                            <Route path="/Modifyevents" element={<Modifyevents />} />
                            <Route path="/Calendarview" element={<Calendarview />} />
                          </Routes>
                        </Toolbarcontext.Provider>
                      </ipaddrcontext.Provider>
                    </usercontext.Provider>
                  </partnumbercontext.Provider>
                </line3partdatacontext.Provider>
              </linedatacontext.Provider>
            </partruncontext.Provider>
          </selectedlinecontext.Provider>
        </linescontext.Provider>
      </errorcontext.Provider>
    </BrowserRouter>
  );
}

export default App;
