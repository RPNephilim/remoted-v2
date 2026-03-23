import { useContext } from 'react';
import './css/SessionDeviceBar.css';
import { PeerConnectionContext } from '../contexts/PeerConnectionContext';
import { ConnectionState } from '../data/ConnectionState';

function SessionDeviceBar() {
    const { getConnection } = useContext(PeerConnectionContext)!;
    const connection = getConnection();
    return (
        <div className="session-device-bar-div">
            <h1>Current Session Device: {connection.userId}</h1>
            {connection.peerId && connection.connectionState === ConnectionState.USER_CONNECTED ? <h1>Connecting Peer: {connection.peerId}</h1> : <h1>No Peer Connected</h1>}
        </div>
    );
}

export default SessionDeviceBar;