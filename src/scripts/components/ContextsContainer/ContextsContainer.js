import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { ConnectionContext } from '../ConnectionContext';

import styles from "./ContextsContainer.scss";

const ContextsContainer = ({container, noHighlight, delegatedClass, ...props}) => {

    let tabId = chrome.devtools.inspectedWindow.tabId;
    let { getConnection } = useContext(ConnectionContext);


    let highlightNode = async () => {
        if (noHighlight) return;

        let connection = await getConnection();
        await connection.highlightContext(tabId, container.id);
    }

    let cancelHighlight = async () => {
        if (noHighlight) return;
        
        let connection = await getConnection();
        await connection.undoHighlightContext(tabId);
    }

    let classes = `${styles.contextsContainer} ${delegatedClass}`;

    return (
        <div
            className={classes}
            onMouseEnter={() => highlightNode()}
            onMouseLeave={() => cancelHighlight()}
            {...props}
        >
            {container.name}
        </div>
    );
}

export default ContextsContainer;