import { h, createContext  } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { ConnectionContext } from './ConnectionContext';

export const SettingsContext = createContext();

const SettingsContextProvider = ({ children }) => {

    const { getConnection } = useContext(ConnectionContext);

    const [settings, updateSettings] = useState(null);

    const loadSettings = async function () {
        let connection = await getConnection();
        let loadedSettings = await connection.loadExtensionSettings();
        updateSettings(loadedSettings);
    }

    const saveSettings = async function (settings) {
        console.log("New settings: ", settings);
        let connection = await getConnection();
        await connection.saveExtensionSettings(settings);
        updateSettings(await connection.loadExtensionSettings()); // debug: is this really needed?
    }

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