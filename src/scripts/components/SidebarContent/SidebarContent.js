import { h, Fragment } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { DataContext } from '../DataContext';
import { ConnectionContext } from '../ConnectionContext';
import Section from '../Section/Section';
import OptionBarButton from '../OptionBarButton/OptionBarButton';
import Context from '../Context/Context';
import OrderedContextsList from '../OrderedContextsList/OrderedContextsList';
import NodeDetails from '../NodeDetails/NodeDetails';
import ContextDetails from '../ContextDetails/ContextDetails';
import Spinner from '../Spinner/Spinner';

import RefreshIcon from '../../../icons/refresh.svg';
import ContextsContainer from '../ContextsContainer/ContextsContainer';

const SmallSpinner = () => (
    <Spinner position={'relative'} width={50} height={50} />
)

const SidebarContent = () => {
    let [curNode, setCurNode] = useState(null);
    let [contextsLoaded, setContextsLoaded] = useState(false);

    let { getConnection, shouldUpdate } = useContext(ConnectionContext);
    let {contexts, refreshContexts} = useContext(DataContext);

    let context = contexts[curNode?.contextId] ?? null;
    let parentContext = curNode?.createsContext ? context.parent : context;

    const handleInspectedElement = () => {

        // It will return the last inspected element position in the DOM from the page.
        function setInspectedElement() {
            return Array.from(document.querySelectorAll('*')).findIndex((el) => el === $0);
        }

        chrome.devtools.inspectedWindow.eval(
            `(${setInspectedElement.toString()})()`,
            async ( elementIndex , isError) => {
                if (isError) {
                    setCurNode(null);
                    return;
                }

                let tabId = chrome.devtools.inspectedWindow.tabId;
                
                let connection = await getConnection();
                await connection.detectLastInspectedElement(tabId, elementIndex);
                
                elementDetails = await connection.getInspectedElementDetails(tabId);
                setCurNode(elementDetails);
            }
        );
    }

    const refreshContextsCache = async () => {
        setContextsLoaded(false);
        await refreshContexts();
        setContextsLoaded(true);
    }

    useEffect(async () => {

        await refreshContextsCache();
        chrome.devtools.panels.elements.onSelectionChanged.addListener( handleInspectedElement );
        handleInspectedElement();

        let cleanup = () => {
            chrome.devtools.panels.elements.onSelectionChanged.removeListener( handleInspectedElement );
        }
        
        return cleanup;
    }, []);

    let NodeDetailsMenu = (
        <>
            <OptionBarButton icon={RefreshIcon} title="Refresh stacking contexts" onClick={() => refreshContextsCache()} />
        </>
    )

    return (
        <>
            { shouldUpdate && "You should really update your contexts!" }
            <Section title="Node details" buttons={NodeDetailsMenu}>
                {
                    !curNode && (
                        <p>There is no element currently selected, or the element is not reachable.</p>
                    )
                }
                {
                    curNode && context && (
                        <NodeDetails node={curNode} />
                    )
                }
            </Section>
            <Section title="Context details">
                {
                    contextsLoaded && curNode?.createsContext && context && (
                        <ContextDetails context={context} />
                    )
                }
                {
                    !contextsLoaded && (
                        <SmallSpinner />
                    )
                }
            </Section>
            <Section title="Parent context">
                {
                    contextsLoaded && parentContext && (
                        <>
                            {
                                parentContext.type == "container" ? (
                                    <ContextsContainer container={parentContext} />
                                ) : (
                                    <Context context={parentContext} />
                                )
                            }
                        </>
                    )
                }
                {
                    !contextsLoaded && (
                        <SmallSpinner />
                    )
                }
            </Section>
            <Section title="Sibling contexts in order">
                {
                    contextsLoaded && parentContext?.children?.length > 0 && (
                        <OrderedContextsList contexts={parentContext.children} />
                    )
                }
                {
                    !contextsLoaded && (
                        <SmallSpinner />
                    )
                }
            </Section>
        </>
    );
}

export default SidebarContent;