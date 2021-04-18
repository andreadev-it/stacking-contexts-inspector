import {h} from 'preact';
import SVG from '../SVG';

import LoaderIcon from '../../../icons/loader-simple.svg';

import styles from './Spinner.scss';

export const Spinner = ({ position='absolute', width=100, height=100 }) => (
    <div className={styles.spinner} style={{position}}>
        <SVG src={LoaderIcon} style={{width, height}} />
    </div>
);

export default Spinner;