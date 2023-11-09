import React, { createContext, useContext } from 'react';
import Axios from 'axios';

const Errorlogcontext = createContext();

export const useErrorlogcontext = () => {
    return useContext(Errorlogcontext)
}

const ErrorlogcontextProvider = ({ children }) => {
    const Geterrorlog = async (localipaddr) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/Geterrorlog`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Request failed:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const Fetchlines = async (errordata, localipaddr) => {
        try {
            const response = await fetch(`http://${localipaddr}:1435/api/getlines`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(),
            });
  
            const data = await response.json();
            if (data && data.result && data.result.recordset) {
                const linesData = [];
                const failedLinesData = [];
                const promises = data.result.recordset.map(async (record) => {
                    try {
                        const updateddata = await Axios.get(`http://${record.ipaddress}/rest/cpe/attributes`, { timeout: 500 });
                        let message = `${record.Linename} Connection Failed`;
                        if (updateddata.status === 200) {
                            if (errordata.length === 0) {
                                linesData.push(record);
                            } else {
                                for (let i = 0; i < errordata.length; i++) {
                                    if (message === errordata[i].error_message) {
                                        Deleteerrorlog(errordata[i].error_id, localipaddr);
                                        break; // Added break statement here
                                    } 
                                }
                                linesData.push(record);
                            }
                        } else {
                            failedLinesData.push(record);
                            let edata = [
                                {
                                    error_message: message,
                                    error_type: 'connection',
                                },
                            ];
                            if (errordata.length === 0) {
                                Inserterrorlog(edata, localipaddr);
                            } else {
                                let found = false;
                                for (let i = 0; i < errordata.length; i++) {
                                    if (message !== errordata[i].error_message) {
                                        if (i === errordata.length - 1) {
                                            Inserterrorlog(edata, localipaddr);
                                        }
                                    } else {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    Inserterrorlog(edata, localipaddr);
                                }
                            }
                            console.error(`API Call for ${record.Linename} was unsuccessful with status ${updateddata.status}`);
                        }
                    } catch (error) {
                        failedLinesData.push(record);
                        let message = `${record.Linename} Connection Failed`;
                        let edata = [
                            {
                                error_message: message,
                                error_type: 'connection',
                            },
                        ];
                        if (errordata.length === 0) {
                            console.log(errordata);
                            Inserterrorlog(edata, localipaddr);
                        } else {
                            let found = false;
                            for (let i = 0; i < errordata.length; i++) {
                                if (message !== errordata[i].error_message) {
                                    if (i === errordata.length - 1) {
                                        console.log(errordata);
                                        Inserterrorlog(edata, localipaddr);
                                    }
                                } else {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                console.log(errordata);
                                Inserterrorlog(edata, localipaddr);
                            }
                        }
                        console.error(`API Call for ${record.Linename} failed with error: ${error}`);
                    }
                });
                await Promise.all(promises);
                linesData.sort((a, b) => (a.Linename > b.Linename) ? 1 : -1);
                sessionStorage.setItem('lines', JSON.stringify(linesData));
                if (failedLinesData.length === 0) {
                    for (let i = 0; i < errordata.length; i++) {
                        if(errordata[i].error_type === 'connection'){
                            await Deleteerrorlog(errordata[i].error_id, localipaddr);
                        }
                    }
                }
                sessionStorage.setItem('failedLines', JSON.stringify(failedLinesData));
                Geterrorlog(localipaddr)
                return linesData;
                //setlines(linesData);
            } else {
                console.log("No data or recordset in the response");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const Inserterrorlog = async (data, localipaddr) => {
            try {
                // Send a POST request to insert the new part
                const response = await fetch(`http://${localipaddr}:1435/api/Inserterrorlog`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
      
                if (response.ok) {
                    Geterrorlog(localipaddr)
                } else {
                    console.error('Failed to error log');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
      
       const Deleteerrorlog = async (error_id, localipaddr) => {
            try {
                const response = await fetch(`http://${localipaddr}:1435/api/Deleteerrorlog`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ error_id }), // Send linename in the request body
                });
      
                // Handle response
                if (response.ok) {
                    Geterrorlog(localipaddr);
                } else {
                    console.error('Delete failed');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

    return (
        <Errorlogcontext.Provider value={{ Geterrorlog, Fetchlines }}>
            {children}
        </Errorlogcontext.Provider>
    );
}

export default ErrorlogcontextProvider;

/* 
*/