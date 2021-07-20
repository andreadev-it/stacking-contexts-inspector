import { BackgroundHandler } from '@andreadev/bg-script';

/**
 * Inject the content script into a tab
 */
function injectScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.executeScript(
            tabId,
            {
                file: '/scripts/content.js'
            },
            () => {
                resolve();
            }
        );
    });
}

/**
 * Get a script connection, and if there is no script associated with the tab, it injects it.
 * 
 * @param {string} scriptId
 * @param {number} tabId 
 * @param {boolean} analysePage Only when the scriptId is 'content', it forces a page analysis before returning the connection.
 * @returns {Promise<Connection>} The connection to the content script
 */
async function getScriptConnection(scriptId, tabId, analysePage=false) {

    if (!bgHandler.hasConnectedScript(scriptId, tabId)) {
        await injectScript(tabId);
    }

    let conn = await bgHandler.getScriptConnection(scriptId, tabId);

    if (conn) return conn;
}

/**
 * Analyzes the page related to a specific tab id and returns a JSON description of the stacking contexts.
 * 
 * @param {number} tabId 
 * @returns {Array} The list of contexts in the page.
 */
async function analysePage(tabId) {
    let connection = await getScriptConnection("content", tabId);

    await connection.analysePage();
    let contexts = await connection.getAllContextsJSON();
    return contexts;
}

/**
 * Highlight a context on a specific page.
 * 
 * @param {number} tabId 
 * @param {number} contextId The id of the context to be highlighted
 */
async function highlightContext(tabId, contextId) {
    let connection = await getScriptConnection("content", tabId, true);
    await connection.highlightContext(contextId);
}

/**
 * Remove the highlight that was set on the context.
 * 
 * @param {number} tabId 
 */
async function undoHighlightContext(tabId) {
    let connection = await getScriptConnection("content", tabId);
    await connection.undoHighlightContext();
}

/**
 * Scrolls the page related to a specific tab id in order to show a context.
 * 
 * @param {number} tabId 
 * @param {number} contextId 
 */
async function scrollToContext(tabId, contextId) {
    let connection = await getScriptConnection("content", tabId, true);
    await connection.scrollToContext(contextId);
}

/**
 * Instruct the content script related to a specific tab to get the details about the last inspected element.
 * 
 * @param {number} tabId 
 * @param {number} elementIndex The index of the last inspected element inside the DOM
 */
async function detectLastInspectedElement(tabId, elementIndex) {
    let connection = await getScriptConnection("content", tabId, true);
    await connection.detectLastInspectedElement(elementIndex);
} 

/**
 * Get some details about the last selected element and its context
 * 
 * @param {number} tabId 
 * @returns {Object} The element details
 */
async function getInspectedElementDetails(tabId) {
    let connection = await getScriptConnection("content", tabId, true);
    let elementDetails = await connection.getInspectedElementDetails();

    return elementDetails;
} 

async function getPageFramesSources(tabId) {
    let connection = await getScriptConnection("content", tabId);
    let sources = await connection.getPageFramesSources();
    return sources;
}

/**
 * Send a message to the extension panels to warn that the contexts should be refreshed.
 */
async function sendDOMChangedWarning(tabId) {
    let panelConnection = await getScriptConnection("panel", tabId);
    let sidebarConnection = await getScriptConnection("sidebar", tabId);

    if (panelConnection) {
        await panelConnection.setShouldUpdate(true);
    }
    if (sidebarConnection) {
        await sidebarConnection.setShouldUpdate(true);
    }
}

/**
 * Handle the background handler errors (right now it just prints them to the console)
 */
function onHandlerError(details) {
    console.log(details.errorId);
    console.error(details.error);
}

let bgHandler = new BackgroundHandler({
    analysePage,
    highlightContext,
    undoHighlightContext,
    scrollToContext,
    detectLastInspectedElement,
    getInspectedElementDetails,
    getPageFramesSources,
    sendDOMChangedWarning
}, {
    errorCallback: onHandlerError
});

window.bgHandler = bgHandler;