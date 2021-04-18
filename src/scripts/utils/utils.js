/**
 * Get a list of JSON-friendly stacking contexts that have only the context id set as the parent/children, and links them.
 * 
 * @param {Array<Object>} contextsList A list of contexts with their  
 * @returns {Object} A representation of a stacking context adapted for the devtools scripts.
 */
export function generateContextTree(contextsList) {
    let root = contextsList[0];

    function linkChildren(context) {
        // Get a context from its id (since the ids start from 0, the id is also its index inside the array)
        context.children = context.children.map( (child) => contextsList[child] );
        for (let child of context.children) {
            child.parent = context;
            linkChildren(child);
        }
    }

    linkChildren(root);

    return root;
}

export function isValuableContainer(container) {
    // Check if has children
    if (container.children.length == 0) return false;
    
    // Check if some children is a stacking context
    if (container.children.some((child) => child.type !== "container")) return true;

    // Check the container children to see if they're valuable to show
    if (container.children.some((child) => isValuableContainer(child))) return true;

    return false;
}