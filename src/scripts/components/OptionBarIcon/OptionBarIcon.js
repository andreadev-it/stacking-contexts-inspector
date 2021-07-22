import { h } from 'preact';
import SVG from '../SVG';

import styles from "./OptionBarIcon.scss";

const OptionBarIcon = ({ icon, text, ...props }) => {
    return (
        <div className={styles.optionBarIconWrapper} {...props}>
            {
                icon && (
                    <SVG src={icon} className={`${styles.optionBarIcon} inline-icon`} alt={text} />
                )
            }
        </div>
    );
}

export default OptionBarIcon;