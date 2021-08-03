import { h, render } from 'preact';
import DataContextProvider from '../../scripts/components/DataContext';
import ConnectionContextProvider from '../../scripts/components/ConnectionContext';
import SettingsContextProvider from '../../scripts/components/SettingsContext';
import SidebarContent from '../../scripts/components/SidebarContent/SidebarContent';

import '../../global.scss';

const App = () => {
    
    document.body.addEventListener("contextmenu", (e) => e.preventDefault() );

    return (
        <ConnectionContextProvider scriptId="sidebar" context="devtools">
            <SettingsContextProvider>
                <DataContextProvider>
                    <SidebarContent />
                </DataContextProvider>
            </SettingsContextProvider>
        </ConnectionContextProvider>
    )
}

let root = document.getElementById('root');
root.classList.add("theme-" + chrome.devtools.panels.themeName);

render(<App />, root);