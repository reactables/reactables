import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Validators, group, control, array } from '@reactables/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { ContactForm } from './ContactForm';
import { blacklistedEmail } from '../Testing/AsyncValidators/blacklistedEmail';
import { arrayLengthRequired } from '../Testing/Validators/arrayLengthRequired';
import { FormArray } from './FormArray';
import { Contact } from '../Testing/Models/Contact';
import { useForm } from '../Hooks/useForm';

const meta: Meta<typeof Form> = {
  component: Form,
};

export default meta;
type Story = StoryObj<typeof Form>;

const BasicControlExample = () => {
  const rxForm = useForm(
    control({
      initialValue: 'john',
    }),
  );
  const [state] = rxForm;

  return (
    <Form rxForm={rxForm}>
      <Field component={Input} />
      <div>
        First Name: <span>{state?.root.value as string}</span>
      </div>
    </Form>
  );
};

export const BasicControl: Story = {
  render: () => <BasicControlExample />,
};

const ValidationExample = () => {
  const rxForm = useForm(
    group({
      controls: {
        firstName: control({
          initialValue: 'John',
          validators: [Validators.required],
        }),
        lastName: control({
          initialValue: '',
          validators: [Validators.required],
        }),
      },
    }),
  );

  return (
    <Form rxForm={rxForm}>
      <div className="form-group">
        <Field name="firstName" component={Input} label="First Name (required)" />
        <Field name="lastName" component={Input} label="Last Name (required)" />
      </div>
    </Form>
  );
};

export const Validation: Story = {
  render: () => <ValidationExample />,
};

const contactRxForm = ({ firstName, lastName, email }: Contact) =>
  group({
    controls: {
      firstName: control({
        initialValue: firstName,
        validators: [Validators.required],
      }),
      lastName: control({
        initialValue: lastName,
        validators: [Validators.required],
      }),
      email: control({
        initialValue: email,
        validators: [Validators.required, Validators.email],
        asyncValidators: [blacklistedEmail],
      }),
    },
  });

const AsyncValidationExample = () => {
  const rxForm = useForm(
    contactRxForm({
      firstName: 'John',
      lastName: 'Doe',
      email: '',
    }),
  );

  return (
    <Form rxForm={rxForm}>
      <ContactForm />
    </Form>
  );
};

export const AsyncValidation: Story = {
  render: () => <AsyncValidationExample />,
};

const FormArraysExample = () => {
  const rxForm = useForm(
    group({
      controls: {
        emergencyContacts: array({
          validators: [arrayLengthRequired],
          controls: [
            {
              firstName: 'Homer',
              lastName: 'Simpson',
              email: 'homer@homer.com',
            },
          ].map(contactRxForm),
        }),
      },
    }),
  );

  const [state] = rxForm;

  return (
    <Form rxForm={rxForm}>
      <div className="form-group">
        <p>
          <b>Emergency Contacts:</b>
        </p>
        <FormArray name="emergencyContacts">
          {({ items, pushControl, removeControl }) => (
            <>
              {state.emergencyContacts.errors.arrayLengthRequired && (
                <p className="text-danger">At least one emergency contact required.</p>
              )}
              {items.map((control, index) => {
                return (
                  <div key={control.controlRef.join(',')}>
                    <p>
                      <b>Contact #{index + 1}:</b>
                    </p>
                    <div className="d-flex align-items-center">
                      <ContactForm name={`emergencyContacts.${index}`} />
                      <button
                        className="ml-5"
                        type="button"
                        onClick={() => {
                          removeControl(control.controlRef);
                        }}
                      >
                        Remove Contact
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  pushControl(
                    contactRxForm({
                      firstName: '',
                      lastName: '',
                      email: '',
                    }),
                  );
                }}
              >
                Add Contact
              </button>
            </>
          )}
        </FormArray>
      </div>
    </Form>
  );
};

export const FormArrays: Story = {
  render: () => <FormArraysExample />,
};

const ResetFormExample = () => {
  const rxForm = useForm(
    group(
      contactRxForm({
        firstName: 'Bart',
        lastName: 'Simpson',
        email: 'bart@man.com',
      }),
    ),
  );

  const [state, { resetControl }] = rxForm;

  return (
    <Form rxForm={rxForm}>
      <button
        type="button"
        onClick={() => {
          resetControl(state.root.controlRef);
        }}
      >
        Reset Form
      </button>
      <ContactForm />
    </Form>
  );
};

export const ResetForm: Story = {
  render: () => <ResetFormExample />,
};
