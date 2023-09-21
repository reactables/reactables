import React from 'react';
import { WrappedFieldProps } from './Field';

export interface InputProps extends WrappedFieldProps {
  label?: string | React.ReactElement;
}

export const Input = ({
  input,
  meta: { touched, errors, pending, valid },
  label,
}: InputProps) => {
  return (
    <div className="mb-3">
      {label && (
        <label
          className={`form-label ${touched && !valid ? 'text-danger' : ''}`}
        >
          {label}
        </label>
      )}
      <input
        {...input}
        type="text"
        className={`form-control ${
          (touched && !valid) || errors.blacklistedEmail ? 'is-invalid' : ''
        }`}
      />
      {touched && errors.required && (
        <div>
          <small className="text-danger">Field is required</small>
        </div>
      )}
      {touched && errors.email && (
        <div>
          <small className="text-danger">Not a valid email address</small>
        </div>
      )}
      {errors.blacklistedEmail && (
        <div>
          <small className="text-danger">
            This email has been blacklisted.
          </small>
        </div>
      )}
      {pending && (
        <div>
          <small className="text-warning">Pending</small>
        </div>
      )}
    </div>
  );
};
