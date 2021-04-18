/**
 * This class will be used to represent a static context.
 * 
 * @property {number} id
 * @property {StackingContext} parent The parent static context.
 * @property {Array<StackingContext>} children The static context children.
 * @property {Node} element The element that is creating the static context.
 * @property {Node} isInIframe Variable to check if this stacking context is inside an iframe.
 * @property {Node} frame The node that function as the frame for this context element, it might be undefined for the top frame or an iframe element.
 * @property {Array<string>} passedChecks A list of strings that enumerates all the reason why this static context has been created.
 */
class StackingContext {
    
    id = null;
    parent = null;
    children = [];
    element = null;

    passedChecks = []

    /**
     * Creates a new Stacking Context object
     * 
     * @param {Node} element 
     * @param {boolean} isInIframe 
     * @param {Node} frame 
     * @param {StackingContext} parentContext 
     * @param {Array<string>} passedChecks 
     */
    constructor(element, isInIframe, frame=null, parentContext, passedChecks = []) {
        this.element = element;
        this.isInIframe = isInIframe ?? false;
        this.frame = frame;
        this.parent = parentContext ?? null;
        this.passedChecks = passedChecks;
    }

    /**
     * Adds a static context as a children of this context
     * 
     * @param {StackingContext} context
     */
    addChild(context) {
        this.children.push(context);
    }

    /**
     * This will convert a stacking context to a JSON-friendly object in order to pass it to the background script and the devtools panel and sidebar.
     * 
     * @returns The JSON-friendly static context representation
     */
    toJSON() {
        let parentId = this.parent?.id ?? null;
        let childrenIds = this.children.map( (child) => child.id );

        let classes = [];
        if (this.element?.classList?.length > 0) {
            classes = [...this.element.classList];
        }

        let allElements = Array.from(document.getElementsByTagName('*'));
        let elementIndex = (this.element) ? allElements.indexOf(this.element) : null;

        let elementStyles = window.getComputedStyle(this.element);

        let elementDescription = {
            tagName: this.element?.tagName?.toLowerCase() ?? "document",
            id: this.element?.id ?? "",
            classes,
            index: (elementIndex >= 0) ? elementIndex : null,
            styles: {
                zIndex: elementStyles.zIndex,
                position: elementStyles.position
            }
        }

        return {
            id: this.id,
            parent: parentId,
            children: childrenIds,
            element: elementDescription,
            passedChecks: this.passedChecks,
            isInIframe: this.isInIframe
        };
    }
}

export default StackingContext;