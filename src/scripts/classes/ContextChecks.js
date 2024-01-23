/**
 * Creates a new check to do on a DOM element to make sure if it is a stacking context.
 * 
 * @property {string} description This text will be shown in the devtools to explain why the element is a stacking context.
 * @property {function} callback To this callback will be passed the DOM element and its computed style. It must return 
 *                                  wether or not the check is passed.
 */
export class ContextCheck {

    description = "";
    callback = null;

    constructor(description, callback) {
        if (!description || !callback) {
            throw "Both a description and a callback are needed to create a new context check"
        }
        this.description = description;
        this.callback = callback;
    }

    /**
     * Executes the check callback on the element passed as a parameter. Returns wether or not this Node creates a static context.
     * 
     * @param {Node} element The element to check.
     * @param {CSSStyleDeclaration} elementStyle Optional. The element computed styles (it will be loaded if not passed) 
     * @returns {boolean} 
     */
    exec(element, elementStyle) {
        if (!element) throw "Cannot execute a check without an element";
        if (!elementStyle) {
            elementStyle = window.getComputedStyle(element);
        }

        return this.callback(element, elementStyle);
    }

}

/* 
 * List of checks to do on the element in order for it to create a new stacking context.
 * These checks are based on this MDN article: 
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
 */

export const positionFixedSticky = new ContextCheck(
    "The element position has the value 'fixed' or 'sticky'",
    (element, styles) => {
        if (styles.position == "fixed" ||
            styles.position == "sticky")
        {
            return true;
        }
        return false;
    }
);

export const zIndexWithPosition = new ContextCheck(
    "The element has a z-index set and the position is not 'static'",
    (element, styles) => {
        if (styles.position !== "static" &&
            styles.zIndex !== "auto")
        {
            return true;
        }
        return false;
    }
);

export const containerTypeisSizeOrInlineSize = new ContextCheck(
    "The element has a container-type set to 'size' or 'inline-size'",
    (element, styles) => {
        if (styles.containerType == "size" ||
            styles.containerType == "inline-size")
        {
            return true;
        }
        return false;
    }
);

export const notFullOpacity = new ContextCheck(
    "The element has an opacity value smaller than 1",
    (element, styles) => {

        if (styles.opacity == "auto") return false;
        
        let opacity = parseFloat(styles.opacity);
        
        if (isNaN(opacity) || opacity == 1) return false;
        
        return true;
    }
);

export const mixBlendMode = new ContextCheck(
    "The element has a non-default mix blend mode value",
    (element, styles) => {
        if (styles.mixBlendMode !== "normal") {
            return true;
        }
        return false;
    }
);

export const notNoneProperties = new ContextCheck(
    "The element has one of the following properties set: transform, filter, perspective, clip-path, mask, maskImage, maskBorder",
    (element, styles) => {
        let toCheck = [
            styles.transform,
            styles.filter,
            styles.perspective,
            styles.clipPath,
            styles.mask, styles.webkitMask,
            styles.maskImage, styles.webkitMaskImage,
            styles.maskBorder, styles.webkitMaskBoxImage
        ];
        return toCheck.some( (prop) => prop !== undefined && prop !== "none" && prop !== "" );
    }
);

export const isolationSet = new ContextCheck(
    "The element has the isolation property set to 'isolate'",
    (element, styles) => styles.isolation == "isolate"
);

export const webkitOverflowScrolling = new ContextCheck(
    "The element has the webkit-overflow-scrolling property set to 'touch'",
    (element, styles) => styles.webkitOverflowScrolling == "touch"
);

export const willChange = new ContextCheck(
    "The element has a will-change value with a property that will create a context when its value is not the default one",
    (element, styles) => {
        let toCheck = ["mix-blend-mode",
            "transform",
            "filter",
            "perspective",
            "clip-path",
            "mask", "-webkit-mask",
            "mask-image", "-webkit-mask-image",
            "mask-border", "-webkit-mask-box-image"
        ]
        return toCheck.some( (prop) => styles.willChange.includes(prop) );
    }
);

export const containValue = new ContextCheck(
    "The element has a contain value that includes one of the following: layout, paint (or a composite value like 'strict' or 'content')",
    (element, styles) => {
        let toCheck = ["layout", "paint", "strict", "content"];
        return toCheck.some( (prop) => styles.contain.includes(prop) );
    }
);

export const flexChildWithZIndex = new ContextCheck(
    "This element is a child of a flex container and has a z-index set",
    (element, styles) => {
        if (element.parentElement) {
            let parentStyles = window.getComputedStyle(element.parentElement);

            if (parentStyles.display == "flex" && styles.zIndex !== "auto") {
                return true;
            }
        }
        return false;
    }
);

export const gridChildWithZIndex = new ContextCheck(
    "This element is a child of a grid container and has a z-index set",
    (element, styles) => {
        if (element.parentElement) {
            let parentStyles = window.getComputedStyle(element.parentElement);

            if (parentStyles.display == "grid" && styles.zIndex !== "auto") {
                return true;
            }
        }
        return false;
    }
);

/**
 * A list of checks that will be fired on the elements.
 */
export const activeChecks = [
    positionFixedSticky,
    zIndexWithPosition,
    containerTypeisSizeOrInlineSize,
    notFullOpacity,
    mixBlendMode,
    notNoneProperties,
    isolationSet,
    webkitOverflowScrolling,
    willChange,
    containValue,
    flexChildWithZIndex,
    gridChildWithZIndex
];
