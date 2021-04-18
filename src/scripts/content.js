import DOMTraversal from "./utils/DOMTraversal";
import StackingContext from './classes/StackingContext';
import { BackgroundScript } from '@andreadev/bg-script';

var allContexts = null;
var rootContext = null;
var highlightDOM = initHighlightDOM();
var lastInspectedElement = null;


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

        lastParent = lastParent.parentElement;
    }

    return null;
}

/**
 * Detect which node was tagged as "last inspected" from the devtools, and initialize the related variable.
 */
function detectLastInspectedElement(elementIndex) {
    
    let element = document.querySelectorAll('*')[elementIndex];
    
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
    detectLastInspectedElement,
    getInspectedElementDetails,
    getPageFramesSources
});