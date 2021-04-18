import { h, createContext  } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { generateContextTree } from '../utils/utils';
import { ConnectionContext } from './ConnectionContext';

export const DataContext = createContext();

const DataContextProvider = ({ children }) => {

    const { getConnection } = useContext(ConnectionContext);

    const [contexts, setContextsRaw] = useState([]);

    const setContexts = (contextList) => {
        // Link all children and parents by their IDs
        generateContextTree(contextList);
        // Update the context
        setContextsRaw(contextList);
    }

    const refreshContexts = async () => {
        let connection = await getConnection();
        // TEMP
        let tabId = chrome.devtools.inspectedWindow.tabId;
        let pageContexts = await connection.analysePage(tabId);

        setContexts(pageContexts);
    }

    const cleanContexts = () => {
        setContexts([]);
    }
    
    const getPageFrames = async () => {
        let connection = await getConnection();
        let tabId = chrome.devtools.inspectedWindow.tabId;
        return await connection.getPageFramesSources(tabId);
    }

    return (
        <DataContext.Provider value={{contexts, refreshContexts, cleanContexts, getPageFrames}}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContextProvider;