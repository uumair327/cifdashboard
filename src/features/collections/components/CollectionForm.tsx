/**
 * CollectionForm component
 * Dynamic form generator for collection items with validation
 */
import { useState, useEffect } from 'react';
import { BaseCollection, CollectionType } from '../domain/entities/Collection';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'url' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    message?: string;
    custom?: (value: any) => string | null;
  };
}

interface CollectionFormProps<T extends BaseCollection> {
  collectionType: CollectionType;
  fields: FormFieldConfig[];
  initialData?: Partial<T>;
  onSubmit: (data: Partial<T>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function CollectionForm<T extends BaseCollection>({
  collectionType: _collectionType,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
}: CollectionFormProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Validate a single field
  const validateField = (field: FormFieldConfig, value: any): string | null => {
    // Required validation
    if (field.required) {
      if (value === undefined || value === null || value === '') {
        return `${field.label} is required`;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return `${field.label} is required`;
      }
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Type-specific validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'url') {
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
    }

    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `Value must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `Value must be at most ${field.validation.max}`;
      }
    }

    // String length validation
    if (typeof value === 'string') {
      if (field.validation?.minLength !== undefined && value.length < field.validation.minLength) {
        return `Must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation?.maxLength !== undefined && value.length > field.validation.maxLength) {
        return `Must be at most ${field.validation.maxLength} characters`;
      }
    }

    // Pattern validation
    if (field.validation?.pattern && typeof value === 'string') {
      if (!field.validation.pattern.test(value)) {
        return field.validation.message || 'Invalid format';
      }
    }

    // Custom validation
    if (field.validation?.custom) {
      const customError = field.validation.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle field blur - validate on blur
  const handleFieldBlur = (field: FormFieldConfig) => {
    setTouched(prev => ({
      ...prev,
      [field.name]: true,
    }));

    // Validate field on blur
    const error = validateField(field, formData[field.name]);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [field.name]: error,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as Partial<T>);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is disabled
  const isDisabled = loading || isSubmitting;

  // Render field based on type
  const renderField = (field: FormFieldConfig) => {
    const fieldValue = formData[field.name] ?? '';
    const fieldError = touched[field.name] ? errors[field.name] : undefined;

    const baseInputClasses = `
      block w-full px-3 py-2 border rounded-md shadow-sm 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${fieldError ? 'border-red-300' : 'border-gray-300'}
      ${isDisabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
    `.trim();

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isDisabled}
            rows={4}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            id={field.name}
            name={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            required={field.required}
            disabled={isDisabled}
            className={baseInputClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={field.name}
              name={field.name}
              type="checkbox"
              checked={Boolean(fieldValue)}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              onBlur={() => handleFieldBlur(field)}
              disabled={isDisabled}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
              {field.label}
            </label>
          </div>
        );

      default:
        return (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isDisabled}
            min={field.validation?.min}
            max={field.validation?.max}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(field => (
        <div key={field.name}>
          {field.type !== 'checkbox' && (
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
          {touched[field.name] && errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={isDisabled}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
