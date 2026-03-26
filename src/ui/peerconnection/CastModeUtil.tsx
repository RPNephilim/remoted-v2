import properties from '../data/properties.json';

export const establishCastConnection = async (context: any) => {
    const { getConnection, updateConnection } = context;
    const connection = getConnection();

    // Set Electron mode if available (non-blocking to preserve user gesture)
    if (window.electronAPI) {
        window.electronAPI.setConnectionMode('cast').then(() => {
            console.log('Set connection mode to cast in main process');
        });

        if (connection.castModeSourceId) {
            window.electronAPI.setCastSourceId(connection.castModeSourceId).then(() => {
                console.log(`Set cast source ID to ${connection.castModeSourceId} in main process`);
            });
        }
    } else {
        console.log('Running in browser mode - Electron API not available');
    }

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