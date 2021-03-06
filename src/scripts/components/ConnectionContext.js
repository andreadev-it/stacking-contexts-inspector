import { h, createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { BackgroundScript } from '@andreadev/bg-script';

export const ConnectionContext = createContext();

let bgScript = null;

async function notifyVisibilityChange(status) {
    let isActive = status ?? !document.hidden;

    let connection = await bgScript.getConnection();
    let tabId = chrome.devtools.inspectedWindow.tabId;
    await connection.updateDevtoolsPageStatus(tabId, bgScript.scriptId, isActive);
}

const ConnectionContextProvider = ({ scriptId, context, children }) => {

    let [shouldUpdate, rawSetShouldUpdate] = useState(false);
    let [shouldUpdateSettings, rawSetShouldUpdateSettings] = useState(true);

    // I did this because I didn't felt like passing the state update function to the library (I thought it could cause problems)
    const setShouldUpdate = (value) => {
        rawSetShouldUpdate(value);
    }

    const setShouldUpdateSettings = (value) => {
        rawSetShouldUpdateSettings(value);
    }

    const getConnection = async () => {
        return await bgScript.getConnection();
    }

    if (bgScript == null) {
        // Init the Background Script handler
        bgScript = new BackgroundScript(scriptId, { setShouldUpdate, setShouldUpdateSettings }, { context });
        // Add the visibilitychange event listener and immediatly notify the current status
        window.addEventListener("visibilitychange", () => notifyVisibilityChange());
        // Handle disconnection
        window.addEventListener("unload", () => notifyVisibilityChange(false));
        notifyVisibilityChange();
    }

    let providerValue = {
        getConnection,
        shouldUpdate,
        setShouldUpdate,
        shouldUpdateSettings,
        setShouldUpdateSettings
    }

    return (
        <ConnectionContext.Provider value={providerValue}>
            {children}
        </ConnectionContext.Provider>
    );
}

export default ConnectionContextProvider;