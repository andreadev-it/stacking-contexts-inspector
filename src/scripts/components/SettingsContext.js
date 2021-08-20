import { h, createContext  } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { ConnectionContext } from './ConnectionContext';

export const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {

    const {
        getConnection,
        shouldUpdateSettings,
        setShouldUpdateSettings
    } = useContext(ConnectionContext);

    const [settings, updateSettings] = useState(null);

    const loadSettings = async function () {
        let connection = await getConnection();
        let loadedSettings = await connection.loadExtensionSettings();
        updateSettings(loadedSettings);
        setShouldUpdateSettings(false);
    }

    const saveSettings = async function (settings) {
        let connection = await getConnection();
        await connection.saveExtensionSettings(settings);
        await connection.notifySettingsChanged(chrome.devtools.inspectedWindow.tabId);
    }

    // Initialization and auto updating when needed
    useEffect(() => {
        if (shouldUpdateSettings)
            loadSettings();
    }, [shouldUpdateSettings]);
    

    if (settings == null) {
        loadSettings();
    }

    return (
        <SettingsContext.Provider value={{settings, loadSettings, saveSettings}}>
            {children}
        </SettingsContext.Provider>
    )
}

export default SettingsContextProvider;