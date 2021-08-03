import { BackgroundHandler } from '@andreadev/bg-script';
import TabStatus from './classes/TabStatus';

// Contain all the tabs status (see TabStatus class for more details)
let tabs = new Map();

let DEFAULT_SETTINGS = {
    "dom-changed-warning": true,
    "contexts-click-to-expand": false
};

let settings = null;


/**
 * Initialize the settings inside local storage to their default values
 */
function initExtensionSettings() {
    chrome.storage.local.set({ "settings": DEFAULT_SETTINGS });
}

/**
 * Load the extension settings
 * 
 * @returns {Promise<Object>}
 */
function loadExtensionSettings() {
    return new Promise( (resolve, reject) => {
        try {
            chrome.storage.local.get(["settings"], (result) => {
                settings = result.settings;
                resolve(settings);
            });
        }
        catch (e) {
            reject(e);
        }
    });
}

/**
 * Save the new settings in the local chrome extension storage
 * 
 * @param {Object} newSettings The updated settings
 * @returns {Promise}
 */
function saveExtensionSettings(newSettings) {
    return new Promise( (resolve, reject) => {
        try {
            chrome.storage.local.set({ settings: newSettings }, () => {
                resolve();
            });
        }
        catch (e) {
            reject(e);
        }
    });
}

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
async function getScriptConnection(scriptId, tabId, injectOnFail=true) {

    if (!bgHandler.hasConnectedScript(scriptId, tabId)) {
        // Not returning anything if there is no script attached and we don't want to automatically inject the content script
        if (!injectOnFail) return undefined;
        
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
 * Start the DOM Observer
 * 
 * @param {number} tabId 
 */
async function startDOMObserver(tabId) {
    let connection = await getScriptConnection("content", tabId);
    console.log("Starting DOM Observer...")
    await connection.startDOMObserver();
}

/**
 * Stop the DOM Observer
 * 
 * @param {number} tabId 
 */
 async function stopDOMObserver(tabId) {
    let connection = await getScriptConnection("content", tabId);
    console.log("Stopping DOM Observer...")
    await connection.stopDOMObserver();
}

/**
 * Send a message to the extension panels to warn that the contexts should be refreshed.
 */
async function sendDOMChangedWarning(tabId) {
    let panelConnection = await getScriptConnection("panel", tabId, false);
    let sidebarConnection = await getScriptConnection("sidebar", tabId, false);

    if (panelConnection) {
        await panelConnection.setShouldUpdate(true);
    }
    if (sidebarConnection) {
        await sidebarConnection.setShouldUpdate(true);
    }
}

/**
 * Update the devtools pages visibility status in order to decide whether to start or stop the DOM observer
 * 
 * @param {number} tabId The tab id
 * @param {string} scriptId The script id
 * @param {boolean} visibilityStatus The current visibility status of the page where the specified script id is used
 */
function updateDevtoolsPageStatus(tabId, scriptId, isActive) {
    console.log(`The script '${scriptId}' related to the tab '${tabId}' is currently ${isActive ? 'active' : 'hidden'}`)

    let tabStatus = tabs.get(tabId);
    if (tabStatus == undefined) {
        tabStatus = new TabStatus();
        tabs.set(tabId, tabStatus);
    }

    let isInspected = tabStatus.isBeingInspected;

    switch (scriptId) {
        case "panel":
            tabStatus.isPanelActive = isActive;
            break
        case "sidebar":
            tabStatus.isSidebarActive = isActive;
            break;
        default:
            return;
    }

    let isCurrentlyInspected = tabStatus.isBeingInspected;
    
    // If the overall page inspected status has changed, decide whether to start or stop the DOM Observer
    if (isInspected == isCurrentlyInspected) return;

    if (isCurrentlyInspected) {
        startDOMObserver(tabId);
    }
    else {
        stopDOMObserver(tabId);
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
    sendDOMChangedWarning,
    updateDevtoolsPageStatus,
    loadExtensionSettings,
    saveExtensionSettings
}, {
    errorCallback: onHandlerError
});

/**
 * Initialization method
 */
function init() {
    // Add "connection received" handler to update tab status
    bgHandler.addListener("connectionreceived", ({scriptId, tabId}) => {
        // Devtools script are tab-agnostic by default, so I'm appending the tab id to it using `scriptid-tabid` format
        if (tabId == null) {
            // Find the tab id delimiter
            let delimiter = scriptId.search("-");
            // Get the tab id
            tabId = parseInt(scriptId.substring(delimiter + 1));
            // Get the clean script id
            scriptId = scriptId.substring(0, delimiter);
            // Notify the change
            updateDevtoolsPageStatus(tabId, scriptId, true);
        }
    });

    // Add "connection ended" handler to update tab status
    bgHandler.addListener("connectionended", ({scriptId, tabId}) => {
        // Devtools script are tab-agnostic by default, so I'm appending the tab id to it using `scriptid-tabid` format
        if (tabId == null) {
            // Find the tab id delimiter
            let delimiter = scriptId.search("-");
            // Get the tab id
            tabId = parseInt(scriptId.substring(delimiter + 1));
            // Get the clean script id
            scriptId = scriptId.substring(0, delimiter);
            // Notify the change
            updateDevtoolsPageStatus(tabId, scriptId, false);
        }
    });

    // Initialize Settings
    loadExtensionSettings()
        .then((settings) => {
            if (!settings) {
                initExtensionSettings();
            }
        })
        .catch(() => {
            initExtensionSettings();
        });
}

init();