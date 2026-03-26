import { createContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

// 1. Separate the Data Interface from the Setters for clarity
export interface ConnectionData {
    userId: string;
    peerId: string;
    connectionMode: string;
    serverConnection: WebSocket | null;
    peerConnection: RTCPeerConnection | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    dataChannel: RTCDataChannel | null;
    connectionState?: string; // Optional for tracking connection status
    castModeSourceId?: string; // Optional for storing selected source in cast mode
}

export interface PeerConnectionContextType {
    connection: ConnectionData;
    updateConnection: (updates: Partial<ConnectionData>) => void;
    getConnection: () => ConnectionData;
}

const PeerConnectionContext = createContext<PeerConnectionContextType | undefined>(undefined);

// Default initial state
const initialData: ConnectionData = {
    userId: '',
    peerId: '',
    connectionMode: '',
    serverConnection: null,
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    dataChannel: null,
    connectionState: '',
    castModeSourceId: '0' // Default to first source for cast mode
};

const PeerConnectionProvider = ({ children }: { children: ReactNode }) => {
    // Single state object for the connection data
    const [connection, setConnection] = useState<ConnectionData>(initialData);

    // The Ref used for synchronous access (prevents stale values in WebRTC callbacks)
    const connectionRef = useRef<ConnectionData>(connection);

    // Keep the ref in sync with state for standard React renders
    useEffect(() => {
        connectionRef.current = connection;
    }, [connection]);

    /**
     * Updates both Ref (synchronously) and State (asynchronously for UI).
     * Using useCallback to prevent unnecessary re-renders of components using this function.
     */
    const updateConnection = useCallback((updates: Partial<ConnectionData>) => {
        // 1. Update Ref immediately so getConnection() is never stale
        const nextValue = { ...connectionRef.current, ...updates };
        connectionRef.current = nextValue;

        // 2. Trigger React re-render
        setConnection(prev => ({ ...prev, ...updates }));
    }, []);

    // Stable function to always return the latest ref value
    const getConnection = useCallback(() => connectionRef.current, []);

    return (
        <PeerConnectionContext.Provider value={{ connection, updateConnection, getConnection }}>
            {children}
        </PeerConnectionContext.Provider>
    );
};

export { PeerConnectionContext, PeerConnectionProvider };