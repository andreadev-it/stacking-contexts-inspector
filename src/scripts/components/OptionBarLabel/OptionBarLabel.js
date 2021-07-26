import { h } from 'preact';
import SVG from '../SVG';

import styles from "./OptionBarLabel.scss";

const OptionBarLabel = ({ icon, text, ...props }) => {
    return (
        <div className={styles.optionBarLabel} {...props}>
            {
                icon && (
                    <SVG src={icon} className={`${styles.labelIcon} inline-icon`} />
                )
            }
            {
                text && (
                    <span>{text}</span>
                )
            }
        </div>
    );
}

export default OptionBarLabel;