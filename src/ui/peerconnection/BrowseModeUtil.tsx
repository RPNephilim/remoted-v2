export const establishBrowseConnection = async (context: any) => {
    // Implement browse mode specific connection logic here
    if (window.electronAPI) {
        await window.electronAPI.setConnectionMode('browse');
        console.log('Set connection mode to browse in main process');
    } else {
        console.log('Running in browser mode - Electron API not available');
    }
}