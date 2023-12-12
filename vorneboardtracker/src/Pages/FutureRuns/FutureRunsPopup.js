import React, { useContext, useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import './FutureRuns.css';
import moment from 'moment';
import { linescontext } from '../../contexts/linescontext';
import { ipaddrcontext } from '../../contexts/ipaddrcontext';
import * as ReactBootStrap from 'react-bootstrap';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import FutureRunsEditPopup from './FutureRunsEditPopup';


function FutureRunsPopup({ show, handleClose, handleDelete, title, passeddata }) {
    const { lines, setlines } = useContext(linescontext);
    const [selectedLine, setSelectedLine] = useState(null);
    const { localipaddr } = useContext(ipaddrcontext);
    const [deleteEvent, setdeleteEvent] = useState([])
    const [showFutureEditPopup, setshowFutureEditPopup] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [selectedeventid, setselectedeventid] = useState({
        "event_id": 0,
        "title": "",
        "part": "",
        "start": "",
        "end": "",
        "order": 0,
        "state": 0
    })
    const [data, setData] = useState([
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
    useEffect(() => {
        if (title != null) {
            getfutureruns()
        }
    }, [title]);
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
                const filteredData = data.result.recordset.filter(item => item.title === title);
                setData(filteredData);
            } else {
                console.log('error');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlesave = async () => {
        const changedRows = [];
        // Check for changed rows
        const filteredData = passeddata.filter(item => item.title === title);
        for (let i = 0; i < filteredData.length; i++) {
            const originalRow = filteredData[i];
            const newRow = data.find(row => row.event_id === originalRow.event_id);

            if (newRow && originalRow.order !== newRow.order) {
                changedRows.push(newRow);
            }
        }
        try {
            // Handle changed rows
            const updatePromises = changedRows.map(async (row) => {
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
            const deletePromises = deleteEvent.map(async (row) => {
                const event_id = row.event_id
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
            });

            // Wait for all delete promises to resolve
            await Promise.all(deletePromises);

            NotificationManager.success('Changes saved successfully!');
            handleClose();
        } catch (error) {
            NotificationManager.error('Save failed');
            console.error('Error:', error);
        }
    };

    const handledeleteClick = (row) => {
        const indexToDelete = data.findIndex(item => item.event_id === row.event_id);

        if (indexToDelete !== -1) {
            const updatedData = [...data.slice(0, indexToDelete), ...data.slice(indexToDelete + 1)];

            const deletedRow = data[indexToDelete];

            const updatedDataWithNewOrder = updatedData.map((item, index) => ({
                ...item,
                order: index + 1,
            }));
            setdeleteEvent(prevDeleteEvent => [...prevDeleteEvent, deletedRow]);
            setData(updatedDataWithNewOrder);
        } else {
            console.error("Row not found in data array");
        }
    };

    const handleFutureEditClosed = () => {
        setEditRow(null)
        getfutureruns()
        setshowFutureEditPopup(false);
    };

    const handleFutureEditShow = (row) => {
        setEditRow(row)
    };

    useEffect(() => {
        if (editRow !== null) {
            setshowFutureEditPopup(true);
        }
    }, [editRow]);

    const onDragEnd = (result) => {
        if (!result.destination) return; // Dragged outside the list

        const items = Array.from(data);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the order property based on the new order of rows
        items.forEach((row, index) => {
            row.order = index + 1;
        });

        setData(items);
    };

    return (
        <div className={`Calendar-Popup-modal ${show ? 'show' : ''}`}>
            <FutureRunsEditPopup
                show={showFutureEditPopup}
                handleClose={handleFutureEditClosed}
                data={editRow}
            />
            <div className="Calendar-Popup-modal-popup">
                <div className="Calendar-Popup-modal-header">
                    <h2>{title} Future Runs</h2>
                </div>
                <div className="Calendar-Popup-modal-body">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={`droppable-${title}`} key={title}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {data.map((row, index) => (
                                        <Draggable
                                            key={row.event_id}
                                            draggableId={`draggable-${row.event_id}`}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        color: 'white',
                                                        backgroundColor: snapshot.isDragging ? '#0f1626' : '#262d3b', // Set background color
                                                        marginBottom: '8px',
                                                        left: '15px',
                                                        top: snapshot.isDragging ? `${snapshot.draggingOver === `droppable-${title}` ? snapshot.dragVerticalOffset : 0}px` : `calc(70 * ${index} + 100px)`,
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #ccc' }}>
                                                        <div style={{ cursor: 'move', marginLeft: '8px', flexShrink: 0 }}>&#x2630;</div> {/* Drag handle */}
                                                        <div style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginLeft: '8px' }}>{row.title}</div>
                                                        <div style={{ flex: 1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginLeft: '8px' }}>{row.part}</div>
                                                        <div style={{ flexShrink: 0 }}>
                                                            <Tooltip title="Edit">
                                                                <IconButton color="info" onClick={() => handleFutureEditShow(row)}>
                                                                    <ModeEditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                        <div style={{ flexShrink: 0 }}>
                                                            <Tooltip title="Delete">
                                                                <IconButton color="error" onClick={() => handledeleteClick(row)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
                <div className="Calendar-Popup-modal-footer">
                    <button className="Calendar-Popup-button" onClick={() => handlesave()}>
                        Save
                    </button>
                    <button className="Calendar-Popup-button" onClick={() => handleClose()}>
                        Close
                    </button>
                </div>
            </div>

        </div>
    );
}

export default FutureRunsPopup;
