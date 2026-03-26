// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  setConnectionMode: (mode: string) => ipcRenderer.invoke('set-connection-mode', mode),
  getSources: (types: string[]) => ipcRenderer.invoke('get-sources', types),
  setCastSourceId: (sourceId: string) => ipcRenderer.invoke('set-cast-source-id', sourceId)
});
