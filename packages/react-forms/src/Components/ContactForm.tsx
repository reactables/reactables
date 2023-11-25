import React from 'react';
import { Input } from './Input';
import { Field } from './Field';

export interface ContactFormProps {
  name?: string;
}

export const ContactForm = ({ name }: ContactFormProps) => (
  <div className="form-group">
    <Field name={`${name ? `${name}.` : ''}firstName`} component={Input} label="First Name" />
    <Field name={`${name ? `${name}.` : ''}lastName`} component={Input} label="Last Name" />
    <Field
      name={`${name ? `${name}.` : ''}email`}
      component={Input}
      label={
        <span>
          Email <i>(not@allowed.com is blacklisted)</i>
        </span>
      }
    />
  </div>
);
