import TextField from '@material-ui/core/TextField';
import React from 'react';


const TextFields = (props) => {

    return (
        <TextField
            variant='outlined'
            margin='normal'
            required={props.required}
            fullWidth
            name={props.name}
            label={props.label}
            id={props.id}
            autoComplete={props.autoComplete}
            onChange={() =>props.onChange}
            error={props.error}
        />
    )
};

export default TextFields;