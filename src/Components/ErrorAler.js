import React from 'react'

function ErrorAler(props) {
    const { status, message } = props.error;
    return (
        <div className="alert alert-danger" role="alert">
            <span>Kod błędu: {status}</span> - {message}
        </div>
    )
}

export default ErrorAler;
