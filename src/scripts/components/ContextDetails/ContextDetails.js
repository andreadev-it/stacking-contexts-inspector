import { h, Fragment } from 'preact';

const ContextDetails = ({context}) => (
    <>
    {
        context && context.passedChecks.length > 0 && (
            <ul>
                {
                    context.passedChecks.map( (check) => (
                        <li>
                            {check}
                        </li>
                    ))
                }
            </ul>
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

export default ContextDetails;