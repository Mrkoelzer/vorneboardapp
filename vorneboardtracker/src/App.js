import React, { useState, useEffect, useContext } from 'react';
import MainPage from './Pages/MainPage/MainPage';
import Tracker from './Pages/Tracker/Tracker';
import Updater from './Pages/Updater/Updater';
import LineView from './Pages/LineView/LineView';
import Login from './Pages/Login/Login';
import UsersPage from './Pages/UserPage/UserPage';
import Settings from './Pages/Settings/Settings';
import LinkPDF from './Pages/LinkPDF/LinkPDF';
import EditLines from './Pages/EditLines/EditLines'
import PartNumbers from './Pages/PartNumbers/PartNumbers';
import ChangePasswordPin from './Pages/ChangePasswordPin/ChangePasswordPin'
import LiveCameraViews from './Pages/LiveCameraViews/LiveCameraViews';
import SelectTablet from './Pages/SelectTablet/SelectTablet';
import ModifyEvents from './Pages/ModifyEvents/ModifyEvents';
import Pdfs from './Pages/PDFs/PDFs';
import FutureRuns from './Pages/FutureRuns/FutureRuns';
import CalendarView from './Pages/CalendarView/CalendarView';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { partruncontext } from './contexts/partruncontext';
import { linedatacontext } from './contexts/linedatacontext';
import { usercontext } from './contexts/usercontext';
import { linescontext } from './contexts/linescontext';
import { selectedlinecontext } from './contexts/selectedlinecontext';
import { partnumbercontext } from './contexts/partnumbercontext';
import LineRealTime from './Pages/LineRealTime/LineRealTime';
import { line3partdatacontext } from './contexts/linepartdatacontext';
import { ipaddrcontext } from './contexts/ipaddrcontext';
import { useErrorlogcontext } from './contexts/errorlogcontext';
import { errorcontext } from './contexts/errorcontext';
import { Toolbarcontext } from './Components/Navbar/Toolbarcontext'
import Navbar from './Components/Navbar/Navbar';
import ShowNavBar from './Components/Navbar/ShowNavBar';

function App() {
  const [line3items, setline3items] = useState([]);
  const [lines, setlines] = useState([]);
  const [partnumber, setpartnumber] = useState('')
  const [selectedline, setselectedline] = useState('');
  const [localipaddr, setlocalipaddr] = useState('192.168.22.43');
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
                            <Route path="/LineRealTime" element={<LineRealTime />} />
                            <Route path="/LineView" element={<LineView />} />
                            <Route path="/Login" element={<Login />} />
                            <Route path="/Settings" element={<Settings />} />
                            <Route path="/EditLines" element={<EditLines />} />
                            <Route path="/PartNumbers" element={<PartNumbers />} />
                            <Route path="/ChangePasswordPin" element={<ChangePasswordPin />} />
                            <Route path="/UsersPage" element={<UsersPage />} />
                            <Route path="/LinkPDF" element={<LinkPDF />} />
                            <Route path="/Pdfs" element={<Pdfs />} />
                            <Route path="/LiveCameraViews" element={<LiveCameraViews />} />
                            <Route path="/SelectTablet" element={<SelectTablet />} />
                            <Route path="/ModifyEvents" element={<ModifyEvents />} />
                            <Route path="/CalendarView" element={<CalendarView />} />
                            <Route path="/FutureRuns" element={<FutureRuns />} />
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
