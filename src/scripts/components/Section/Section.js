import { h, Fragment } from 'preact';
import OptionBar from '../OptionBar/OptionBar';

import styles from './Section.scss';

const Section = ({ title, buttons, children }) => (
    <>
        <OptionBar title={title}>{buttons}</OptionBar>
        <section className={styles.content}>
            {children}
        </section>
    </>
);

export default Section;