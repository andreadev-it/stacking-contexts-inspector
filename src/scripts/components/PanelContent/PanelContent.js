import { h, Fragment } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { DataContext } from '../DataContext';
import OptionBar from '../OptionBar/OptionBar';
import OptionBarButton from '../OptionBarButton/OptionBarButton';
import ContextsTree from '../ContextsTree/ContextsTree';
import Sidepane from '../Sidepane/Sidepane';
import RefreshIcon from '../../../icons/refresh.svg';

import styles from "./PanelContent.scss";

const PanelContent = () => {

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
            </OptionBar>
            <ContextsTree id={styles.panelTree} contexts={contexts} onSelectContext={(context) => setSelectedContext(context)} />
            <Sidepane id={styles.panelSidepane} context={selectedContext} />
        </div>
    );
}

export default PanelContent;