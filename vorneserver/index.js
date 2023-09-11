//import the got library into your application

import got  from "got";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios"
import { fileURLToPath } from "url";
import { dirname } from "path";
import sql from "mssql"


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()

const config = {
 user: 'appuser',
 password: 'Jsix1234',
 server: '10.144.19.26',
 database: 'vorneboardapp',
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: 'SQLEXPRESS',   
  },
  port: 1434 // <-- add your custom port here
};

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));

app.listen(1433, ()=>{
    console.log("running server")
})

function getsectotime(time){
  var date = new Date(0);
  date.setSeconds(time); // specify value for SECONDS here
  var timeString = date.toISOString().substring(11, 19);
  return timeString
}

function getshiftname(shift){
  if(shift==="first_shift"){
    return "First Shift"
  }
  else if(shift==="second_shift"){
    return "Second Shift"
  }
  else if(shift==="third_shift"){
    return "Third Shift"
  }
  else{
    return "Unkown Shift"
  }
}

const fetchData = async (url) => {
    try {
        const response = await got.get(url); 
        const responseData = JSON.parse(response.body);
        return responseData.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};
//#region Api calls for line 3
//fetch data from a specific REST API and prints its body to the terminal
app.get('/getline3partrun', async (req, res) => {
  try {
      const partRun3 = await fetchData("http://10.144.21.150/api/v0/part_run");
      const partRun3ps = await fetchData("http://10.144.21.150/api/v0/process_state/details/");
      const processstatereason3 = await fetchData("http://10.144.21.150/api/v0/channels/shift/events/current?fields=process_state_reason_display_name");
      const processstatereasondown3 = await fetchData("http://10.144.21.150/api/v0/process_state/details");
      if (partRun3) {
          const combinedData = [
              {
                  line_name: "Line 3",
                  part_id: partRun3.part_id.replace(/j/g, '-'),
                  ideal_cycle_time: partRun3.ideal_cycle_time,
                  process_state_break: partRun3ps.break.active,
                  process_state_changeover: partRun3ps.break.active,
                  process_state_detecting_state: partRun3ps.detecting_state.active,
                  process_state_down: partRun3ps.down.active,
                  process_state_no_production: partRun3ps.no_production.active,
                  process_state_not_monitored: partRun3ps.not_monitored.active,
                  process_state_running: partRun3ps.running.active,
                  process_state_reason: processstatereason3.events[0][0],
                  process_state_reason_down: processstatereasondown3.down.process_state_reason
              },              
          ];
          res.json(combinedData);
      } else {
          res.status(500).send("No data found");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }
});

app.get('/getline3data', async (req, res) => {
  try {
      const line3data = await fetchData("http://10.144.21.150/api/v0/channels/shift/events/current?fields=shift,start_time,run_time,unplanned_stop_time,in_count,good_count,reject_count,average_cycle_time,ideal_cycle_time,oee");

     if (line3data) {
          const combinedData = [
              {
                shift: getshiftname(line3data.events[0][0]),
                start_time: line3data.events[0][1],
                run_time: getsectotime(line3data.events[0][2]),
                unplanned_stop_time: getsectotime(line3data.events[0][3]),
                in_count: line3data.events[0][4],
                good_count: line3data.events[0][5],
                reject_count: line3data.events[0][6],
                average_cycle_time: (Math.round(line3data.events[0][7]*100)/100).toFixed(2),
                ideal_cycle_time: line3data.events[0][8],
                oee: (line3data.events[0][9]*100).toFixed(1)
              },              
          ];
          res.json(combinedData);
      } else {
          res.status(500).send("No data found");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }
});

//
app.post('/updatelinenoorders0', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction0', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  app.post('/updatelinechangeover0', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updateprocessstatereason', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/process_state/details/down';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatepartidline3', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/part_run';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updategoodcountline3', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/inputs/1';
    const requestData = req.body;
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updaterejectcountline3', (req, res) => {
    const apiUrl = 'http://10.144.21.150/api/v0/inputs/2';
    const requestData = req.body;
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  
  //#endregion
//#region Api calls for line 4
app.get('/getline4partrun', async (req, res) => {
  try {
      const partRun3 = await fetchData("http://10.144.21.151/api/v0/part_run");
      const partRun3ps = await fetchData("http://10.144.21.151/api/v0/process_state/details/");
      const processstatereason3 = await fetchData("http://10.144.21.151/api/v0/channels/shift/events/current?fields=process_state_reason_display_name");
      const processstatereasondown3 = await fetchData("http://10.144.21.151/api/v0/process_state/details");
      if (partRun3) {
          const combinedData = [
              {
                  line_name: "Line 4",
                  part_id: partRun3.part_id.replace(/j/g, '-'),
                  ideal_cycle_time: partRun3.ideal_cycle_time,
                  process_state_break: partRun3ps.break.active,
                  process_state_changeover: partRun3ps.break.active,
                  process_state_detecting_state: partRun3ps.detecting_state.active,
                  process_state_down: partRun3ps.down.active,
                  process_state_no_production: partRun3ps.no_production.active,
                  process_state_not_monitored: partRun3ps.not_monitored.active,
                  process_state_running: partRun3ps.running.active,
                  process_state_reason: processstatereason3.events[0][0],
                  process_state_reason_down: processstatereasondown3.down.process_state_reason
              },              
          ];
          res.json(combinedData);
      } else {
          res.status(500).send("No data found");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }
});

app.get('/getline4data', async (req, res) => {
  try {
      const line3data = await fetchData("http://10.144.21.151/api/v0/channels/shift/events/current?fields=shift,start_time,run_time,unplanned_stop_time,in_count,good_count,reject_count,average_cycle_time,ideal_cycle_time,oee");

     if (line3data) {
          const combinedData = [
              {
                shift: getshiftname(line3data.events[0][0]),
                start_time: line3data.events[0][1],
                run_time: getsectotime(line3data.events[0][2]),
                unplanned_stop_time: getsectotime(line3data.events[0][3]),
                in_count: line3data.events[0][4],
                good_count: line3data.events[0][5],
                reject_count: line3data.events[0][6],
                average_cycle_time: (Math.round(line3data.events[0][7]*100)/100).toFixed(2),
                ideal_cycle_time: line3data.events[0][8],
                oee: (line3data.events[0][9]*100).toFixed(1)
              },              
          ];
          res.json(combinedData);
      } else {
          res.status(500).send("No data found");
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }
});
app.post('/updatelinenoorders1', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction1', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  app.post('/updatelinechangeover1', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updateprocessstatereasonline4', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/process_state/details/down';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatepartidline4', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/part_run';
    const requestData = req.body;
  
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updategoodcountline4', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/inputs/1';
    const requestData = req.body;
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updaterejectcountline4', (req, res) => {
    const apiUrl = 'http://10.144.21.151/api/v0/inputs/2';
    const requestData = req.body;
    axios.post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  //#endregion
//#region Api calls for line 5
app.post('/updatelinenoorders2', (req, res) => {
    const apiUrl = 'http://10.144.21.152/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction2', (req, res) => {
    const apiUrl = 'http://10.144.21.152/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinechangeover2', (req, res) => {
    const apiUrl = 'http://10.144.21.152/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  
  //#endregion
//#region Api calls for line 7
app.post('/updatelinenoorders3', (req, res) => {
    const apiUrl = 'http://10.144.21.155/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction3', (req, res) => {
    const apiUrl = 'http://10.144.21.155/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  
  //#endregion
//#region Api calls for line 8
app.post('/updatelinenoorders4', (req, res) => {
    const apiUrl = 'http://10.144.21.156/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction4', (req, res) => {
    const apiUrl = 'http://10.144.21.156/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  
  //#endregion
//#region Api calls for line 9
app.post('/updatelinenoorders5', (req, res) => {
    const apiUrl = 'http://10.144.21.153/api/v0/process_state/reason';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatelinestartproduction5', (req, res) => {
    const apiUrl = 'http://10.144.21.153/api/v0/process_state/start_production';
    const requestData = req.body;
  
    axios
      .post(apiUrl, requestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });
  
  //#endregion

//fetch data from a specific REST API and prints its body to the terminal
app.get('/getpartrun', async (req, res) => {
    try {
        const partRun3 = await fetchData("http://10.144.21.150/api/v0/part_run");
        const partRun4 = await fetchData("http://10.144.21.151/api/v0/part_run");
        const partRun5 = await fetchData("http://10.144.21.152/api/v0/part_run");
        const partRun7 = await fetchData("http://10.144.21.155/api/v0/part_run");  
        const partRun8 = await fetchData("http://10.144.21.156/api/v0/part_run"); 
        const partRun9 = await fetchData("http://10.144.21.153/api/v0/part_run");
        const partRun3ps = await fetchData("http://10.144.21.150/api/v0/process_state/details/");
        const partRun4ps = await fetchData("http://10.144.21.151/api/v0/process_state/details/");
        const partRun5ps = await fetchData("http://10.144.21.152/api/v0/process_state/details/");
        const partRun7ps = await fetchData("http://10.144.21.155/api/v0/process_state/details/");
        const partRun8ps = await fetchData("http://10.144.21.156/api/v0/process_state/details/");  
        const partRun9ps = await fetchData("http://10.144.21.153/api/v0/process_state/details/");
        const processstatereason3 = await fetchData("http://10.144.21.150/api/v0/channels/shift/events/current?fields=process_state_reason_display_name");

        if (partRun5 && partRun3) {
            const combinedData = [
                {
                    line_name: "Line 3",
                    part_id: partRun3.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun3.ideal_cycle_time,
                    process_state_break: partRun3ps.break.active,
                    process_state_changeover: partRun3ps.break.active,
                    process_state_detecting_state: partRun3ps.detecting_state.active,
                    process_state_down: partRun3ps.down.active,
                    process_state_no_production: partRun3ps.no_production.active,
                    process_state_not_monitored: partRun3ps.not_monitored.active,
                    process_state_running: partRun3ps.running.active,
                    process_state_reason: processstatereason3.events[0][0]
                },
                {
                    line_name: "Line 4",
                    part_id: partRun4.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun4.ideal_cycle_time,
                    process_state_break: partRun4ps.break.active,
                    process_state_changeover: partRun4ps.break.active,
                    process_state_detecting_state: partRun4ps.detecting_state.active,
                    process_state_down: partRun4ps.down.active,
                    process_state_no_production: partRun4ps.no_production.active,
                    process_state_not_monitored: partRun4ps.not_monitored.active,
                    process_state_running: partRun4ps.running.active,
                },
                {
                    line_name: "Line 5",
                    part_id: partRun5.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun5.ideal_cycle_time,
                    process_state_break: partRun5ps.break.active,
                    process_state_changeover: partRun5ps.break.active,
                    process_state_detecting_state: partRun5ps.detecting_state.active,
                    process_state_down: partRun5ps.down.active,
                    process_state_no_production: partRun5ps.no_production.active,
                    process_state_not_monitored: partRun5ps.not_monitored.active,
                    process_state_running: partRun5ps.running.active,
                },
                {
                    line_name: "Line 7",
                    part_id: partRun7.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun7.ideal_cycle_time,
                    process_state_break: partRun7ps.break.active,
                    process_state_changeover: partRun7ps.break.active,
                    process_state_detecting_state: partRun7ps.detecting_state.active,
                    process_state_down: partRun7ps.down.active,
                    process_state_no_production: partRun7ps.no_production.active,
                    process_state_not_monitored: partRun7ps.not_monitored.active,
                    process_state_running: partRun7ps.running.active,
                },
                {
                    line_name: "Line 8",
                    part_id: partRun8.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun8.ideal_cycle_time,
                    process_state_break: partRun8ps.break.active,
                    process_state_changeover: partRun8ps.break.active,
                    process_state_detecting_state: partRun8ps.detecting_state.active,
                    process_state_down: partRun8ps.down.active,
                    process_state_no_production: partRun8ps.no_production.active,
                    process_state_not_monitored: partRun8ps.not_monitored.active,
                    process_state_running: partRun8ps.running.active,
                },
                {
                    line_name: "Line 9",
                    part_id: partRun9.part_id.replace(/j/g, '-'),
                    ideal_cycle_time: partRun9.ideal_cycle_time,
                    process_state_break: partRun9ps.break.active,
                    process_state_changeover: partRun9ps.break.active,
                    process_state_detecting_state: partRun9ps.detecting_state.active,
                    process_state_down: partRun9ps.down.active,
                    process_state_no_production: partRun9ps.no_production.active,
                    process_state_not_monitored: partRun9ps.not_monitored.active,
                    process_state_running: partRun9ps.running.active,
                },
                
            ];
            res.json(combinedData);
        } else {
            res.status(500).send("No data found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
    }
});

app.use(express.json());

app.post('/api/authenticate', async (req, res) => {
  try {
    await sql.connect(config);
    const { username, password } = req.body;

    const result = await sql.query`SELECT * FROM Users WHERE username = ${username} AND password = ${password}`;
    if (result.recordset.length > 0) {
      res.json({ result, authenticated: true });
    } else {
      res.json({ authenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/getpin', async (req, res) => {
  try {
    await sql.connect(config);
    const { pin } = req.body;

    const result = await sql.query`SELECT * FROM Users WHERE pin = ${pin}`;
    if (result.recordset.length > 0) {
      res.json({ pinauthenticated: true });
    } else {
      res.json({ pinauthenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/createaccount', async (req, res) => {
  try {
    await sql.connect(config);
    const { username,password,first_name,last_name,email,gueststate,changepassstate,adminstate,superadminstate,pinstate } = req.body;

    const result = await sql.query`INSERT INTO Users ([username],[password],[first_name],[last_name],[pin],[email],[admin],[superadmin],[guest],[passwordchange])VALUES(${username},${password},${first_name},${last_name},${pinstate},${email},${adminstate},${superadminstate},${gueststate},${changepassstate})`;
    if (result) {
      res.json({ createdauthenticated: true });
    } else {
      res.json({ createdauthenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/getline3part', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`select * from Line3part`;
    if (result) {
      res.json({ result });
    } else {
      res.json({ authenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/getline4part', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`select * from Line4part`;
    if (result) {
      res.json({ result });
    } else {
      res.json({ authenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/getlines', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`select * from Lines`;
    if (result) {
      res.json({ result });
    } else {
      res.json({ authenticated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 1434;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

