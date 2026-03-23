import { ConnectionState } from '../data/ConnectionState';
import properties from '../data/properties.json';
import { establishBrowseConnection } from './BrowseModeUtil';
import { establishCastConnection } from './CastModeUtil';
import { establishControlConnection } from './ControlModeUtil';

declare global {
    interface Window {
        electronAPI?: {
            setConnectionMode: (mode: string) => Promise<any>;
        };
    }
}


// Establish a connection with the signaling server and register the user
export const registerUser = (context: any) => {
    const { getConnection, updateConnection } = context;
    const connection = getConnection();
    const signalingServerUrl = properties.signalingServerUrl;
    const serverConnection = new WebSocket(signalingServerUrl);

    serverConnection.onopen = () => {
        console.log('Connected to signaling server');
        updateConnection({ serverConnection: serverConnection, connectionState: ConnectionState.USER_CONNECTED });
        console.log('serverConnection updated with WebSocket connection');
        // Send a registration message to the signaling server with the user ID
        const registrationMessage = {
            type: 'register',
            from: connection.userId
        };
        serverConnection.send(JSON.stringify(registrationMessage));
        console.log('Sent registration message to signaling server:', registrationMessage);
    };

    serverConnection.onmessage = async (message) => {
        const response = JSON.parse(message.data);
        console.log('Received message from signaling server:', response);

        if (response.type === 'offer') {
            await handleOffer(response, context);
        } else if (response.type === 'answer') {
            await handleAnswer(response, context);
        } else if (response.type === 'ice-candidate') {
            await handleIceCandidate(response, context);
        } else if (response.type === 'peer-registered') {
            console.log("Successfully registered Peer!!!");
        }
    };

    serverConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

}

export const establishPeerConnection = async (context: any) => {
    const { getConnection } = context;
    const connection = getConnection();
    const { peerId, connectionMode } = connection;

    console.log(`Establishing connection with peer ${peerId}, in mode ${connectionMode}`);
    switch (connectionMode) {
        case "browse":
            // Handle browse mode specific logic
            await establishBrowseConnection(context);
            break;
        case "control":
            // Handle control mode specific logic
            await establishControlConnection(context);
            break;
        case "cast":
            // Handle cast mode specific logic
            await establishCastConnection(context);
            break;
    }
}

const handleOffer = async (message: any, context: any) => {
    console.log('Received offer:', message.data);

    const { getConnection, updateConnection } = context;
    const connection = getConnection();

    // Initial offer - create new peer connection
    console.log('Handling initial offer');

    // Set the target peer ID to the peer who sent the offer
    updateConnection({ peerId: message.from });

    // Navigate to cast page (using window location to trigger route change)
    // window.location.hash = '/cast';

    const peerConnection = new RTCPeerConnection(properties.configuration);
    updateConnection({ peerConnection: peerConnection });

    console.log('Created RTCPeerConnection for incoming offer');

    peerConnection.onicecandidate = (event) => {
        if (event.candidate && connection.serverConnection) {
            const response = {
                type: 'ice-candidate',
                from: connection.userId,
                to: message.from,
                data: event.candidate
            };
            connection.serverConnection.send(JSON.stringify(response));
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log('Peer connection state changed:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            // setStatus('Peers connected!');
            console.log('Peers connected!');
            updateConnection({ connectionState: 'cast-receive' });
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('🎥 [handleOffer] Received remote track:', event.track.kind, 'from stream:', event.streams[0].id);
        console.log('Stream track count:', event.streams[0].getTracks().length);
        updateConnection({ remoteStream: event.streams[0] });
        updateConnection({ connectionState: 'cast-receive' });
    }

    peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onopen = () => {
            console.log('Data channel is open');
            updateConnection({ dataChannel: dataChannel });
        };
        dataChannel.onclose = () => {
            console.warn('⚠️ Data channel CLOSED');
        };
        dataChannel.onerror = (error) => {
            console.error('❌ Data channel ERROR:', error);
        };
        dataChannel.onmessage = (event) => {
            console.log('[Responder] Received message:', event.data);
        };
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log('Created and set local description with answer');

    // Send the answer back to the offering peer
    console.log('Sending answer back to peer: ', message.from);
    if (connection.serverConnection) {
        const payload = {
            type: 'answer',
            from: connection.userId,
            to: message.from,
            data: answer
        };
        connection.serverConnection.send(JSON.stringify(payload));
        console.log('Sent answer back to offering peer');
    } else {
        console.error('No connection to signaling server');
    }

}
const handleAnswer = async (message: any, context: any) => {
    const { getConnection } = context;
    const connection = getConnection();
    const peerConnection = connection.peerConnection;
    console.log('Received answer:', message.data);
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));

    }
}

const handleIceCandidate = async (message: any, context: any) => {
    const { getConnection } = context;
    const connection = getConnection();
    const peerConnection = connection.peerConnection;
    console.log('Received ICE candidate:', message.data);
    if (peerConnection && message.data) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
}
