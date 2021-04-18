import { h, createContext } from 'preact';
import { BackgroundScript } from '@andreadev/bg-script';

export const ConnectionContext = createContext();

const ConnectionContextProvider = ({ scriptId, context, children }) => {

    const bgScript = new BackgroundScript(scriptId, {}, { context });

    const getConnection = async () => {
        return await bgScript.getConnection();
    }

    return (
        <ConnectionContext.Provider value={{ getConnection }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export default ConnectionContextProvider;