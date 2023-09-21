import React from 'react';
import { ControlModels } from '@hubfx/forms';
import { Input } from './Input';
import { Contact } from '../Testing/Models/Contact';
import { Field } from './Field';

export interface ContactFormProps {
  formGroup: ControlModels.FormGroup<Contact>;
}

export const ContactForm = ({
  formGroup: { controlRef },
}: ContactFormProps) => (
  <div className="form-group">
    <Field
      controlRef={controlRef.concat('firstName')}
      component={Input}
      label="First Name"
    />
    <Field
      controlRef={controlRef.concat('lastName')}
      component={Input}
      label="Last Name"
    />
    <Field
      controlRef={controlRef.concat('email')}
      component={Input}
      label={
        <span>
          Email <i>(not@allowed.com is blacklisted)</i>
        </span>
      }
    />
  </div>
);
