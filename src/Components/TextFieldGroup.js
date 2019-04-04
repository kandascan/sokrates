import React from 'react';
import PropTypes from 'prop-types';

const TextFieldGroup = ({
    id,
    placeholder,
    type,
    onChange,
    value
}) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{placeholder} </label>
            <input type={type} className="form-control" id={id} placeholder={placeholder} onChange={onChange} value={value} />
        </div>
    );
};

TextFieldGroup.propTypes = {
    id: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
}

TextFieldGroup.defaultProps = {
    type: 'text',
}

export default TextFieldGroup;