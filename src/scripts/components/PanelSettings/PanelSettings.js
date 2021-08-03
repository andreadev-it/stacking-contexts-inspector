import { h } from 'preact';
import { useContext } from 'preact/hooks';
import { SettingsContext } from '../SettingsContext';

import styles from './PanelSettings.scss';

const PanelSettings = ({className="", ...props}) => {
    let settingsLabels = {
        "dom-changed-warning": "Show DOM changed warning",
        "contexts-click-to-expand": "Expand context on click (tree view)"
    }

    let { settings, saveSettings } = useContext(SettingsContext);
    console.log("SETTINGS: ", settings);
    console.log(styles);

    let checkboxClicked = (event) => {
        let value = event.target.checked;
        let settingName = event.target.name;
        settings[settingName] = value;
        saveSettings(settings);
    }

    return (
        <div className={`${styles.settingsContainer} ${className}`} {...props}>
            {
                settings && Object.keys(settings).map((settingName) => (
                    <div class="setting">
                        <input type="checkbox" name={settingName} checked={settings[settingName]} onChange={checkboxClicked} /> {settingsLabels[settingName]}
                    </div>
                ))
            }
        </div>
    );
}

export default PanelSettings;