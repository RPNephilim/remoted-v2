import { Button, TextField } from "@mui/material";
import './css/SessionDeviceSelectPage.css';
import { use, useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import { useNavigate } from "react-router";
import { registerUser } from "../peerconnection/PeerConnectionService";
import { ConnectionState } from "../data/ConnectionState";
import properties from '../data/properties.json';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { get } from "node:http";

function SessionDeviceSelectPage() {
    const { getUser, updateUser } = useContext(UserContext)!;
    const peerConnectionContext = useContext(PeerConnectionContext)!;
    const { getConnection, updateConnection } = peerConnectionContext;
    const user = getUser();
    const [devices, setDevices] = useState(user?.devices || []);
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const navigate = useNavigate();

    const [addingDevice, setAddingDevice] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');

    const selectSessionDevice = (deviceName: string) => {
        setSelectedDevice(deviceName);
        console.log("Selected device: ", deviceName);
    }

    const confirmDeviceSelection = async () => {
        if (selectedDevice) {
            console.log("Confirmed device selection: ", selectedDevice);

            // update device connection in server
            const payload = {
                username: user?.username,
                deviceName: selectedDevice
            }
            const setDeviceUrl = properties.serverBaseUrl + properties.selectDevicePath;
            try {
                const response = await fetch(setDeviceUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.error("Error while activating device", error);
            }

            updateConnection({ userId: selectedDevice });
            registerUser(peerConnectionContext);
        } else {
            console.warn("No device selected!");
        }
    }


    const addDevice = async () => {
        if (newDeviceName) {
            console.log("Adding new device: ", newDeviceName);
            const payload = {
                username: user?.username,
                deviceName: newDeviceName
            }
            const addDeviceUrl = properties.serverBaseUrl + properties.addDevicePath;
            try {
                const response = await fetch(addDeviceUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                console.log("add device response: ", response);
                if (response.ok) {
                    
                    console.info("Successfully added new device");
                    const deviceResponse = await response.json();
                    updateUser({
                        username: user?.username as string,
                        email: user?.email as string,
                        devices: deviceResponse
                    });
                    setDevices(deviceResponse);
                    setAddingDevice(false);
                } else {
                    console.error("Failed to add device, server responded with status: ", response.status);
                }
            } catch (error) {
                console.error("Error while adding new device", error);
            }
        } else {
            console.warn("Device name cannot be empty!");
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
            {!addingDevice && (
                <div className="device-select-div">
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead className="table-header">
                                <TableRow>
                                    <TableCell className="table-cell">Device Name</TableCell>
                                    <TableCell className="table-cell">Connection Status</TableCell>
                                    <TableCell className="table-cell">Last Used</TableCell>
                                    <TableCell className="table-cell">Date Added</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody className="table-body">
                                {devices.map((device: any) => (
                                    <TableRow hover key={device.deviceName} onClick={() => selectSessionDevice(device.deviceName)} selected={selectedDevice === device.deviceName}>
                                        <TableCell className="table-cell">{device.deviceName}</TableCell>
                                        <TableCell className="table-cell">{device.active ? 'Connected' : 'Available'}</TableCell>
                                        <TableCell className="table-cell">{device.lastUsed}</TableCell>
                                        <TableCell className="table-cell">{device.dateAdded}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                    </TableContainer>

                    <br />
                    <div className="buttons-div">
                        <Button variant="contained" onClick={() => confirmDeviceSelection()} sx={{
                            width: '20%'
                        }}>SELECT</Button>
                        <Button variant="contained" onClick={() => setAddingDevice(true)} sx={{
                            width: '20%'
                        }}>ADD DEVICE</Button>
                    </div>
                </div>
            )}
            {addingDevice && (
                <div className="device-add-div">
                    <TextField className="device-add-input" id="device-name" label="Device Name" variant="standard" onChange={(e) => setNewDeviceName(e.target.value)} /><br />
                    <Button variant="contained" onClick={() => addDevice()} sx={{
                        width: '20%'
                    }}>ADD</Button> <br/>
                    <Button variant="contained" onClick={() => setAddingDevice(false)} sx={{
                        width: '20%'
                    }}>BACK</Button>
                </div>
            )}


        </div>
    );
}

export default SessionDeviceSelectPage;