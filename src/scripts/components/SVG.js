import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

/** Get the single svg element from a string that may contain also other elements */
function svgFromString(html) {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.cloneNode(true).querySelector('svg');
}

/** Get the svg element as a string from a file source */
async function getSVGHTML(src) {
    let file = await fetch(src);
    let content = await file.text();
    let SVGElement = svgFromString(content);
    return SVGElement.outerHTML;
}

/** Creates an inline SVG from a source */
const SVG = ({src, ...props}) => {

    let [SVGHTML, setSVGHTML] = useState("");
    
    useEffect( async () => {
        let HTML = await getSVGHTML(src);
        setSVGHTML(HTML);
    }, [src]);

    return (
        <i dangerouslySetInnerHTML={{__html: SVGHTML}} {...props} ></i>
    )
}

export default SVG;