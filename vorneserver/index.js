//import the got library into your application

import got  from "got";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import axios, { Axios } from "axios"
import { fileURLToPath } from "url";
import { dirname } from "path";
import sql from "mssql"
import { request } from "http";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appApi = express(); // Create an Express instance for API calls
const appSql = express(); // Create another Express instance for SQL
const cookie = 'sid=session=f7c54c700ed53d1aaa85dd93c2d89b92&user=Administrator&digest=e19e0793cf5713d70f8ece89ec2a1a41dc01ad5c'
const config = {
 user: 'vorneuser',
 password: 'Jsix1234',
 server: 'CO-LAPTOP48',
 database: 'vorneboardapp',
  options: {
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: 'SQLEXPRESS',   
  },
  port: 1434 // <-- add your custom port here
};

appApi.use(bodyParser.json());
appApi.use(express.static(__dirname + "/public"));

appSql.use(bodyParser.json());
appSql.use(express.static(__dirname + "/public"));


appApi.use(cors());
appSql.use(cors());

appApi.listen(1433, () => {
  console.log("API server is running on port 1433");
});

// SQL routes (appSql instance)
appSql.listen(1435, () => {
  console.log("SQL server is running on port 1435");
});
//fetch data from a specific REST API and prints its body to the terminal
//this is vorne api calls
appApi.post('/updatelinenoorders', (req, res) => {
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

appApi.post('/updatelinestartproduction', (req, res) => {
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

appApi.post('/updatelinechangeover', (req, res) => {
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

appApi.post('/updatebreak', (req, res) => {
  const { ipaddress, enabled, reason } = req.body;
  const apiUrl = `http://${ipaddress}/api/v0/process_state/details/break`;
  const requestData = {
    "enabled": enabled,
    "reason": reason
  };
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

  appApi.post('/updateprocessstatereason', (req, res) => {
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

  appApi.post('/updatepartidline', (req, res) => {
    const { ipaddress } = req.body;
    const apiUrl = `http://${ipaddress}/api/v0/part_run`;
    const requestData = req.body;
    let updatedrequestData = {part_id: requestData.part_id,
      part_description: requestData.part_description,
      ideal_cycle_time: requestData.ideal_cycle_time,
      takt_time: requestData.takt_time,
      target_labor_per_piece: requestData.target_labor_per_piece,
      down_threshold: requestData.down_threshold,
      count_multipliers: requestData.count_multipliers,
      Target_multipliers: requestData.Target_multipliers,
      start_with_changeover: false}
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

  appApi.post('/updategoodcount', (req, res) => {
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

  appApi.post('/updaterejectcount', (req, res) => {
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
appApi.get('/getpartrun', async (req, res) => {
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

appApi.post('/insertpartintovorne', (req, res) => {
  const { ipaddress, ...requestData } = req.body; // Destructure ipaddress and get the rest of the requestData
  const apiUrl = `http://${ipaddress}/rest/v1/categories/part/values`;
  // Define your login credentials
  const username = 'Administrator'; // Replace with your actual username
  const password = 'aragorn'; // Replace with your actual password

  // Create a base64-encoded credentials string
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  // Define headers with Basic Authentication
  const headers = {
    'Authorization': `Basic ${credentials}`, // Adding Basic Authentication header
    'Content-Type': 'application/json', // Specify the content type
    'Cookie': cookie
  };
  console.log(apiUrl)
  console.log(requestData)
  axios
    .post(apiUrl, requestData, { headers }) // Pass headers in the request
    .then((response) => {
      console.log('API call success:');
      res.json({ message: 'API call successful' });
    })
    .catch((error) => {
      console.error('API call error:', error.message);
      res.status(500).json({ message: 'API call failed' });
    });
});

appSql.use(express.json());


//This is the sql api calls
appSql.post('/api/authenticate', async (req, res) => {
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

appSql.post('/api/getpin', async (req, res) => {
  try {
    console.log('getting here')
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

appSql.post('/api/createaccount', async (req, res) => {
  try {
    await sql.connect(config);
    const { username,password,first_name,last_name,email,gueststate,changepassstate,adminstate,superadminstate,pinstate, pinchangestate } = req.body;

    const result = await sql.query`INSERT INTO Users ([username],[password],[first_name],[last_name],[pin],[email],[admin],[superadmin],[guest],[passwordchange],[pinchange])VALUES(${username},${password},${first_name},${last_name},${pinstate},${email},${adminstate},${superadminstate},${gueststate},${changepassstate}, ${pinchangestate})`;
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

appSql.post('/api/insertnewline', async (req, res) => {
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

appSql.post('/api/insertnewpart', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const tableName = requestData.Linename; // Extract table name

    // Remove Linename from requestData
    delete requestData.Linename;

    // Create an array of parameter names and values

    // Construct the parameterized query
    const query = `
      INSERT INTO [dbo].[${tableName}]
      ([Part_ID]
        ,[Alternate_Part_ID]
        ,[Ideal_Cycle_Time_s]
        ,[Takt_Time_s]
        ,[Target_Labor_per_Piece_s]
        ,[Down_s]
        ,[Count_Multiplier_1]
        ,[Count_Multiplier_2]
        ,[Count_Multiplier_3]
        ,[Count_Multiplier_4]
        ,[Count_Multiplier_5]
        ,[Count_Multiplier_6]
        ,[Count_Multiplier_7]
        ,[Count_Multiplier_8]
        ,[Target_Multiplier]
        ,[Start_with_Changeover]
        ,[The_changeover_reason_is]
        ,[Set_a_target_time_of_s]
        ,[End_event])
      VALUES (
        '${requestData.Part_ID}',
        '${requestData.Alternate_Part_ID}',
        ${requestData.Ideal_Cycle_Time_s},
        ${requestData.Takt_Time_s},
        ${requestData.Target_Labor_per_Piece_s},
        ${requestData.Down_s},
        ${requestData.Count_Multiplier_1},
        ${requestData.Count_Multiplier_2},
        ${requestData.Count_Multiplier_3},
        ${requestData.Count_Multiplier_4},
        ${requestData.Count_Multiplier_5},
        ${requestData.Count_Multiplier_6},
        ${requestData.Count_Multiplier_7},
        ${requestData.Count_Multiplier_8},
        ${requestData.Target_Multiplier},
        '${requestData.Start_with_Changeover}',
        '${requestData.The_changeover_Reason_is}',
        '${requestData.Set_a_target_time_of_s}',
        '${requestData.End_Event}'
      )`;
    // Execute the query with parameters
    const result = await sql.query(query);

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

appSql.post('/api/deletetable', async (req, res) => {
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



appSql.post('/api/addnewtable', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;

    // Use requestData.Linename directly in the SQL query
    const result = await sql.query(
      `CREATE TABLE [dbo].[${requestData.Linename}](
        [Part_ID] [nvarchar](25) NULL,
        [Alternate_Part_ID] [nvarchar](128) NULL,
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

appSql.post('/api/updateline', async (req, res) => {
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

appSql.post('/api/updatepartnumber', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    console.log(requestData)
    const query = `UPDATE [${requestData.Linename}]
    SET [Part_ID] = '${requestData.Part_ID}'
       ,[Alternate_Part_ID] = '${requestData.Alternate_Part_ID}'
       ,[Ideal_Cycle_Time_s] = ${requestData.Ideal_Cycle_Time_s}
       ,[Takt_Time_s] = ${requestData.Takt_Time_s}
       ,[Target_Labor_per_Piece_s] = ${requestData.Target_Labor_per_Piece_s}
       ,[Down_s] = ${requestData.Down_s}
       ,[Count_Multiplier_1] = ${requestData.Count_Multiplier_1}
       ,[Count_Multiplier_2] = ${requestData.Count_Multiplier_2}
       ,[Count_Multiplier_3] = ${requestData.Count_Multiplier_3}
       ,[Count_Multiplier_4] = ${requestData.Count_Multiplier_4}
       ,[Count_Multiplier_5] = ${requestData.Count_Multiplier_5}
       ,[Count_Multiplier_6] = ${requestData.Count_Multiplier_6}
       ,[Count_Multiplier_7] = ${requestData.Count_Multiplier_7}
       ,[Count_Multiplier_8] = ${requestData.Count_Multiplier_8}
       ,[Target_Multiplier] = ${requestData.Target_Multiplier}
       ,[Start_with_Changeover] = '${requestData.Start_with_Changeover}'
       ,[The_changeover_reason_is] = '${requestData.The_changeover_reason_is}'
       ,[Set_a_target_time_of_s] = '${requestData.Set_a_target_time_of_s}'
       ,[End_event] = '${requestData.End_event}'
  WHERE [Part_ID] = '${requestData.oldPart_ID}'`;
    console.log(query)
  const result = await sql.query(query)
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

appSql.delete('/api/deleteline/:lineid', async (req, res) => {
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

appSql.delete('/api/deleteline', async (req, res) => {
  try {
      await sql.connect(config);
      //const part_id = req.params.part_id; // Get the part_id from the URL parameter
      const { linename, id } = req.body; // Get the linename from the request body
      const query=`DELETE FROM [${linename}] WHERE [Part_ID] = '${id}'`
      // Use single quotes for nvarchar values
      const result = await sql.query(query);

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

appSql.get('/api/getlinepart/:tableName', async (req, res) => {
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

appSql.post('/api/updatetablename', async (req, res) => {
  const { oldtablename, tableName } = req.body;
  console.log(oldtablename + tableName)
  try {
    await sql.connect(config);

    const request = new sql.Request();
    const query = `exec sp_rename [${oldtablename}], [${tableName}]`;
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

appSql.get('/api/getlines', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`select * from Lines order by Linename asc`;
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

appSql.get('/api/getlinepartnumbers', async (req, res) => {
  const { linename } = req.query;

  try {
    const pool = await sql.connect(config);
    const request = pool.request(); // Create a request object from the connection pool

    const query = `select * from [${linename}] order by Part_id`;
    const result = await request.query(query);

    if (result) {
      res.json({ result });
    } else {
      res.json({ authenticated: false });
    }

    pool.close(); // Close the SQL Server connection
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.post('/api/getalllinepartnumbers', async (req, res) => {
  let sqlPool; // Define the SQL pool outside the try/catch block

  try {
    sqlPool = await sql.connect(config); // Connect to the SQL server
    const { query } = req.body; // Get the SQL query from the request body

    const result = await sqlPool.query(query);

    if (result) {
      res.json(result);
    } else {
      res.json({ deleted: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    try {
      if (sqlPool) {
        await sqlPool.close(); // Close the SQL pool if it was successfully opened
      }
    } catch (error) {
      console.error('Error closing SQL connection:', error);
    }
  }
});

