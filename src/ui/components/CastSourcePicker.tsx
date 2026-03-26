import { useContext, useEffect, useState } from "react";
import { PeerConnectionContext } from "../contexts/PeerConnectionContext";
import Card from '@mui/material/Card';
import './css/CastSourcePicker.css';
import { establishPeerConnection } from "../peerconnection/PeerConnectionService";


function CastSourcePicker(props: any) {
    const peerConnectionContext = useContext(PeerConnectionContext)!;
    const { getConnection, updateConnection } = peerConnectionContext;
    const connection = getConnection();
    const [sources, setSources] = useState<any[]>([]);

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.getSources(['screen', 'window']).then((fetchedSources) => {
                setSources(fetchedSources);
            });
        }
    }, []);

    const chooseCastSource = async (sourceId: string) => {
        console.log(`Chosen source ID: ${sourceId}`);
        updateConnection({ castModeSourceId: sourceId, connectionMode: 'cast' });
        establishPeerConnection(peerConnectionContext);
        props.setViewportStatus('casting');
    };

    return (
        <>
            {props.open && (
                <div className="cast-source-picker-div">
                    <h2>Choose source to cast:</h2>

                    <div className="cast-source-options">
                        {sources.map((source) => (
                            <Card
                                key={source.id}
                                className="source-card"
                                onClick={() => chooseCastSource(source.id)}
                                elevation={3} // Adds a nice shadow
                            >
                                <p title={source.name}>{source.name}</p>
                                <img
                                    src={source.thumbnail}
                                    alt={source.name}
                                    className="source-thumbnail"
                                />
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default CastSourcePicker;