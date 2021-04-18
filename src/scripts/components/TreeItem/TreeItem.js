import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { ConnectionContext } from '../ConnectionContext';
import Context from '../Context/Context';
import ContextsContainer from '../ContextsContainer/ContextsContainer';
import { isValuableContainer } from '../../utils/utils';

import styles from "./TreeItem.scss";

const TreeItem = ({context, depth, isVisible, onToggle, ...props}) => {

    let {getConnection} = useContext(ConnectionContext);
    let tabId = chrome.devtools.inspectedWindow.tabId;
    let isContainer = context.type == "container";

    let highlightContext = async () => {
        let conn = await getConnection();
        await conn.highlightContext(tabId, context.id);
    } 

    let undoHighlightContext = async () => {
        let conn = await getConnection();
        await conn.undoHighlightContext(tabId);
    }

    let shouldShowToggle = () => {
        return isValuableContainer(context);
    }

    return (
        <div
            className={styles.treeItem}
            style={{
                paddingLeft: ((depth + 1) * 20) + "px",
                display: (isVisible) ? 'block' : 'none'
            }}
            onMouseEnter={() => highlightContext()}
            onMouseLeave={() => undoHighlightContext()}
            {...props}
        >
            {
                shouldShowToggle() && (
                    <div className={styles.contextToggle} onClick={() => onToggle(context)}>
                        <span className={styles.contextToggleIcon}></span>
                    </div>
                )
            }
            {
                isContainer && (
                    <ContextsContainer delegatedClass={styles.treeItemContext} container={context} noHighlight={true} />
                )
            }
            {
                !isContainer && (
                    <Context delegatedClass={styles.treeItemContext} context={context} noHighlight={true} />
                )
            }
        </div>
    );
}

export default TreeItem;