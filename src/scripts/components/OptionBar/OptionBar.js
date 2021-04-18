import { h, Fragment } from 'preact';
import OptionBarSeparator from '../OptionBarSeparator/OptionBarSeparator';

import styles from "./OptionBar.scss";

const OptionBar = ({ title, children, ...props }) => (
    <div className={styles.optionBar} {...props} >
        {
            title && (
                <>
                    <span className={styles.optionBarTitle}>{title}</span>
                    {
                        children && (
                            <OptionBarSeparator />
                        )
                    }
                </>
            )
        }
        { children }
    </div>
);

export default OptionBar;