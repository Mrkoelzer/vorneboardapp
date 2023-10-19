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
import fs from "fs";
import fileUpload from 'express-fileupload';


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
appApi.use(fileUpload());

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

// Serve PDF files (appApi instance)
appApi.post('/api/pdfs', (req, res) => {
  const { filename } = req.body;
  const pdfPath = 'C:\\vorneboardapp\\vorneserver\\public\\PDF\\' + filename;
  // Check if the file exists
  if (fs.existsSync(pdfPath)){ 
    // Stream the file as a response
    res.sendFile(pdfPath);
  } else {
    // Return a 404 error if the file doesn't exist
    res.status(404).send('File not found');
  }
});

appApi.post('/api/upload-pdf', (req, res) => {
  const uploadedFile = req.files.pdfFile; // Assuming you're using a middleware to handle file uploads

  if (!uploadedFile) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded.' });
  }

  // Define the path where you want to save the PDF file (inside the public/PDF folder)
  const filePath = `C:\\vorneboardapp\\vorneserver\\public\\PDF\\${uploadedFile.name}`;

  // Move the uploaded file to the specified path
  uploadedFile.mv(filePath, (err) => {
    if (err) {
      console.error('Error saving PDF file:', err);
      return res.status(500).json({ success: false, message: 'Failed to save the PDF file.' });
    }

    // File has been successfully uploaded and saved
    res.status(200).json({ success: true, message: 'PDF file uploaded and saved successfully.' });
  });
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

appSql.post('/api/updatepin', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const query =`update [Users] set 
    [pin]=${requestData.pin},
    [pinchange]=0  
    where username = '${requestData.username}'`;
    const result = await sql.query(query)
    if (result) {
      res.json({ pinupdated: true });
    } else {
      res.json({ pinupdated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.post('/api/updatepassword', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const query =`update [Users] set 
    [password]='${requestData.passworddata.confimpassword}',
    [passwordchange]=0  
    where username = '${requestData.passworddata.username}'`;
    const result = await sql.query(query)
    if (result) {
      res.json({ passupdated: true });
    } else {
      res.json({ passupdated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.post('/api/getuserdata', async (req, res) => {
  try {
    await sql.connect(config);
    const { username } = req.body;

    const result = await sql.query`SELECT * FROM Users WHERE username = ${username}`;
    if (result.recordset.length > 0) {
      res.json(result);
    } else {
      res.json('error');
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
    const { username,password,first_name,last_name,email,guest,passwordchange,admin,superadmin,pin, pinchange } = req.body;
    const result = await sql.query`INSERT INTO Users ([username],[password],[first_name],[last_name],[pin],[email],[admin],[superadmin],[guest],[passwordchange],[pinchange])VALUES(${username},${password},${first_name},${last_name},${pin},${email},${admin},${superadmin},${guest},${passwordchange}, ${pinchange})`;
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

appSql.delete('/api/deleteuser', async (req, res) => {
  try {
    await sql.connect(config);
    const { userid } = req.body; // Get the lineid from the URL parameter
    const result = await sql.query`delete from [Users] where [userid] = ${userid}`;
    
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

appSql.post('/api/updateuser', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const result = await sql.query`update [users] set 
    [username]=${requestData.username}, 
    [password]=${requestData.password}, 
    [first_name]=${requestData.first_name},
    [last_name]=${requestData.last_name}, 
    [pin]=${requestData.pin},
    [email]=${requestData.email}, 
    [admin]=${requestData.admin}, 
    [superadmin]=${requestData.superadmin}, 
    [guest]=${requestData.guest}, 
    [passwordchange]=${requestData.passwordchange}, 
    [pinchange]=${requestData.pinchange}  
    where userid = ${requestData.userid}`;
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

appSql.post('/api/insertnewpartpartpdf', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    // Create an array of parameter names and values

    // Construct the parameterized query
    const query = `
    insert into partpdf (linename, part_id, pdf_id, pdfname) 
    values ('${requestData.Linename}', '${requestData.Part_ID}', '1', 'No PDF Assigned')`;
    // Execute the query with parameters
    const result = await sql.query(query);

    if (result) {
      res.json({ addedpartpdf: true });
    } else {
      res.json({ addedpartpdf: false });
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
        [Part_ID] [nvarchar](24) NULL,
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

appSql.post('/api/updatepartpdfpartnumber', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;

    const query = `UPDATE [partpdf]
    SET [Part_ID] = '${requestData.Part_ID}'
  WHERE [Part_ID] = '${requestData.oldPart_ID}'
   and [linename] = '${requestData.Linename}'`;
  const result = await sql.query(query)
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
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

appSql.delete('/api/deletepartnumber', async (req, res) => {
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
appSql.delete('/api/deletepartpdf', async (req, res) => {
  try {
      await sql.connect(config);
      //const part_id = req.params.part_id; // Get the part_id from the URL parameter
      const { linename, id } = req.body; // Get the linename from the request body
      const query=`DELETE FROM [partpdf] WHERE [part_id] = '${id}' 
      and [linename] = '${linename}'`
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

appSql.get('/api/getusers', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query`select * from Users order by last_name asc`;
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

appSql.post('/api/checkusername', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const query = `select [username], [first_name], [last_name], [userid] from Users where [username] = '${requestData.username}'`
    const result = await sql.query(query);
    if (result) {
      res.json({ result, checked: true });
    } else {
      res.json({ result, checked: false });
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

    const query = `select [${linename}].*, partpdf.pdfname from [${linename}] 
    inner join partpdf on [${linename}].Part_ID = partpdf.part_id
     where partpdf.linename= '${linename}' 
     order by [${linename}].Part_ID`;
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

appSql.get('/api/getalllinepartnumbers', async (req, res) => {
  try {
    await sql.connect(config);
    const query = `select * from partpdf order by linename asc`
    const result = await sql.query(query);
    if (result) {
      res.json({ result });
    } else {
      res.json({ result });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.get('/api/getlinepartnumberspdf', async (req, res) => {
  const { linename } = req.query;

  try {
    const pool = await sql.connect(config);
    const request = pool.request(); // Create a request object from the connection pool

    const query = `select * from partpdf where linename = '${linename}' order by Part_id`;
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

appSql.get('/api/getpdfs', async (req, res) => {
  try {
    await sql.connect(config);
    const query = `select * from pdfs order by pdfname asc`
    const result = await sql.query(query);
    if (result) {
      res.json({ result });
    } else {
      res.json({ result });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.post('/api/insertpdf', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const result = await sql.query`INSERT INTO pdfs ([pdfname])VALUES(${requestData.pdfname})`;
    if (result) {
      res.json({ pdfadded: true });
    } else {
      res.json({ pdfadded: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.delete('/api/delete-pdf/:pdfName', async (req, res) => {
  try {
    const pdfNameToDelete = req.params.pdfName;
    await sql.connect(config);

    // First, delete the SQL entry
    const deleteResult = await sql.query`DELETE FROM pdfs WHERE pdfname = ${pdfNameToDelete}`;

    if (deleteResult.rowsAffected[0] > 0) {
      // SQL entry deleted successfully

      // Next, delete the file from the server-side folder
      const filePath = `C:\\vorneboardapp\\vorneserver\\public\\PDF\\${pdfNameToDelete}.pdf`;
      fs.unlinkSync(filePath); // Delete the file synchronously

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

appSql.post('/api/changelinkedpdfAll', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const query = `update partpdf set [pdf_id] =${requestData.pdf_id},[pdfname] = '${requestData.pdfname}' where part_id = '${requestData.part_id}'`;
    const result = await sql.query(query)
    if (result) {
      res.json({ pdfupdated: true });
    } else {
      res.json({ pdfupdated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

appSql.post('/api/changelinkedpdfOne', async (req, res) => {
  try {
    await sql.connect(config);
    const requestData = req.body;
    const query = `update partpdf set [pdf_id] =${requestData.pdf_id},[pdfname] = '${requestData.pdfname}' where part_id = '${requestData.part_id}' and linename = '${requestData.linename}'`;
    const result = await sql.query(query)
    if (result) {
      res.json({ pdfupdated: true });
    } else {
      res.json({ pdfupdated: false });
    }

    sql.close();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



