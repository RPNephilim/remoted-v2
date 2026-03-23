import { Button, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import './css/SessionDeviceSelectPage.css';
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import { useNavigate } from "react-router";
import { registerUser } from "../peerconnection/PeerConnectionService";
import { ConnectionState } from "../data/ConnectionState";
import React from "react";

function SessionDeviceSelectPage() {
    const { getUser } = useContext(UserContext)!;
    const peerConnectionContext = useContext(PeerConnectionContext)!;
    const { getConnection, updateConnection } = peerConnectionContext;
    const user = getUser();
    const devices = user?.devices || [];
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const navigate = useNavigate();

    const selectSessionDevice = (deviceName: string) => {
        setSelectedDevice(deviceName);
        console.log("Selected device: ", deviceName);
    }

    const confirmDeviceSelection = async () => {
        if (selectedDevice) {
            console.log("Confirmed device selection: ", selectedDevice);
            updateConnection({ userId: selectedDevice });
            registerUser(peerConnectionContext);
        } else {
            console.warn("No device selected!");
        }
    }

    useEffect(() => {
        const connection = getConnection();
        if (connection.connectionState === ConnectionState.USER_CONNECTED) {
            navigate('/dashboard');
        }
    }, [getConnection().connectionState]);

    return (
        <div className="session-device-select-page-div">
            <List sx={{ color: '#ffffff', backgroundColor: '#4d4d4d', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
                {devices.map((device: any) => (
                    /* 1. Use ( ) instead of { } for an implicit return */
                    <ListItem key={device.deviceName} disablePadding>
                        <ListItemButton
                            selected={selectedDevice === device.deviceName}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgb(160, 160, 160)',
                                    '& .MuiTypography-root': { color: '#000000' }
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#ffffff !important', // Stay white
                                    '& .MuiTypography-root': { color: '#000000' }, // Stay black text
                                }
                            }}
                            onClick={() => selectSessionDevice(device.deviceName)}
                        >
                            <ListItemText primary={device.deviceName} sx={{ textAlign: 'center' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <br />
            <Button variant="contained" onClick={() => confirmDeviceSelection()} sx={{
                width: '8%'
            }}>OK</Button>
        </div>
    );
}

export default SessionDeviceSelectPage;