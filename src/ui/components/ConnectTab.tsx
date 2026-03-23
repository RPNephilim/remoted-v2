import { useContext, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import './css/ConnectTab.css';
import FolderIcon from '@mui/icons-material/Folder';
import AirplayIcon from '@mui/icons-material/Airplay';
import CastConnectedIcon from '@mui/icons-material/CastConnected';
import { establishPeerConnection } from "../peerconnection/PeerConnectionService";


function ConnectTab(props: any) {
    const { getUser } = useContext(UserContext)!;
    const user = getUser();
    const devices = user?.devices || [];
    const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
    const peerConnectionContext = useContext(PeerConnectionContext)!;
    const { getConnection, updateConnection } = peerConnectionContext;
    const connection = getConnection();
    const userId = connection.userId;

    const confirmDeviceSelection = (deviceName: string) => {
        if (deviceName) {
            console.log("Confirmed device selection: ", deviceName);
            setSelectedDevice(deviceName);
            updateConnection({ peerId: deviceName });
            props.setViewportStatus('peer-selected');
        } else {
            console.warn("No device selected!");
        }
    }

    const modeIconStyle = {
        fontSize: '4rem',
        color: '#ffffff',
        '&:hover': {
            color: 'rgb(160, 160, 160)',
            cursor: 'pointer'
        }
    };

    const connectWithPeer = (mode: string) => {
        // Logic to establish peer connection goes here
        console.log("Establishing peer connection with: ", selectedDevice, " in mode: ", mode);
        updateConnection({ connectionMode: mode });
        establishPeerConnection(peerConnectionContext);
    }

    return (
        <div className="connect-tab-div">
            { (props.viewportStatus === 'select-peer' || props.viewportStatus === 'peer-selected') && <List sx={{ color: '#ffffff', backgroundColor: '#4d4d4d', width: '100%', overflow: 'hidden' }}>
                {devices.filter((device: any) => device.deviceName !== userId).map((device: any) => (
                    /* 1. Use ( ) instead of { } for an implicit return */
                    <ListItem key={device.deviceName} disablePadding>
                        <ListItemButton
                            selected={selectedDevice === device.deviceName}
                            sx={{
                                width: '100%',
                                '&:hover': {
                                    backgroundColor: 'rgb(160, 160, 160)',
                                    '& .MuiTypography-root': { color: '#000000' }
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#ffffff !important', // Stay white
                                    '& .MuiTypography-root': { color: '#000000' }, // Stay black text
                                }
                            }}
                            onClick={() => confirmDeviceSelection(device.deviceName)}
                        >
                            <ListItemText primary={device.deviceName} sx={{ width:'100%', textAlign: 'center' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>}
            { props.viewportStatus === 'select-mode' && <div className="mode-select-div">
                <div><FolderIcon sx={modeIconStyle} onClick={() => connectWithPeer('browse')}/> Browse</div>
                <div><AirplayIcon sx={modeIconStyle} onClick={() => connectWithPeer('control')}/> Control</div>
                <div><CastConnectedIcon sx={modeIconStyle} onClick={() => connectWithPeer('cast')}/> Cast</div>
            </div>}
        </div>
    );
}   

export default ConnectTab;