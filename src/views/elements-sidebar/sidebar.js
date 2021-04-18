import { h, render } from 'preact';
import DataContextProvider from '../../scripts/components/DataContext';
import ConnectionContextProvider from '../../scripts/components/ConnectionContext';
import SidebarContent from '../../scripts/components/SidebarContent/SidebarContent';

import '../../global.scss';

const App = () => {
    
    document.body.addEventListener("contextmenu", (e) => e.preventDefault() );

    return (
        <ConnectionContextProvider scriptId="sidebar" context="devtools">
            <DataContextProvider>
                <SidebarContent />
            </DataContextProvider>
        </ConnectionContextProvider>
    )
}

let root = document.getElementById('root');
root.classList.add("theme-" + chrome.devtools.panels.themeName);

render(<App />, root);