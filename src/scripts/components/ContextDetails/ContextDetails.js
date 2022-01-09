import { h, Fragment } from 'preact';

const ContextDetails = ({context}) => {
    return (
    <>
    {
        context && context.passedChecks?.length > 0 && (
            <>
                <div>
                    <b>Z-index value</b>: {context.element.styles.zIndex}
                </div>
                <ul>
                    {
                        context.passedChecks.map( (check) => (
                            <li>
                                {check}
                            </li>
                        ))
                    }
                </ul>
            </>
        )
    }
    {
        context && context.passedChecks?.length == 0 && (
            <>
                This is just a container
            </>
        )
    }
        </>
    );
}

export default ContextDetails;
