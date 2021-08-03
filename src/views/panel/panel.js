import { h, render } from 'preact';
import DataContextProvider from '../../scripts/components/DataContext';
import ConnectionContextProvider from '../../scripts/components/ConnectionContext';
import PanelContent from '../../scripts/components/PanelContent/PanelContent';

import '../../global.scss';
import SettingsContextProvider from '../../scripts/components/SettingsContext';

const App = () => {

    document.body.addEventListener("contextmenu", (e) => e.preventDefault() );

    return (
        <ConnectionContextProvider scriptId="panel" context="devtools">
            <SettingsContextProvider>
                <DataContextProvider>
                    <PanelContent />
                </DataContextProvider>
            </SettingsContextProvider>
        </ConnectionContextProvider>
    )
}

let root = document.getElementById('root');
root.classList.add("theme-" + chrome.devtools.panels.themeName);

render(<App />, root);