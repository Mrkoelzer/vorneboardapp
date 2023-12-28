import React, { useState, useEffect, useContext } from "react";
import swal from "sweetalert";
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useNavigate } from 'react-router-dom';
import "./NextPin.css";
import { linescontext } from '../../contexts/linescontext';
import { selectedlinecontext } from '../../contexts/selectedlinecontext';
import Axios from 'axios';
import { NotificationContainer, NotificationManager } from 'react-notifications';

function Pin({ handleClose }) {
  const [input, setInput] = useState("");
  const [layoutName, setLayoutName] = useState("default");
  const { localipaddr } = useContext(ipaddrcontext);
  const { lines, setlines } = useContext(linescontext);
  const { selectedline } = useContext(selectedlinecontext);
  const [lineparts, setlineparts] = useState([]);
  const [Data, setData] = useState([
    {
      event_id: Number,
      title: String,
      part: String,
      start: String,
      end: String,
      order: Number,
      state: Number
    }
  ]);
  const navigate = useNavigate();
  const onChange = (newInput) => {
    setInput(newInput);
  };

  const fetchruns = async () => {
    if (lines.length === 0) {
      const storedLines = sessionStorage.getItem('lines');
      // Parse the retrieved string back into an array
      const parsedLines = storedLines ? JSON.parse(storedLines) : [];
      // Set the retrieved data into useState
      setlines(parsedLines);
      return getallruns(parsedLines)
    }
    else {
      return getallruns(lines)
    }
  }

  const getallruns = async (data) => {
    const futurerundata = await getfutureruns();
    const runDataPromises = data.map(async (line) => {
      const linename = line.Linename;
      const filteredFuturerundata = (futurerundata || []).filter((run) => run.title === linename);

      return filteredFuturerundata;
    });

    const currentRunsData = await Promise.all(runDataPromises);
    const flattenedData = currentRunsData.flat(); // Flatten the nested arrays
    const filteredData = flattenedData.filter(item => item.title === selectedline);

    setData(filteredData);
  };

  const getfutureruns = async () => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getfutureevents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data) {
        //setData(data.result.recordset);
        return data.result.recordset

      } else {
        console.log('error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getcurrentrun = async (ipaddress) => {
    const apiUrl = `http://${ipaddress}/api/v0/channels/shift/events/current?fields=part_display_name`;

    return await Axios.get(apiUrl)
      .then((response) => {
        const data = response.data;
        if (data) {
          return data.data.events[0];
        } else {
          // Handle the case where part_id is missing or undefined
          return { ...data, part_id: 'N/A' };
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        return null;
      });
  };

  const getPartNumbers = async (tableName) => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getlinepart/${tableName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data) {
        setlineparts(data.result.recordset);
      } else {
        console.log('error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlepartidSelect = async (selectedAction) => {
    // Map the endpoint identifier to the full URL
    const selectedEndpoint = `http://${localipaddr}:1433/updatepartidline`;
    let ipaddress = ''
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].Linename === selectedline) {
        ipaddress = lines[i].ipaddress
      }
    }
    // Replace hyphens with "j" globally
    selectedAction = selectedAction.replace(/-/g, 'j');
    let selectedpart = selectedAction.replace(/j/g, '-')
    let linedata;
    lineparts.forEach((line) => {
      if (line.Part_ID === selectedpart) {
        linedata = line
      }
    });
    // Construct requestData based on the selected action
    let requestData;
    requestData = {
      part_id: linedata.Part_ID,
      part_description: linedata.Alternate_Part_ID,
      ideal_cycle_time: linedata.Ideal_Cycle_Time_s,
      takt_time: linedata.Takt_Time_s,
      target_labor_per_piece: linedata.Target_Labor_per_Piece_s,
      down_threshold: linedata.Down_s,
      count_multipliers: [
        linedata.Count_Multiplier_1,
        linedata.Count_Multiplier_2,
        linedata.Count_Multiplier_3,
        linedata.Count_Multiplier_4,
        linedata.Count_Multiplier_5,
        linedata.Count_Multiplier_6,
        linedata.Count_Multiplier_7,
        linedata.Count_Multiplier_8,
      ],
      Target_multipliers: linedata.Target_Multiplier,
      start_with_changeover: "true",
      ipaddress: ipaddress
    }

    // Make the API call based on selected action and row
    await Axios.post(selectedEndpoint, requestData)
      .then((response) => {
        NotificationManager.success(`Updating Vorne to Part ${requestData.part_id}!`)
        console.log('API call success:', response.data);
      })
      .catch((error) => {
        NotificationManager.error('Updating Vorne to Part Failed!')
        console.error('API call error:', error);
      });
  };

  const onKeyPress = (button, localipaddr) => {
    if (button === "{clear}") {
      handleClear();
      return;
    }

    if (button === "{bksp}") {
      if (input.length > 0) {
        setInput(input.slice(0, -1));
      }
      return;
    }

    if (input.length < 4) {
      setInput(input + button);
    }

    if (input.length === 3) {
      onSubmitHandler(input + button, localipaddr);
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const onSubmitHandler = async (pin, localipaddr) => {
    try {
      const response = await fetch(`http://${localipaddr}:1435/api/getpin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();
      if (data.pinauthenticated) {
        if (Data.length === 1) {
          swal("No future runs have been set, Either set future runs or manually select from Live Real Time.", "error")
          handleClear();
          handleClose()
        }
        else {
          swal(`Changeover Starting for part: ${Data[1].part}`, "Success")
          handleClose()
          handlepartidSelect(Data[1].part)
          handledeleteClick(Data[0])
        }
      } else {
        swal("Invalid PIN!", "The PIN you entered didn't match. Try again", "error");
        handleClear();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlesave = async (deletedevent, newData) => {
    try {
      // Handle changed rows
      const updatePromises = newData.map(async (row) => {
        const response = await fetch(`http://${localipaddr}:1435/api/updateevent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });

        if (!response.ok) {
          throw new Error('Run Order Update Failed');
        }
      });

      // Wait for all update promises to resolve
      await Promise.all(updatePromises);

      // Handle deleted rows
      const event_id = deletedevent.event_id
      const response = await fetch(`http://${localipaddr}:1435/api/deletefutureevent`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id }),
      });

      if (!response.ok) {
        throw new Error('Run Order Delete Failed');
      }
    } catch (error) {
      NotificationManager.error('Save failed');
      console.error('Error:', error);
    }
  };

  const handledeleteClick = (row) => {
    const indexToDelete = Data.findIndex(item => item.event_id === row.event_id);

    if (indexToDelete !== -1) {
      const updatedData = [...Data.slice(0, indexToDelete), ...Data.slice(indexToDelete + 1)];

      const deletedRow = Data[indexToDelete];

      const updatedDataWithNewOrder = updatedData.map((item, index) => ({
        ...item,
        order: index,
      }));

      // Remove the first element in the updatedDataWithNewOrder array
      //updatedDataWithNewOrder.shift();

      const newdata = updatedDataWithNewOrder;
      handlesave(deletedRow, newdata)
    } else {
      console.error("Row not found in data array");
    }
  };


  useEffect(() => {
    getPartNumbers(selectedline)
    fetchruns()
    // You can perform any side-effects or setup here if needed
    // For example, if you want to configure the keyboard or initialize some values
  }, []);

  return (
    <ipaddrcontext.Consumer>
      {context => {
        const { localipaddr } = context;
        return (
          <div className="Pin home-container-Next">
            <div className="text white-text">
              <h2 id="todaysDate"> </h2>
            </div>
            <div className="pin-input">
              {[...Array(4)].map((_, index) => (
                <div key={index} className={`pin-box ${input.length > index ? 'filled' : ''}`}>
                  {input[index]}
                </div>
              ))}
            </div>
            <Keyboard
              layoutName={layoutName}
              theme="hg-theme-default hg-theme-numeric hg-layout-numeric numeric-theme"
              layout={{
                default: ["1 2 3", "4 5 6", "7 8 9", "{clear} 0 {bksp}"]
              }}
              mergeDisplay
              display={{
                "{clear}": "Clear",
                "{bksp}": "⌫"
              }}
              maxLength={4}
              onKeyPress={button => onKeyPress(button, localipaddr)}
              onChange={input => onChange(input)}
            />
          </div>
        );
      }}
    </ipaddrcontext.Consumer>
  );
}

export default Pin;
