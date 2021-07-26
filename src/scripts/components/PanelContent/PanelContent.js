import { h, Fragment } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { DataContext } from '../DataContext';
import { ConnectionContext } from '../ConnectionContext';
import OptionBar from '../OptionBar/OptionBar';
import OptionBarButton from '../OptionBarButton/OptionBarButton';
import ContextsTree from '../ContextsTree/ContextsTree';
import Sidepane from '../Sidepane/Sidepane';
import RefreshIcon from '../../../icons/refresh.svg';
import WarningIcon from '../../../icons/warning.svg';

import styles from "./PanelContent.scss";
import OptionBarLabel from '../OptionBarLabel/OptionBarLabel';

const PanelContent = () => {

    let { shouldUpdate } = useContext(ConnectionContext);
    let {contexts, refreshContexts, cleanContexts} = useContext(DataContext);
    let [selectedContext, setSelectedContext] = useState(null);
    
    let analysePage = async () => {
        setSelectedContext(null);
        await refreshContexts();
    }

    useEffect( async () => {
        await analysePage();

        chrome.devtools.network.onNavigated.addListener(refreshContexts);

        return () => {
            chrome.devtools.network.onNavigated.removeListener(refreshContexts);
        }
    }, []);

    return (
        <div id={styles.panelRoot}>
            <OptionBar id={styles.panelMenu}>
                <OptionBarButton icon={RefreshIcon} title="Re-analyse page" onClick={() => analysePage()} />
                { shouldUpdate && (<OptionBarLabel icon={WarningIcon} text="There were changes in the page" style={{color: '#b8ae00'}} />) }
            </OptionBar>
            <ContextsTree id={styles.panelTree} contexts={contexts} onSelectContext={(context) => setSelectedContext(context)} />
            <Sidepane id={styles.panelSidepane} context={selectedContext} />
        </div>
    );
}

export default PanelContent;