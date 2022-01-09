import { h, Fragment } from "preact";
import SVG from '../SVG';
import CheckIcon from '../../../icons/check.svg';
import WrongIcon from '../../../icons/wrong.svg';

const NodeDetails = ({node}) => {
    
    let description = "There is no element currently selected. Please inspect an element or select one from the elements panel.";
    let additionalInfo = null;

    if (node) {

        if (node.createsContext) {
            description = (
                <span>Is z-index working: <SVG src={CheckIcon} className="inline-icon" title="z-index is working"/></span>
            );
            // description = "z-index: working";
            additionalInfo = "The z-index property is correctly working in this element. If the result isn't what you are expecting, please head over to the stacking context panel.";
        }

        if (!node.createsContext && node.zIndex !== "auto") {
            description = (
                <span>Is z-index working: <SVG src={WrongIcon} className="inline-icon" title="z-index is not working"/></span>
            );
            // description = "z-index: not working";
            additionalInfo = "The z-index property is set, but it's not working because this element does not create a new stacking context.";
        }
        else if (!node.createsContext) {
            description = "This element does not create a stacking context."
        }
    }

    return (
        <div id={(node?.contextId) ? `context-${node.contextId}` : ''}>
            <p>{description}</p>
            {
                additionalInfo && (
                    <details>
                        <summary>Info</summary>
                        <span>{additionalInfo}</span>
                    </details>
                )
            }
        </div>
    );
}

export default NodeDetails;
