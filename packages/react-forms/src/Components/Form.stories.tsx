import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Validators, FormBuilder, ControlModels } from '@hubfx/forms';
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
      formConfig={FormBuilder.control({
        initialValue: 'john',
      })}
    >
      {({ state }) => {
        return (
          <>
            <Field controlRef={[]} component={Input} />
            <div>
              First Name: <span>{state.value as string}</span>
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
      formConfig={FormBuilder.group({
        controls: {
          firstName: FormBuilder.control({
            initialValue: 'John',
            validators: [Validators.required],
          }),
          lastName: FormBuilder.control({
            initialValue: '',
            validators: [Validators.required],
          }),
        },
      })}
    >
      {() => {
        return (
          <div className="form-group">
            <Field
              controlRef={['firstName']}
              component={Input}
              label="First Name (required)"
            />
            <Field
              controlRef={['lastName']}
              component={Input}
              label="Last Name (required)"
            />
          </div>
        );
      }}
    </Form>
  ),
};

const contactFormConfig = ({ firstName, lastName, email }: Contact) =>
  FormBuilder.group({
    controls: {
      firstName: FormBuilder.control({
        initialValue: firstName,
        validators: [Validators.required],
      }),
      lastName: FormBuilder.control({
        initialValue: lastName,
        validators: [Validators.required],
      }),
      email: FormBuilder.control({
        initialValue: email,
        validators: [Validators.required, Validators.email],
        asyncValidators: [blacklistedEmail],
      }),
    },
  });

export const AsyncValidation: Story = {
  render: () => (
    <Form
      formConfig={contactFormConfig({
        firstName: 'John',
        lastName: 'Doe',
        email: '',
      })}
    >
      {({ state }) => {
        return (
          <ContactForm formGroup={state as ControlModels.FormGroup<Contact>} />
        );
      }}
    </Form>
  ),
};

export const FormArrays: Story = {
  render: () => (
    <Form
      formConfig={FormBuilder.group({
        controls: {
          emergencyContacts: FormBuilder.array({
            validators: [arrayLengthRequired],
            controls: [
              {
                firstName: 'Homer',
                lastName: 'Simpson',
                email: 'homer@homer.com',
              },
            ].map(contactFormConfig),
          }),
        },
      })}
    >
      {() => {
        return (
          <div className="form-group">
            <p>
              <b>Emergency Contacts:</b>
            </p>
            <FormArray controlRef={['emergencyContacts']}>
              {({
                formArray: {
                  controls,
                  errors: { arrayLengthRequired },
                },
                addControl,
                removeControl,
              }) => (
                <>
                  {arrayLengthRequired && (
                    <p className="text-danger">
                      At least one emergency contact required.
                    </p>
                  )}
                  {controls.map((control, index) => {
                    return (
                      <div key={control.controlRef.join(',')}>
                        <p>
                          <b>Contact #{index + 1}:</b>
                        </p>
                        <div className="d-flex align-items-center">
                          <ContactForm
                            formGroup={
                              control as ControlModels.FormGroup<Contact>
                            }
                          />
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
                        contactFormConfig({
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
      formConfig={FormBuilder.group(
        contactFormConfig({
          firstName: 'Bart',
          lastName: 'Simpson',
          email: 'bart@man.com',
        }),
      )}
    >
      {({ state, resetControl }) => (
        <>
          <ContactForm formGroup={state as ControlModels.FormGroup<Contact>} />
          <button
            type="button"
            onClick={() => {
              resetControl(state.controlRef);
            }}
          >
            Reset Form
          </button>
        </>
      )}
    </Form>
  ),
};
