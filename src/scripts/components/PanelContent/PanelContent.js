import { h, Fragment } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { DataContext } from '../DataContext';
import { ConnectionContext } from '../ConnectionContext';
import { SettingsContext } from '../SettingsContext';
import OptionBar from '../OptionBar/OptionBar';
import OptionBarButton from '../OptionBarButton/OptionBarButton';
import OptionBarLabel from '../OptionBarLabel/OptionBarLabel';
import OptionBarSpacer from '../OptionBarSpacer/OptionBarSpacer';
import ContextsTree from '../ContextsTree/ContextsTree';
import Sidepane from '../Sidepane/Sidepane';
import PanelSettings from '../PanelSettings/PanelSettings';

import RefreshIcon from '../../../icons/refresh.svg';
import WarningIcon from '../../../icons/warning.svg';
import SettingsIcon from '../../../icons/settings.svg';
import styles from "./PanelContent.scss";

const PanelContent = () => {

    let { shouldUpdate } = useContext(ConnectionContext);
    let { settings } = useContext(SettingsContext);
    let {contexts, refreshContexts, cleanContexts} = useContext(DataContext);
    let [selectedContext, setSelectedContext] = useState(null);
    let [settingsOpen, setSettingsOpen] = useState(false);
    
    let analysePage = async () => {
        setSelectedContext(null);
        await refreshContexts();
    }

    let toggleSettings = () => {
        setSettingsOpen(!settingsOpen);
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
                { shouldUpdate && settings["dom-changed-warning"] && (<OptionBarLabel icon={WarningIcon} text="There were changes in the page" style={{color: '#b8ae00'}} />) }
                <OptionBarSpacer />
                <OptionBarButton icon={SettingsIcon} title="Open settings" data-status={(settingsOpen) ? 'active' : ''} onClick={() => toggleSettings()} />
            </OptionBar>
            <PanelSettings className={(settingsOpen) ? "" : styles.hidden} id={styles.panelSettings} />
            <ContextsTree id={styles.panelTree} contexts={contexts} onSelectContext={(context) => setSelectedContext(context)} />
            <Sidepane id={styles.panelSidepane} context={selectedContext} />
        </div>
    );
}

export default PanelContent;