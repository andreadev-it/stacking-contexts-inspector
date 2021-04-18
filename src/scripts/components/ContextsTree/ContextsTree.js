import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { isValuableContainer } from '../../../scripts/utils/utils';
import TreeItem from '../TreeItem/TreeItem';
import Spinner from '../../../scripts/components/Spinner/Spinner';

import styles from "./ContextsTree.scss";

const ContextsTree = ({contexts, onSelectContext, ...props}) => {

    [contextsState, setContextsState] = useState([]);
    [selected, setSelected] = useState(null);

    useEffect( () => {
        let newState = contexts.map( (el, i) => {
            return {
                visible: false,
                open: false,
                depth: 0
            }
        });

        newState.forEach( (state, i) => {
            if (i == 0) return;

            let previous = newState[i-1];
            let previousContext = contexts[i-1];
            let currentContext = contexts[i];
            let depth = (previous) ? previous.depth : 0;

            if (currentContext.parent == previousContext.parent) {
                state.depth = previous.depth;
                return;
            }
            if (currentContext.parent == previousContext) {
                state.depth = depth + 1;
                return;
            }

            parentIndex = contexts.findIndex( (c) => c == currentContext.parent );
            state.depth = newState[parentIndex].depth + 1;
        });

        if (newState.length > 0) {
            newState[0].visible = true;
        }

        setContextsState(newState);
    }, contexts);

    let openContext = (contextToOpen, index) => {
        let newState = [...contextsState];

        contexts.forEach( (context, i) => {
            if (context.parent == contextToOpen) {
                newState[i].visible = true;
            }
        });

        newState[index].open = true;

        setContextsState(newState);
    }

    let closeContext = (contextToClose, index) => {
        let newState = [...contextsState];
        let temp = [contextToClose];

        contexts.forEach( (context, i) => {
            if (temp.includes(context.parent)) {
                temp.push(context);
                newState[i].visible = false;
                newState[i].open = false;
            }
        });

        newState[index].open = false;

        setContextsState(newState);
    }

    let selectContext = (context) => {
        if (context.id == selected) return;

        setSelected(context.id);
        onSelectContext(context);
    }

    let shouldInsert = (context) => {
        if (!context) return false;
        if (context?.type == "container" && isValuableContainer(context)) return true;
        return context?.type !== "container";
    }

    return (
        <div className={styles.contextsTree} {...props} >
            {
                contextsState.map( (state, i) => (
                    <>
                        {
                            shouldInsert(contexts[i]) && (
                                <TreeItem
                                    context={contexts[i]}
                                    depth={state.depth}
                                    isVisible={state.visible}
                                    data-status={(state.open) ? "open" : "closed"}
                                    data-selected={contexts[i].id == selected}
                                    onToggle={
                                        () => ( (state.open) ? closeContext(contexts[i], i) : openContext(contexts[i], i) )
                                    }
                                    onClick={
                                        () => selectContext(contexts[i])
                                    }
                                />
                            )
                        }
                    </>
                ))
            }
            {
                contextsState.length == 0 && (
                    <Spinner />
                )
            }
        </div>
    )
}

export default ContextsTree;