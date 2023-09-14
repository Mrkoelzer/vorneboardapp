//import the got library into your application

import got  from "got";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios"
import { fileURLToPath } from "url";
import { dirname } from "path";
import sql from "mssql"
import { request } from "http";


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

//fetch data from a specific REST API and prints its body to the terminal
//this is vorne api calls
app.post('/updatelinenoorders', (req, res) => {
  const { ipaddress } = req.body;
  const apiUrl = `http://${ipaddress}/api/v0/process_state/reason`;
  const requestData = {"value": 'no_orders'};

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

app.post('/updatelinestartproduction', (req, res) => {
  const { ipaddress } = req.body;
  
  const apiUrl = `http://${ipaddress}/api/v0/process_state/start_production`;
  const requestData = {"value": {}};
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

app.post('/updatelinechangeover', (req, res) => {
  const { ipaddress } = req.body;
  const apiUrl = `http://${ipaddress}/api/v0/process_state/reason`;
  const requestData = {"value": 'changeover'}

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
    const { ipaddress } = req.body;
    const apiUrl = `http://${ipaddress}/api/v0/process_state/details/down`;
    const requestData = req.body;
    let updatedrequestData = {"enabled": requestData.enabled, "reason": requestData.reason}
    axios.post(apiUrl, updatedrequestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updatepartidline', (req, res) => {
    const { ipaddress } = req.body;
    const apiUrl = `http://${ipaddress}/api/v0/part_run`;
    const requestData = req.body;
    let updatedrequestData = {part_id: requestData.part_id}
    axios.post(apiUrl, updatedrequestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updategoodcount', (req, res) => {
    const { ipaddress } = req.body;
    const apiUrl = `http://${ipaddress}/api/v0/inputs/1`;
    const requestData = req.body;
    let updatedrequestData = {count: requestData.count}
    axios.post(apiUrl, updatedrequestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

  app.post('/updaterejectcount', (req, res) => {
    const { ipaddress } = req.body;
    const apiUrl = `http://${ipaddress}/api/v0/inputs/2`;
    const requestData = req.body;
    let updatedrequestData = {count: requestData.count}
    axios.post(apiUrl, updatedrequestData)
      .then((response) => {
        console.log('API call success:');
        res.json({ message: 'API call successful' });
      })
      .catch((error) => {
        console.error('API call error:', error.message);
        res.status(500).json({ message: 'API call failed' });
      });
  });

//fetch data from a specific REST API and prints its body to the terminal
app.get('/getpartrun', async (req, res) => {
  try {
    const lineData = await fetchAllLineData();

    if (lineData.every((data) => data !== null)) {
      res.json(lineData);
    } else {
      res.status(500).send("Some requests failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.use(express.json());


//This is the sql api calls
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

app.post('/api/insertnewline', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const result = await sql.query`INSERT INTO Lines ([Linename],[ipaddress],[packline],[extruder])VALUES(${requestData.Linename},${requestData.ipaddress},${requestData.packline},${requestData.extruder})`;
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

app.post('/api/deletetable', async (req, res) => {
  try {
    const requestData = req.body; // Extract the linename from the request body

    // Validate and sanitize the table name here, for security.

    await sql.connect(config);

    // Use string concatenation to include the table name in the query.
    const query = `DROP TABLE IF EXISTS [${requestData.Linename.Linename}]`;

    const result = await sql.query(query);

    sql.close();

    if (result.rowsAffected[0] === 1) {
      res.json({ tableDropped: true });
    } else {
      res.json({ tableDropped: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/api/addnewtable', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;

    // Use requestData.Linename directly in the SQL query
    const result = await sql.query(
      `CREATE TABLE [dbo].[${requestData.Linename}](
        [Part_ID] [nvarchar](14) NULL,
        [Alternate_Part_ID] [nvarchar](62) NULL,
        [Ideal_Cycle_Time_s] [numeric](4, 2) NULL,
        [Takt_Time_s] [numeric](4, 2) NULL,
        [Target_Labor_per_Piece_s] [numeric](4, 2) NULL,
        [Down_s] [int] NULL,
        [Count_Multiplier_1] [int] NULL,
        [Count_Multiplier_2] [int] NULL,
        [Count_Multiplier_3] [int] NULL,
        [Count_Multiplier_4] [int] NULL,
        [Count_Multiplier_5] [int] NULL,
        [Count_Multiplier_6] [int] NULL,
        [Count_Multiplier_7] [int] NULL,
        [Count_Multiplier_8] [int] NULL,
        [Target_Multiplier] [int] NULL,
        [Start_with_Changeover] [nvarchar](2) NULL,
        [The_changeover_reason_is] [nvarchar](11) NULL,
        [Set_a_target_time_of_s] [nvarchar](4) NULL,
        [End_event] [nvarchar](21) NULL
      );`
    );

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

app.post('/api/updateline', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const result = await sql.query`update [Lines] set [linename]=${requestData.Linename},[ipaddress]=${requestData.ipaddress}, [packline]=${requestData.packline}, [extruder]=${requestData.extruder} where lineid = ${requestData.lineid}`;
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

app.delete('/api/deleteline/:lineid', async (req, res) => {
  try {
    await sql.connect(config);
    const lineid = req.params.lineid; // Get the lineid from the URL parameter
    const result = await sql.query`delete from [lines] where [lineid] = ${lineid}`;
    
    if (result.rowsAffected[0] === 1) {
      res.json({ deleted: true });
    } else {
      res.json({ deleted: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/getlinepart/:tableName', async (req, res) => {
  const { tableName } = req.params;

  try {
    await sql.connect(config);

    const request = new sql.Request();
    const query = `select * from [${tableName}]`;
    
    const result = await request.query(query);

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

