import { useContext, useEffect, useState } from "react";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import './css/DashboardPage.css';
import SideBar from "../components/SideBar";
import SessionDeviceBar from "../components/SessionDeviceBar";
import ConnectTab from "../components/ConnectTab";
import { Button } from "@mui/material";
import { ConnectionState } from "../data/ConnectionState";
import { DashboardViewportStatus } from "../data/DashboardViewportStatus";
import { disconnectPeer } from "../peerconnection/PeerConnectionService";


function DashboardPage() {
    const { updateConnection, getConnection } = useContext(PeerConnectionContext)!;
    const [viewport, setViewport] = useState<string>('');
    const [viewportStatus, setViewportStatus] = useState<string>(DashboardViewportStatus.WELCOME);

    const connection = getConnection();

    const attachVideo = (node: HTMLVideoElement | null) => {
        const connection = getConnection(); // Get latest stream
        if (node && connection.remoteStream) {
            node.srcObject = connection.remoteStream;
            console.log('Successfully attached remote stream to video element');

            // Optional: force play if autoplay is blocked
            node.play().catch(e => console.warn("Autoplay prevented:", e));
        }
    };

    const disconnect = () => {
        disconnectPeer({ getConnection });
        
        updateConnection({
            connectionMode: '',
            serverConnection: null,
            peerConnection: null,
            localStream: null,
            remoteStream: null,
            dataChannel: null,
            connectionState: '',
            castModeSourceId: '0'
        });
        console.log("Disconnected from peer and reset connection state");
        setViewportStatus('');
        console.log(`viewport: ${viewport}, viewportStatus: ${viewportStatus}`);
    };

    useEffect(() => {
        if (viewport === 'connect') {
            setViewportStatus('select-peer');
            console.log("Entered connect viewport, set status to select-peer");
        }
    }, [viewport]);



    return (
        <div className="dashboard-page-div">
            <SideBar setViewport={setViewport} viewport={viewport} />
            <div className="dashboard-page-main-div">
                <div className="dashboard-page-main-viewport-div">
                    {viewport === 'connect' && <ConnectTab viewportStatus={viewportStatus} setViewportStatus={setViewportStatus} />}
                    {viewport === 'info' && <h1>Info View</h1>}
                    {viewport === 'account' && <h1>Account View</h1>}
                    {!viewport && connection.connectionState === ConnectionState.CAST_RECEIVE && (
                        <video
                            id="casting-video-element"
                            ref={attachVideo} // <--- React calls this as soon as the tag exists
                            autoPlay
                            playsInline
                            controls
                            style={{ width: '100%', height: 'auto' }}
                        />
                    )}
                    {!viewport && connection.connectionState === ConnectionState.USER_CONNECTED && <h1>Welcome to Remoted!</h1>}
                </div>
                {viewport === 'connect' && viewportStatus === 'peer-selected' && <Button variant="contained" onClick={() => setViewportStatus('select-mode')}>OK</Button>}
                {viewport === 'connect' && viewportStatus === 'select-mode' && <Button variant="contained" onClick={() => setViewportStatus('select-peer')}>Back</Button>}
                {viewport === 'connect' && viewportStatus === 'casting' && <Button variant="contained" color="error" onClick={() => disconnect()}>Disconnect</Button>}
                <SessionDeviceBar />
            </div>

        </div>
    );
}

export default DashboardPage;