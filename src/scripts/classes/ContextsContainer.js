import StackingContext from './StackingContext';

/**
 * Class to represent a document container or an iframe. It should just be a wrapper around contexts
 * 
 * @class
 * @extends StackingContext
 * @property {string} name
 * @property {string} type Makes it easy to tell containers apart from normal stacking contexts
 */

class ContextsContainer extends StackingContext {
    
    name = "";
    type = "container";

    /**
     * Creates a new ContextsContainer
     * 
     * @param {string} name The container name
     * @param {Node} element The element related to this container (documentElement)
     * @param {boolean} isInIframe (only for superclass usage)
     * @param {Node} frame The iframe that contains this element
     * @param {StackingContext} parent The parent stacking context (or container)
     */
    constructor(name, element=null, isInIframe, frame=null, parent=null) {
        super(element, isInIframe, frame, parent);

        if (!name) throw "The container must have a name";

        this.name = name;
    }

    /**
     * @returns A JSON-friendly object to represent this container
     */
    toJSON() {
        return {
            id: this.id,
            type: "container",
            name: this.name,
            children: this.children.map((c) => c.id),
            parent: this.parent?.id
        };
    }
}

export default ContextsContainer;