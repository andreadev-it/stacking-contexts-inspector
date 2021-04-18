import { h } from 'preact';
import Section from '../Section/Section';
import OrderedContextsList from '../OrderedContextsList/OrderedContextsList';

import styles from "./Sidepane.scss";

const Sidepane = ({context, ...props}) => {
    return (
        <div className={styles.sidepane} {...props}>
            <Section title="Info about the context" id="context-info">
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