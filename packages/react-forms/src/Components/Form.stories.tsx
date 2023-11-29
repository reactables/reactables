import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Validators, RxForm } from '@reactables/forms';
import { Form } from './Form';
import { Field } from './Field';
import { Input } from './Input';
import { ContactForm } from './ContactForm';
import { blacklistedEmail } from '../Testing/AsyncValidators/blacklistedEmail';
import { arrayLengthRequired } from '../Testing/Validators/arrayLengthRequired';
import { FormArray } from './FormArray';
import { Contact } from '../Testing/Models/Contact';

const meta: Meta<typeof Form> = {
  component: Form,
};

export default meta;
type Story = StoryObj<typeof Form>;

export const BasicControl: Story = {
  render: () => (
    <Form
      formConfig={RxForm.control({
        initialValue: 'john',
      })}
    >
      {({ state }) => {
        return (
          <>
            <Field component={Input} />
            <div>
              First Name: <span>{state.root.value as string}</span>
            </div>
          </>
        );
      }}
    </Form>
  ),
};

export const Validation: Story = {
  render: () => (
    <Form
      formConfig={RxForm.group({
        controls: {
          firstName: RxForm.control({
            initialValue: 'John',
            validators: [Validators.required],
          }),
          lastName: RxForm.control({
            initialValue: '',
            validators: [Validators.required],
          }),
        },
      })}
    >
      {() => {
        return (
          <div className="form-group">
            <Field name="firstName" component={Input} label="First Name (required)" />
            <Field name="lastName" component={Input} label="Last Name (required)" />
          </div>
        );
      }}
    </Form>
  ),
};

const contactRxForm = ({ firstName, lastName, email }: Contact) =>
  RxForm.group({
    controls: {
      firstName: RxForm.control({
        initialValue: firstName,
        validators: [Validators.required],
      }),
      lastName: RxForm.control({
        initialValue: lastName,
        validators: [Validators.required],
      }),
      email: RxForm.control({
        initialValue: email,
        validators: [Validators.required, Validators.email],
        asyncValidators: [blacklistedEmail],
      }),
    },
  });

export const AsyncValidation: Story = {
  render: () => (
    <Form
      formConfig={contactRxForm({
        firstName: 'John',
        lastName: 'Doe',
        email: '',
      })}
    >
      {() => {
        return <ContactForm />;
      }}
    </Form>
  ),
};

export const FormArrays: Story = {
  render: () => (
    <Form
      formConfig={RxForm.group({
        controls: {
          emergencyContacts: RxForm.array({
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
      })}
    >
      {({ state }) => {
        return (
          <div className="form-group">
            <p>
              <b>Emergency Contacts:</b>
            </p>
            <FormArray name="emergencyContacts">
              {({ items, addControl, removeControl }) => (
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
                      addControl(
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
        );
      }}
    </Form>
  ),
};

export const ResetForm: Story = {
  render: () => (
    <Form
      formConfig={RxForm.group(
        contactRxForm({
          firstName: 'Bart',
          lastName: 'Simpson',
          email: 'bart@man.com',
        }),
      )}
    >
      {({ state, actions: { resetControl } }) => (
        <>
          <button
            type="button"
            onClick={() => {
              resetControl(state.root.controlRef);
            }}
          >
            Reset Form
          </button>
          <ContactForm />
        </>
      )}
    </Form>
  ),
};
