import { app, BrowserWindow, session, desktopCapturer, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

let currentConnectionMode: string = 'browse';
let currentCastSource: any = null; // Default connection mode

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('set-connection-mode', (event, mode: string) => {
    currentConnectionMode = mode;
    console.log(`Set connection mode to ${mode}`);
    // Here you can add any additional logic needed to handle the connection mode change

    return { success: true };
  });

  ipcMain.handle('get-sources', async (event, types: string[]) => {
    console.log(`Getting sources of types: ${types.join(', ')}`);
    const sources = await desktopCapturer.getSources({ types: types as any });
    // Map sources to a simpler format to send back to renderer
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL() // Convert thumbnail to data URL for easier use in renderer
    }));
  });

  ipcMain.handle('set-cast-source-id', (event, sourceId: string) => {
    console.log(`Received request to set cast source ID: ${sourceId}`);
    // Here you can store the selected source ID in a variable or use it as needed
    // For example, you could save it to a global variable or pass it to the peer connection logic
    desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
      // Grant access to the first screen found.
        sources.forEach(source => {
          console.log(`Available source: ${source.name} with ID ${source.id}`);
        });
        const selectedSource = sources.find(source => source.id === sourceId);
        if (selectedSource) {
          console.log(`Selected source found: ${selectedSource.name}`);
          currentCastSource = selectedSource;
          // You can now use selectedSource to establish the peer connection or for other logic
        } else {
          console.warn(`Source with ID ${sourceId} not found among available sources.`);
        }
    })
    return { success: true };
  });

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    console.log(`Display media requested, current mode: ${currentConnectionMode}`);

    // Control mode: Auto-select first screen
    if (currentConnectionMode === 'control') {
      desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
        // Grant access to the first screen found.
        callback({ video: sources[0], audio: 'loopback' })
      })
    } else if (currentConnectionMode === 'cast') {
      // Cast mode: Use system picker
      desktopCapturer.getSources({ types: ['screen', 'window'] }).then((sources) => {
        // Let user choose, we need to return the sources for the picker
        // Actually, for useSystemPicker, we just need to call callback with empty/undefined
        // to let the system picker handle it
        if (currentCastSource) {
          console.log(`selected cast source: ${currentCastSource.name}`);
          callback({ video: currentCastSource, audio: 'loopback' });
        } else {
          console.log('No cast source selected yet, casting entire screen by default');
          callback({ video: sources[0], audio: 'loopback' });
        }
        
      });
    }
    // Browse mode: getDisplayMedia won't be called at all
  }, { useSystemPicker: true }); // Always use system picker, we control behavior in the handler

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q. I've changed that..
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Allow localhost and local network IPs with self-signed certificates
  const isLocal = url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('192.168.0.238') ||
    url.includes('192.168.1.104') ||
    /^https?:\/\/(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(url);

  if (isLocal) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

app.commandLine.appendSwitch('max-gum-fps', '60');
app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage', '100');