import { h, createContext } from 'preact';
import { useState } from 'preact/hooks';
import { BackgroundScript } from '@andreadev/bg-script';

export const ConnectionContext = createContext();

let bgScript = null;

const ConnectionContextProvider = ({ scriptId, context, children }) => {

    let [shouldUpdate, rawSetShouldUpdate] = useState(false);

    // I did this because I didn't felt like passing the state update function to the library (I thought it could cause problems)
    const setShouldUpdate = (value) => {
        rawSetShouldUpdate(value);
    }

    if (bgScript == null) {
        bgScript = new BackgroundScript(scriptId, { setShouldUpdate }, { context });
    }

    const getConnection = async () => {
        return await bgScript.getConnection();
    }

    return (
        <ConnectionContext.Provider value={{ getConnection, shouldUpdate, setShouldUpdate }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export default ConnectionContextProvider;