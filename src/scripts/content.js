import DOMTraversal from "./utils/DOMTraversal";
import StackingContext from './classes/StackingContext';
import { BackgroundScript } from '@andreadev/bg-script';
import { getNodeFromPath, getPathFromNode } from "./utils/utils";

var allContexts = null;
var rootContext = null;
var highlightDOM = initHighlightDOM();
var lastInspectedElement = null;
var observer = null;
var isObserverActive = false;


/**
 * Analyse the page and initialize the 'allContexts' and 'rootContext' variables.
 */
async function analysePage() {
    [rootContext, allContexts] = DOMTraversal.getContextsFromPage();
}

/**
 * Returns a copy of all the contexts converted to JSON.
 * 
 * @return {Array} list of all contexts converted to JSON.
 */
function getAllContextsJSON() {
    let allContextsJSON = allContexts.map( context => context.toJSON() );
    return allContextsJSON;
}

/**
 * Creates the element that will be used to highlight the contexts in the page.
 * 
 * @return {Node} The actual DOM element with coherent styles applied.
 */
function initHighlightDOM() {
    let element = document.createElement("div");
    element.id = "devtools-stacking-context-highlight";
    element.style.backgroundColor = "rgba(0,200,255, 0.7)";
    element.style.position = "fixed";
    element.style.zIndex = "2147483647";
    element.style.display = "none";
    return element;
}

/**
 * Highlight the DOM Element related to a context.
 * 
 * @param {number} id The id of the context to be highlighted.
 */
function highlightContext(id) {
    let elementBCR = allContexts[id].element.getBoundingClientRect();
    let relPos = getRelativePosition(allContexts[id]);
    highlightDOM.style.top = (elementBCR.top + relPos.top) +  "px";
    highlightDOM.style.left = (elementBCR.left + relPos.left) + "px";
    highlightDOM.style.width = elementBCR.width + "px";
    highlightDOM.style.height = elementBCR.height + "px";
    highlightDOM.style.display = "block";
    document.body.appendChild(highlightDOM);
}

/**
 * Get the relative position of a specific element in the page (iframes included)
 * 
 * @param {StackingContext} context
 * @return {Object} The relative position of the context frame
 */
function getRelativePosition(context) {
    let relativePosition = { top: 0, left: 0 };
    let current = context;

    while (current) {
        if (current.frame == null) break;

        if (current.type === "container") {
            let frameBCR = current.frame.getBoundingClientRect();
            relativePosition.top += frameBCR.top;
            relativePosition.left += frameBCR.left;
        }
        
        current = current.parent;
    }

    return relativePosition;
}

/**
 * Remove the highlight element from the page.
 */
function undoHighlightContext() {
    highlightDOM.style.display = "none";
    document.body.removeChild(highlightDOM);
}

/**
 * Scroll the page to show the element related to a specific context.
 * 
 * @param {number} id The context id.
 */
function scrollToContext(id) {
    allContexts[id].element.scrollIntoView();
}

/**
 * Find the stacking context that contains a specific node as a child of its element. If the node creates a stacking context, return it.
 * 
 * @param {Node} node The node of which we want to find the context.
 * @return {StackingContext} The context associated with the node or one of its parents.
 */
function getContextIdFromNode(node) {

    let lastParent = node;
    while (lastParent !== null) {
        
        foundContext = allContexts.find( (context) => context.element === lastParent );
        
        if (foundContext) {
            return foundContext;
        }

        // Check if I've reached a shadowroot container and work my way around it
        if (lastParent.parentElement === null) {

            let root = lastParent.getRootNode();
            
            if (root instanceof ShadowRoot) {
                lastParent = root.host;
                continue;
            }
        }

        lastParent = lastParent.parentElement;
    }

    return null;
}

/**
 * Returns a path to get the element of a specific context even if it is inside an iframe or shadow DOM
 * 
 * @param {Integer} contextId 
 * @returns {Object[]}
 */
function getPathFromContext(contextId) {
    let context = allContexts.find( (context) => context.id == contextId );
    return getPathFromNode( context.element );
}

/**
 * Detect which node was tagged as "last inspected" from the devtools, and initialize the related variable.
 */
function detectLastInspectedElement(elementPath) {
    
    let element = null;

    try {
        element = getNodeFromPath(elementPath);
    }
    catch (e) {
        element = null;
    }
    
    if (!element) throw "Cannot find element";
    
    lastInspectedElement = element;
}

/**
 * Get some details about the last inspected element.
 * 
 * @returns {Object} An object containing the id of the context associated to the element and whether or not the element creates a new stacking context.
 */
function getInspectedElementDetails() {

    let details = {
        createsContext: false,
        contextId: 0,
        zIndex: "auto"
    };

    let passedChecks = DOMTraversal.getPassedChecks(lastInspectedElement);

    if (passedChecks.length > 0) details.createsContext = true;

    let context = getContextIdFromNode(lastInspectedElement);

    details.contextId = context.id;

    let styles = window.getComputedStyle(lastInspectedElement);

    details.zIndex = styles.zIndex;

    return details;
}

/**
 * Get all the iframes sources, to implement inspection on iframes
 * 
 * @return {Array<string>} All the iframes src attributes
 */
function getPageFramesSources() {
    let iframes = Array.from( document.getElementsByTagName('iframe') );
    let sources = iframes.map( (iframe) => iframe.src );
    sources = sources.filter( (src) => src !== "" );
    sources = [...new Set(sources)];
    return sources;
}

/**
 * Attach a mutation observer to the DOM and notify the extension that the contexts should be refreshed
 */
function setupDOMObserver() {
    // This is used to debounce the "DOM Changed" notification
    let lastCalled = new Date().getTime();

    // Callback for the observer
    const callback = (mutationsList, observer) => {
        // Check if it has passed enough time from the last call
        let now = new Date().getTime();
        let debounceTime = 1000; // one second
        
        if (now - lastCalled < debounceTime) return;

        // If we're not interested in these mutation, stop the function
        if (!mutationsList.some(isImportantMutation)) return;

        // If all the mutations are internal, stop the function
        if (mutationsList.every(isInternalMutation)) return;

        lastCalled = now;
        sendDOMChangedWarning();
    }

    observer = new MutationObserver(callback);

}

/**
 * Just a utility function to allow adding and removing it as an event listener
 */
function disconnectObserver() {
    if (!isObserverActive) {
        console.warn("Tried stopping the observer, but it was already stopped.");
        return;
    }
    observer.disconnect();
    isObserverActive = false;
}

/**
 * Start observing the changes in the DOM
 */
function startDOMObserver() {

    if (isObserverActive) {
        console.warn("Tried starting the observer, but it was already running.");
        return;
    }

    // Observer all the changes of the DOM elements position and attribute for the body tag and its children
    const targetNode = document.body;
    const config = { attributes: true, childList: true, subtree: true };
    
    observer.observe(targetNode, config);
    isObserverActive = true;
    
    // Disconnect the observer when the user is leaving the page
    window.addEventListener("beforeunload", disconnectObserver);
}


/**
 * Stop observing the changes in the DOM
 */
function stopDOMObserver() {
    disconnectObserver();
    window.removeEventListener("beforeunload", disconnectObserver);
} 


/**
 * Check whether or not we're interested in this mutation and want to send a warning in the extension panel and sidebar
 * 
 * @param {MutationRecord} mutation 
 * @returns {boolean}
 */
function isImportantMutation(mutation) {
    // If a DOM element has changed position or has been added / removed, it should notify
    if (mutation.type === "childList") return true;

    // If the "style", "class", "id" or "data-xxx" attributes change, it should notify (although any attribute might change the stacking contexts, this is just to make it lighter)
    if (mutation.type === "attributes") {

        let checkAttrs = ["style", "class", "id"];
        if (checkAttrs.includes(mutation.attributeName)) return true;

        if (mutation.attributeName.startsWith("data-")) return true;
    }
    
    return false;
}

/**
 * Check whether a specific mutation found by the observer was caused by our own extension or was generated by the page
 * 
 * @param {MutationRecord} mutation 
 * @returns {boolean}
 */
function isInternalMutation(mutation) {
    // Check if the target is our own overlay
    if (mutation.target.id == "devtools-stacking-context-highlight") {
        return true;
    }
    
    // Check if the mutation was caused by our overlay
    if (mutation.type == "childList") {
        let element = null;

        if (mutation.addedNodes.length == 1) element = mutation.addedNodes[0];
        else if (mutation.removedNodes.length == 1) element = mutation.removedNodes[0];

        if (element?.id == "devtools-stacking-context-highlight") {
            return true;
        }
    }

    return false;
}

/**
 * Send a DOM Changed warning to the extension panel and sidebar 
 */
async function sendDOMChangedWarning() {
    let connection = await bgScript.getConnection();
    
    // Stop if a connection hasn't been found
    if (connection == null) return;
    
    let tabId = await connection.$getMyTabId();

    await connection.sendDOMChangedWarning(tabId);
}


// Setup the DOM Observer
setupDOMObserver();

// Create the connection to the background script exposing the methods.
let scriptId = "content";
if (window.top !== window.self) {
    scriptId += "." + window.location.href;
}

var bgScript = new BackgroundScript(scriptId, {
    analysePage,
    getAllContextsJSON,
    highlightContext,
    undoHighlightContext,
    scrollToContext,
    getPathFromContext,
    detectLastInspectedElement,
    getInspectedElementDetails,
    getPageFramesSources,
    startDOMObserver,
    stopDOMObserver
});