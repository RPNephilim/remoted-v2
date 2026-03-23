import { useContext, useEffect, useState } from "react";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import './css/DashboardPage.css';
import SideBar from "../components/SideBar";
import SessionDeviceBar from "../components/SessionDeviceBar";
import ConnectTab from "../components/ConnectTab";
import { Button } from "@mui/material";
import { ConnectionState } from "../data/ConnectionState";


function DashboardPage() {
    const { getConnection } = useContext(PeerConnectionContext)!;
    const [viewport, setViewport] = useState<string>('');
    const [viewportStatus, setViewportStatus] = useState<string>('');

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


    useEffect(() => {
        if (viewport === 'connect') {
            setViewportStatus('select-peer');
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
                    {!viewport && connection.connectionState === 'cast-receive' && (
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
                <SessionDeviceBar />
            </div>

        </div>
    );
}

export default DashboardPage;