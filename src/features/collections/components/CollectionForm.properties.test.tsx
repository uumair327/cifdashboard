/**
 * Property-based tests for CollectionForm component
 * Feature: dashboard-redesign
 */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { CollectionForm, FormFieldConfig } from './CollectionForm';
import { CollectionType } from '../domain/entities/Collection';

/**
 * Property 14: Form validation blocking
 * Validates: Requirements 5.2
 * 
 * For any form submission where required fields are missing or invalid,
 * the submission should be prevented and validation errors should be displayed
 * for each invalid field.
 */
describe('CollectionForm - Property 14: Form validation blocking', () => {
  it('should prevent submission when required fields are missing', () => {
    fc.assert(
      fc.property(
        // Generate a simple required field
        fc.record({
          fieldName: fc.constantFrom('testField', 'nameField', 'titleField'),
          fieldLabel: fc.constantFrom('Test Field', 'Name', 'Title'),
        }),
        ({ fieldName, fieldLabel }) => {
          const fields: FormFieldConfig[] = [
            {
              name: fieldName,
              label: fieldLabel,
              type: 'text',
              required: true,
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Leave field empty and try to submit
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // onSubmit should NOT have been called
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should prevent submission when email fields have invalid formats', () => {
    fc.assert(
      fc.property(
        // Generate invalid email strings
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
        (invalidEmail) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'emailField',
              label: 'Email',
              type: 'email',
              required: true,
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Enter invalid email
          const input = container.querySelector('#emailField') as HTMLInputElement;
          fireEvent.change(input, { target: { value: invalidEmail } });
          fireEvent.blur(input);

          // Try to submit
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // onSubmit should NOT have been called
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should prevent submission when number fields violate min/max constraints', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -1000, max: -1 }), // Generate numbers below 0
        (invalidValue) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'numberField',
              label: 'Number Field',
              type: 'number',
              required: true,
              validation: { min: 0, max: 100 },
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Enter invalid number
          const input = container.querySelector('#numberField') as HTMLInputElement;
          fireEvent.change(input, { target: { value: invalidValue.toString() } });
          fireEvent.blur(input);

          // Try to submit
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // onSubmit should NOT have been called
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should allow submission only when all validations pass', () => {
    fc.assert(
      fc.property(
        fc.record({
          textValue: fc.string({ minLength: 1, maxLength: 50 }),
          emailValue: fc.emailAddress(),
          numberValue: fc.integer({ min: 1, max: 100 }),
        }),
        ({ textValue, emailValue, numberValue }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'textField',
              label: 'Text Field',
              type: 'text',
              required: true,
            },
            {
              name: 'emailField',
              label: 'Email Field',
              type: 'email',
              required: true,
            },
            {
              name: 'numberField',
              label: 'Number Field',
              type: 'number',
              required: true,
              validation: { min: 1, max: 100 },
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Fill all fields with valid data
          const textInput = container.querySelector('#textField') as HTMLInputElement;
          const emailInput = container.querySelector('#emailField') as HTMLInputElement;
          const numberInput = container.querySelector('#numberField') as HTMLInputElement;

          fireEvent.change(textInput, { target: { value: textValue } });
          fireEvent.blur(textInput);

          fireEvent.change(emailInput, { target: { value: emailValue } });
          fireEvent.blur(emailInput);

          fireEvent.change(numberInput, { target: { value: numberValue.toString() } });
          fireEvent.blur(numberInput);

          // Submit the form
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // onSubmit SHOULD have been called with valid data
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              textField: textValue,
              emailField: emailValue,
              numberField: numberValue.toString(),
            })
          );

          // Verify no error messages are displayed
          const errorMessages = container.querySelectorAll('.text-red-600');
          expect(errorMessages.length).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property 16: Real-time validation feedback
 * Validates: Requirements 5.4
 * 
 * For any form field with validation rules, entering invalid data should
 * immediately trigger validation error messages without requiring form submission.
 */
describe('CollectionForm - Property 16: Real-time validation feedback', () => {
  it('should show validation errors immediately on blur for invalid email', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
        (invalidEmail) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'emailField',
              label: 'Email',
              type: 'email',
              required: true,
            },
          ];

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={vi.fn()}
            />
          );

          const input = container.querySelector('#emailField') as HTMLInputElement;
          
          // Initially no error should be shown
          let errorElement = container.querySelector('.text-red-600');
          expect(errorElement).toBeNull();

          // Enter invalid email and blur
          fireEvent.change(input, { target: { value: invalidEmail } });
          fireEvent.blur(input);

          // Error should now be visible immediately
          errorElement = container.querySelector('.text-red-600');
          expect(errorElement).not.toBeNull();
          expect(errorElement?.textContent).toContain('email');
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should clear validation errors when field becomes valid', () => {
    fc.assert(
      fc.property(
        fc.record({
          invalidEmail: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
          validEmail: fc.emailAddress(),
        }),
        ({ invalidEmail, validEmail }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'emailField',
              label: 'Email',
              type: 'email',
              required: true,
            },
          ];

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={vi.fn()}
            />
          );

          const input = container.querySelector('#emailField') as HTMLInputElement;

          // Enter invalid email and blur to trigger error
          fireEvent.change(input, { target: { value: invalidEmail } });
          fireEvent.blur(input);

          // Error should be visible
          let errorElement = container.querySelector('.text-red-600');
          expect(errorElement).not.toBeNull();

          // Now enter valid email
          fireEvent.change(input, { target: { value: validEmail } });

          // Error should be cleared immediately (without needing blur)
          errorElement = container.querySelector('.text-red-600');
          expect(errorElement).toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should show validation errors for required fields on blur', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('textField', 'nameField', 'titleField'),
        (fieldName) => {
          const fields: FormFieldConfig[] = [
            {
              name: fieldName,
              label: 'Required Field',
              type: 'text',
              required: true,
            },
          ];

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={vi.fn()}
            />
          );

          const input = container.querySelector(`#${fieldName}`) as HTMLInputElement;

          // Initially no error
          let errorElement = container.querySelector('.text-red-600');
          expect(errorElement).toBeNull();

          // Blur without entering anything
          fireEvent.blur(input);

          // Error should appear immediately
          errorElement = container.querySelector('.text-red-600');
          expect(errorElement).not.toBeNull();
          expect(errorElement?.textContent).toContain('required');
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should show validation errors for number constraints on blur', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 101, max: 1000 }), // Numbers above max
        (invalidNumber) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'numberField',
              label: 'Number',
              type: 'number',
              required: true,
              validation: { min: 1, max: 100 },
            },
          ];

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={vi.fn()}
            />
          );

          const input = container.querySelector('#numberField') as HTMLInputElement;

          // Initially no error
          let errorElement = container.querySelector('.text-red-600');
          expect(errorElement).toBeNull();

          // Enter invalid number and blur
          fireEvent.change(input, { target: { value: invalidNumber.toString() } });
          fireEvent.blur(input);

          // Error should appear immediately
          errorElement = container.querySelector('.text-red-600');
          expect(errorElement).not.toBeNull();
          expect(errorElement?.textContent).toMatch(/at most|must be/i);
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property 15: Successful form submission persistence
 * Validates: Requirements 5.3
 * 
 * For any valid form data, successful submission should result in a new item
 * appearing in the collection with field values matching the submitted form data.
 */
describe('CollectionForm - Property 15: Successful form submission persistence', () => {
  it('should call onSubmit with correct data for valid text fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 500 }),
        }),
        ({ title, description }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Fill form with valid data
          const titleInput = container.querySelector('#title') as HTMLInputElement;
          const descInput = container.querySelector('#description') as HTMLTextAreaElement;

          fireEvent.change(titleInput, { target: { value: title } });
          fireEvent.change(descInput, { target: { value: description } });

          // Submit form
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // Verify onSubmit was called with exact data
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              title,
              description,
            })
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should call onSubmit with correct data for mixed field types', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          age: fc.integer({ min: 1, max: 120 }),
          active: fc.boolean(),
        }),
        ({ name, email, age, active }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
            },
            {
              name: 'age',
              label: 'Age',
              type: 'number',
              required: true,
              validation: { min: 1, max: 120 },
            },
            {
              name: 'active',
              label: 'Active',
              type: 'checkbox',
            },
          ];

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
            />
          );

          // Fill form
          const nameInput = container.querySelector('#name') as HTMLInputElement;
          const emailInput = container.querySelector('#email') as HTMLInputElement;
          const ageInput = container.querySelector('#age') as HTMLInputElement;
          const activeInput = container.querySelector('#active') as HTMLInputElement;

          fireEvent.change(nameInput, { target: { value: name } });
          fireEvent.change(emailInput, { target: { value: email } });
          fireEvent.change(ageInput, { target: { value: age.toString() } });
          fireEvent.change(activeInput, { target: { checked: active } });

          // Submit form
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // Verify data matches exactly
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              name,
              email,
              age: age.toString(),
              active,
            })
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should preserve initial data in edit mode and merge with changes', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialTitle: fc.string({ minLength: 1, maxLength: 50 }),
          initialDescription: fc.string({ minLength: 1, maxLength: 100 }),
          newTitle: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ initialTitle, initialDescription, newTitle }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
              required: true,
            },
          ];

          const initialData = {
            id: 'test-id',
            title: initialTitle,
            description: initialDescription,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const onSubmit = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={initialData}
              onSubmit={onSubmit}
            />
          );

          // Only change title, leave description as is
          const titleInput = container.querySelector('#title') as HTMLInputElement;
          fireEvent.change(titleInput, { target: { value: newTitle } });

          // Submit form
          const form = container.querySelector('form');
          if (form) {
            fireEvent.submit(form);
          }

          // Should have new title but original description
          expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
              title: newTitle,
              description: initialDescription,
            })
          );
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property 17: Form cancellation state preservation
 * Validates: Requirements 5.5
 * 
 * For any collection state before opening a form, canceling the form without
 * submission should leave the collection in exactly the same state
 * (no items added, modified, or deleted).
 */
describe('CollectionForm - Property 17: Form cancellation state preservation', () => {
  it('should call onCancel without calling onSubmit when cancel is clicked', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          description: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        ({ title, description }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
              required: true,
            },
          ];

          const onSubmit = vi.fn();
          const onCancel = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          );

          // Fill form with data
          const titleInput = container.querySelector('#title') as HTMLInputElement;
          const descInput = container.querySelector('#description') as HTMLInputElement;

          fireEvent.change(titleInput, { target: { value: title } });
          fireEvent.change(descInput, { target: { value: description } });

          // Click cancel button
          const cancelButton = Array.from(container.querySelectorAll('button')).find(
            btn => btn.textContent === 'Cancel'
          );
          if (cancelButton) {
            fireEvent.click(cancelButton);
          }

          // onCancel should be called, onSubmit should NOT
          expect(onCancel).toHaveBeenCalled();
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should call onCancel even with validation errors present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)),
        (invalidEmail) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
            },
          ];

          const onSubmit = vi.fn();
          const onCancel = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          );

          // Enter invalid email to trigger validation error
          const emailInput = container.querySelector('#email') as HTMLInputElement;
          fireEvent.change(emailInput, { target: { value: invalidEmail } });
          fireEvent.blur(emailInput);

          // Verify error is shown
          const errorElement = container.querySelector('.text-red-600');
          expect(errorElement).not.toBeNull();

          // Click cancel button
          const cancelButton = Array.from(container.querySelectorAll('button')).find(
            btn => btn.textContent === 'Cancel'
          );
          if (cancelButton) {
            fireEvent.click(cancelButton);
          }

          // onCancel should still be called despite validation errors
          expect(onCancel).toHaveBeenCalled();
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should call onCancel in edit mode without modifying data', () => {
    fc.assert(
      fc.property(
        fc.record({
          originalTitle: fc.string({ minLength: 1, maxLength: 50 }),
          originalDesc: fc.string({ minLength: 1, maxLength: 100 }),
          newTitle: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        ({ originalTitle, originalDesc, newTitle }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'text',
              required: true,
            },
          ];

          const initialData = {
            id: 'test-id',
            title: originalTitle,
            description: originalDesc,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const onSubmit = vi.fn();
          const onCancel = vi.fn();
          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={initialData}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          );

          // Modify the title
          const titleInput = container.querySelector('#title') as HTMLInputElement;
          fireEvent.change(titleInput, { target: { value: newTitle } });

          // Click cancel
          const cancelButton = Array.from(container.querySelectorAll('button')).find(
            btn => btn.textContent === 'Cancel'
          );
          if (cancelButton) {
            fireEvent.click(cancelButton);
          }

          // onCancel should be called, onSubmit should NOT
          // This ensures changes are discarded
          expect(onCancel).toHaveBeenCalled();
          expect(onSubmit).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property 12: Edit form data population
 * Validates: Requirements 4.2
 * 
 * For any item in a collection, opening the edit form should populate all
 * form fields with values that exactly match the item's current data.
 */
describe('CollectionForm - Property 12: Edit form data population', () => {
  it('should populate text fields with initial data', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          description: fc.string({ minLength: 1, maxLength: 500 }),
        }),
        ({ title, description }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
            },
          ];

          const initialData = {
            id: 'test-id',
            title,
            description,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={initialData}
              onSubmit={vi.fn()}
            />
          );

          // Verify fields are populated with exact initial values
          const titleInput = container.querySelector('#title') as HTMLInputElement;
          const descInput = container.querySelector('#description') as HTMLTextAreaElement;

          expect(titleInput.value).toBe(title);
          expect(descInput.value).toBe(description);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should populate mixed field types with initial data', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          age: fc.integer({ min: 1, max: 120 }),
          active: fc.boolean(),
        }),
        ({ name, email, age, active }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
            },
            {
              name: 'age',
              label: 'Age',
              type: 'number',
              required: true,
            },
            {
              name: 'active',
              label: 'Active',
              type: 'checkbox',
            },
          ];

          const initialData = {
            id: 'test-id',
            name,
            email,
            age,
            active,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { container } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={initialData}
              onSubmit={vi.fn()}
            />
          );

          // Verify all fields are populated correctly
          const nameInput = container.querySelector('#name') as HTMLInputElement;
          const emailInput = container.querySelector('#email') as HTMLInputElement;
          const ageInput = container.querySelector('#age') as HTMLInputElement;
          const activeInput = container.querySelector('#active') as HTMLInputElement;

          expect(nameInput.value).toBe(name);
          expect(emailInput.value).toBe(email);
          expect(ageInput.value).toBe(age.toString());
          expect(activeInput.checked).toBe(active);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should update form fields when initialData changes', () => {
    fc.assert(
      fc.property(
        fc.record({
          firstTitle: fc.string({ minLength: 1, maxLength: 50 }),
          secondTitle: fc.string({ minLength: 1, maxLength: 50 }),
        }).filter(({ firstTitle, secondTitle }) => firstTitle !== secondTitle),
        ({ firstTitle, secondTitle }) => {
          const fields: FormFieldConfig[] = [
            {
              name: 'title',
              label: 'Title',
              type: 'text',
              required: true,
            },
          ];

          const firstData = {
            id: 'test-id-1',
            title: firstTitle,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { container, rerender } = render(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={firstData}
              onSubmit={vi.fn()}
            />
          );

          // Verify first data is populated
          let titleInput = container.querySelector('#title') as HTMLInputElement;
          expect(titleInput.value).toBe(firstTitle);

          // Update with second data
          const secondData = {
            id: 'test-id-2',
            title: secondTitle,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          rerender(
            <CollectionForm
              collectionType={'carousel_items' as CollectionType}
              fields={fields}
              initialData={secondData}
              onSubmit={vi.fn()}
            />
          );

          // Verify field updated to second data
          titleInput = container.querySelector('#title') as HTMLInputElement;
          expect(titleInput.value).toBe(secondTitle);
        }
      ),
      { numRuns: 20 }
    );
  });
});
