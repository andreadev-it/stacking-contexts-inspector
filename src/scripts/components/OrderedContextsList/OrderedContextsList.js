import { h, Fragment } from 'preact';
import Context from '../Context/Context';
import styles from "./OrderedContextsList.scss";

function paintOrderFunction(a, b) {
    let aIndex = 0;
    let bIndex = 0;

    if (a.element.styles.zIndex !== "auto") aIndex = parseInt(a.element.styles.zIndex);
    if (b.element.styles.zIndex !== "auto") bIndex = parseInt(b.element.styles.zIndex);

    if (aIndex == 0 && a.element.styles.position !== "static") {
        aIndex = 0.5;
    }
    if (bIndex == 0 && b.element.styles.position !== "static") {
        bIndex = 0.5;
    }
    
    // When they're the same, the last element in the DOM gets print on top
    aIndex += 0.1; 
    
    return bIndex - aIndex;
}

const OrderedContextsList = ({contexts}) => {

    let ordered = [...contexts];

    ordered = ordered.filter( (context) => context.type !== "container" );

    ordered.sort(paintOrderFunction);

    return (
        <div className={styles.contextList}>
            {
                ordered.map( (context) => (
                    <div className={styles.contextListItem}>
                        <div className={styles.contextPosition}>
                            {
                                context.element.styles.zIndex !== "auto" && (
                                    <>{context.element.styles.zIndex}</>
                                )
                            }
                            {
                                context.element.styles.zIndex == "auto" && (
                                    <>{(context.element.styles.position !== "static") ? context.element.styles.position : '-'}</>
                                )
                            }
                        </div>
                        <Context context={context} />
                    </div>
                ))
            }
        </div>
    );
}

export default OrderedContextsList;