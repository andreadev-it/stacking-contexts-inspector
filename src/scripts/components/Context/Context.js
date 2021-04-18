import { h } from 'preact';
import { useContext } from 'preact/hooks';
import SVG from '../SVG';
import { ConnectionContext } from '../ConnectionContext';

import InspectIcon from '../../../icons/inspect.svg';
import IntoviewIcon from '../../../icons/intoview.svg';
import styles from "./Context.scss";

const Context = ({context, noHighlight=false, delegatedClass="", ...props}) => {

    let {tagName, id, classes, index} = context.element;
    let tabId = chrome.devtools.inspectedWindow.tabId;

    let { getConnection } = useContext(ConnectionContext);

    let inspectNode = () => {
        chrome.devtools.inspectedWindow.eval(`inspect(document.getElementsByTagName('*')[${index}])`)
    }

    let scrollToNode = async () => {
        let connection = await getConnection();
        await connection.scrollToContext(tabId, context.id);
    }

    let highlightNode = async () => {
        if (noHighlight) return;

        let connection = await getConnection();
        await connection.highlightContext(tabId, context.id);
    }

    let cancelHighlight = async () => {
        if (noHighlight) return;
        
        let connection = await getConnection();
        await connection.undoHighlightContext(tabId);
    }

    let classNames = `${styles.context} ${delegatedClass}`;

    return (
        <div className={classNames} onMouseEnter={() => highlightNode()} onMouseLeave={() => cancelHighlight()} {...props}>
            <div className={styles.contextDescriptor}>
                <span className={styles.contextTag}>{tagName}</span>
                {
                    id && (
                        <span className={styles.contextId}>#{id}</span>
                    )
                }
                {
                    !id && classes && classes.length > 0 && (
                        <span className={styles.contextClasses}>.{classes.join('.')}</span>
                    )
                }
            </div>
            <div className={styles.contextActions}>
                {
                    !context.isInIframe && (
                        <SVG src={InspectIcon} className="inline-icon" title="Inspect element" onClick={ () => inspectNode() } />
                    )
                }
                <SVG src={IntoviewIcon} className="inline-icon" title="Scroll into view" onClick={ () => scrollToNode() } />
            </div>
        </div>
    );
}

export default Context;