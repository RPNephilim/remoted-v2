import properties from '../data/properties.json'

export const activateDevice = async (username: string, deviceName: string) => {
    const payload = {
        username: username,
        deviceName: deviceName
    }
    const setDeviceUrl = properties.serverBaseUrl + properties.selectDevicePath;
    try {
        const response = await fetch(setDeviceUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Error while activating device", error);
    }
}

export const deactivateDevice = async (username: string, deviceName: string) => {
    const payload = {
        username: username,
        deviceName: deviceName
    }
    const deactivateDeviceUrl = properties.serverBaseUrl + properties.deactivateDevicePath;
    try {
        const response = await fetch(deactivateDeviceUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Error while deactivating device", error);
    }
}