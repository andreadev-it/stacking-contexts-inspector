import { h, Fragment } from 'preact';
import { useContext } from 'preact/hooks';
import { ConnectionContext } from '../ConnectionContext';
import { SettingsContext } from '../SettingsContext';
import Section from '../Section/Section';
import OrderedContextsList from '../OrderedContextsList/OrderedContextsList';
import SVG from '../SVG';

import styles from "./Sidepane.scss";
import WarningIcon from '../../../icons/warning.svg';

const Sidepane = ({context, ...props}) => {
    
    let { shouldUpdate } = useContext(ConnectionContext);
    let { settings } = useContext(SettingsContext);

    return (
        <div className={styles.sidepane} {...props}>
            <Section title="Info about the context" id="context-info">
                {
                    shouldUpdate && settings["dom-changed-warning"] && (
                        <>
                            <div>
                                <SVG src={WarningIcon} className="inline-icon" />
                                <span style={{marginLeft: '4px', color: 'hsl(57deg 100% 36%)'}}>There were some changes in the page. The stacking context informations might be out of date.</span>
                            </div>
                        </>
                    )
                }
                {
                    context && (context.passedChecks?.length > 0) && (
                        <ul>
                            {
                                context.passedChecks.map((check) => (
                                    <li>{check}</li>
                                ))
                            }
                        </ul>
                    )
                }
                {
                    context && (context.passedChecks?.length == 0) && "This is just a container."
                }
            </Section>
            <Section title="Children z-index order" id="context-children">
                {
                    context?.children?.length > 0 && (
                        <OrderedContextsList contexts={context.children} />
                    )
                }
            </Section>
        </div>
    )
}

export default Sidepane;