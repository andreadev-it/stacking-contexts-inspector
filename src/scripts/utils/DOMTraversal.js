import { activeChecks } from '../classes/ContextChecks.js';
import StackingContext from '../classes/StackingContext.js';
import ContextsContainer from '../classes/ContextsContainer';

let allContexts = null;

/**
 * Utility method to traverse a DOM element and check if it's a stacking context. It's recursive and
 * will traverse all the children down the tree.
 * 
 * @param {Node} element The element to traverse
 * @param {StackingContext} parentContext The parent context
 * @param {boolean} isInIframe True if we are traversing an iframe
 * @param {Object} frame The current frame (may be undefined or an iframe element).
 */
function traverse(element, parentContext, isInIframe=false, frame) {
    let context = null;

    let passedChecks = getPassedChecks(element);
    if (passedChecks.length > 0) {
        context = new StackingContext(element, isInIframe, frame, parentContext, passedChecks);
        parentContext.addChild(context);
        let id = allContexts.push(context);
        context.id = id - 1; // This will help us referring to this context from other scripts
        
        // set the new context as the parent for this element children
        parentContext = context;
    }

    // Check for pseudoelements (after / before)
    let beforePassedChecks = getPassedChecks(element, ':before');
    let afterPassedChecks  = getPassedChecks(element, ':after');

    if (beforePassedChecks.length > 0) {
        context = new StackingContext(element, isInIframe, frame, parentContext, beforePassedChecks, 'before');
        parentContext.addChild(context);
        let id = allContexts.push(context);
        context.id = id - 1;
    }

    if (afterPassedChecks.length > 0) {
        context = new StackingContext(element, isInIframe, frame, parentContext, afterPassedChecks, 'after');
        parentContext.addChild(context);
        let id = allContexts.push(context);
        context.id = id - 1;
    }
    
    for (let child of element.children) {
        if (element.nodeType == Node.ELEMENT_NODE) {
            // We need to pass down the "IsInIframe" and "frame"
            traverse(child, parentContext, isInIframe,  frame);
        }
    }

    // If element is a traversable iframe...
    if ( isTraversableIframe(element) ) {
        // Get the client rect to pass the relative position of the iframe in respect to the top window
        let iframeDoc = element.contentDocument;

        // Start traversing its documentElement
        let container = new ContextsContainer("#document (iframe)", iframeDoc.documentElement, isInIframe, element, parentContext);
        parentContext.addChild(container);
        let id = allContexts.push(container);
        container.id = id - 1;

        traverse(
            iframeDoc.body,
            container,
            true,
            element
        );
    }
    // Check if the element contains an open shadow DOM
    else if ( hasTraversableShadowDOM(element) ) {
        let shadowRoot = element.shadowRoot;

        // Shadow roots can't be a container because they are not taken into consideration for stacking contexts

        for (let child of shadowRoot.children) {
            if (element.nodeType == Node.ELEMENT_NODE) {
                traverse(child, parentContext, true, frame);
            }
        }
    }
}

/**
 * Check if an element is an iframe that exposes its content to javascript
 * 
 * @param {Node} element The element to be checked
 * @returns {boolean}
 */
function isTraversableIframe(element) {
    return element.children.length == 0 &&
        element.tagName === "IFRAME" &&
        element.contentDocument?.documentElement;
}

/**
 * Check whether or not this element has an open shadow DOM
 * 
 * @param {Node} element The element to be checked
 * @returns {boolean}
 */
function hasTraversableShadowDOM(element) {
    return element.shadowRoot?.mode == "open";
}

/**
 * Check if an element is a stacking context and returns a list of passed checks.
 * 
 * @param {Node} element The DOM element to check for a stacking context
 * @returns 
 */
export function getPassedChecks(element, pseudo) {
    let styles = window.getComputedStyle(element, pseudo);
    let passed = [];

    if (pseudo) {
        if (!styles.content || styles.content == 'none') {
            return [];
        }
    }

    for (let check of activeChecks) {
        if (check.exec(element, styles)) {
            passed.push(check.description);
        }
    }

    return passed;
}

/**
 * Start traversing the DOM from the documentElement and extracts all the stacking contexts in the page.
 * 
 * @returns {Array} Returns an array with two elements: the root context and a list of all contexts.
 */
export function getContextsFromPage() {
    let rootContainer = new ContextsContainer("#document", document.documentElement, false);
    rootContainer.id = 0;
    allContexts = [rootContainer];

    traverse(document.body, rootContainer);

    return [rootContainer, allContexts];
}

export default {
    getPassedChecks,
    getContextsFromPage
};
