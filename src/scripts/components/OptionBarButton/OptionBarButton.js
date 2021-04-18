import { h } from 'preact';
import SVG from '../SVG';

import styles from "./OptionBarButton.scss";

const OptionBarButton = ({ text, icon, ...props }) => {
    console.log("Styles: ", styles);
    return (
        <div className={ `${styles.optionBarButton} ${(icon) ? styles.iconBtn : ""}` } {...props}>
            {
                text && (
                    <span className={styles.optionBarButtonText}>{text}</span>
                )
            }
            {
                icon && (
                    <SVG src={icon} className={`${styles.optionBarButtonIcon} inline-icon`} />
                )
            }
        </div>
    );
}

export default OptionBarButton;