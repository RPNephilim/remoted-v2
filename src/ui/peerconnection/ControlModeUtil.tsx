import properties from '../data/properties.json';

export const establishControlConnection = async (context: any) => {
    // Implement control mode specific connection logic here
    if (window.electronAPI) {
        await window.electronAPI.setConnectionMode('control');
        console.log('Set connection mode to control in main process');
    } else {
        console.log('Running in browser mode - Electron API not available');
    }
    const { getConnection, updateConnection } = context;
    const connection = getConnection();
    // Call getDisplayMedia FIRST to preserve user gesture chain
    const displayMediaOptions = {
        audio: true,
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60, max: 60 },
            latency: 0
        }
    }
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    console.log('User media selected');

    // Store the local stream so we can stop it later
    updateConnection({ localStream: stream });

    const peerConnection = new RTCPeerConnection(properties.configuration);
    peerConnection.onicecandidate = (event) => {
        if (event.candidate && connection.serverConnection) {
            const message = {
                type: 'ice-candidate',
                from: connection.userId,
                to: connection.peerId,
                data: event.candidate
            };
            connection.serverConnection.send(JSON.stringify(message));
        }
    };

    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
            console.log('Peers connected!');
        }
    };

    peerConnection.ontrack = (event) => {
        console.log('🎥 [connectWithPeer] Received remote track:', event.track.kind, 'from stream:', event.streams[0].id);
        updateConnection({ remoteStream: event.streams[0] });
    };

    const dataChannel = peerConnection.createDataChannel("control");
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
        console.log('[Controller] Received message:', event.data);
        // Execute control commands received from peer
        const command = JSON.parse(event.data);
        if (command.type === 'mouse-move') {
            // Simulate mouse move using robotjs or similar library
            // robot.moveMouse(command.x, command.y);
        } else if (command.type === 'mouse-click') {
            // Simulate mouse click
            // robot.mouseClick(command.button);
        } else if (command.type === 'keyboard-input') {
            // Simulate keyboard input
            // robot.keyTap(command.key);
        }
    };
    updateConnection({ peerConnection: peerConnection });

    // Add tracks with encoding parameters for better quality
    stream.getTracks().forEach(track => {
        const sender = peerConnection!.addTrack(track, stream);

        // Configure encoding parameters for video tracks
        if (track.kind === 'video') {
            (track as any).contentHint = 'motion'; // Hint for screen sharing
            const params = sender.getParameters();
            if (!params.encodings) {
                params.encodings = [{}];
            }
            // Set high bitrate for smooth 1080p60 - adjust based on network
            params.encodings[0].maxBitrate = 8000000; // 8 Mbps
            params.encodings[0].maxFramerate = 60;
            sender.setParameters(params).catch(err => console.error('Error setting encoding params:', err));
        }
    });

    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);
    console.log(`userId: ${connection.userId}, peerId: ${connection.peerId}`)

    if (connection.serverConnection) {
        const payload = {
            type: 'offer',
            from: connection.userId,
            to: connection.peerId,
            data: offer
        }
        connection.serverConnection.send(JSON.stringify(payload));
        console.log('Sent negotiation offer')
        updateConnection({ connectionMode: 'cast-send' });
    }
}