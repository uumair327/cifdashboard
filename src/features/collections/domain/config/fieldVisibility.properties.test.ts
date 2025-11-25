/**
 * Property-based tests for Field Visibility Configuration
 * Feature: dashboard-redesign
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getVisibleFields,
  isFieldHidden,
  filterEmptyFields,
  FIELD_CONFIGS,
} from './fieldVisibility';
import { CollectionType } from '../entities/Collection';

// All collection types for testing
const collectionTypes: CollectionType[] = [
  'carousel_items',
  'home_images',
  'forum',
  'learn',
  'quizes',
  'quiz_questions',
  'videos',
];

describe('Field Visibility Properties', () => {
  describe('Property 4: Default field visibility enforcement', () => {
    /**
     * Feature: dashboard-redesign, Property 4: Default field visibility enforcement
     * 
     * For any collection type, the table view should display only the fields
     * specified in that collection's defaultFields configuration, excluding all other fields.
     * 
     * Validates: Requirements 2.1
     */
    it('should return only default fields for table view', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const visibleFields = getVisibleFields(collectionType, 'table');
            const config = FIELD_CONFIGS[collectionType];

            // Should return exactly the default fields
            expect(visibleFields).toEqual(config.defaultFields);
            
            // Should not include expandable fields in table view
            config.expandableFields.forEach(field => {
              expect(visibleFields).not.toContain(field);
            });
            
            // Should not include hidden fields
            config.hiddenFields.forEach(field => {
              expect(visibleFields).not.toContain(field);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include both default and expandable fields for detail view', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const visibleFields = getVisibleFields(collectionType, 'detail');
            const config = FIELD_CONFIGS[collectionType];

            // Should include all default fields
            config.defaultFields.forEach(field => {
              expect(visibleFields).toContain(field);
            });
            
            // Should include all expandable fields
            config.expandableFields.forEach(field => {
              expect(visibleFields).toContain(field);
            });
            
            // Should not include hidden fields
            config.hiddenFields.forEach(field => {
              expect(visibleFields).not.toContain(field);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify hidden fields', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.string(),
          (collectionType, fieldName) => {
            const config = FIELD_CONFIGS[collectionType];
            const shouldBeHidden = config.hiddenFields.includes(fieldName);
            const isHidden = isFieldHidden(collectionType, fieldName);

            expect(isHidden).toBe(shouldBeHidden);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Empty field hiding', () => {
    /**
     * Feature: dashboard-redesign, Property 7: Empty field hiding
     * 
     * For any item displayed in the UI, fields with null, undefined, or empty
     * string values should not appear in the rendered output.
     * 
     * Validates: Requirements 2.4
     */
    it('should filter out empty fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            field1: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined), fc.constant('')),
            field2: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined), fc.constant('')),
            field3: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined), fc.constant('')),
            field4: fc.string({ minLength: 1 }), // Always has value
          }),
          (item) => {
            const filtered = filterEmptyFields(item);

            // Check each field in filtered result
            Object.keys(filtered).forEach(key => {
              const value = filtered[key as keyof typeof filtered];
              // Filtered result should not contain null, undefined, or empty strings
              expect(value).not.toBe(null);
              expect(value).not.toBe(undefined);
              expect(value).not.toBe('');
            });

            // field4 should always be present (it always has a value)
            expect(filtered.field4).toBeDefined();
            expect(filtered.field4).toBe(item.field4);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve non-empty values', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1 }),
            age: fc.integer({ min: 0, max: 100 }),
            active: fc.boolean(),
            empty: fc.constant(''),
            nullValue: fc.constant(null),
          }),
          (item) => {
            const filtered = filterEmptyFields(item);

            // Non-empty values should be preserved
            expect(filtered.name).toBe(item.name);
            expect(filtered.age).toBe(item.age);
            expect(filtered.active).toBe(item.active);

            // Empty values should be filtered out
            expect(filtered.empty).toBeUndefined();
            expect(filtered.nullValue).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Collection-specific visibility rules', () => {
    /**
     * Feature: dashboard-redesign, Property 8: Collection-specific visibility rules
     * 
     * For any two different collection types, their default visible fields should differ
     * according to their respective FieldVisibilityConfig definitions.
     * 
     * Validates: Requirements 2.5
     */
    it('should have different default fields for different collection types', () => {
      // Compare all pairs of collection types
      for (let i = 0; i < collectionTypes.length; i++) {
        for (let j = i + 1; j < collectionTypes.length; j++) {
          const type1 = collectionTypes[i];
          const type2 = collectionTypes[j];
          
          const fields1 = getVisibleFields(type1, 'table');
          const fields2 = getVisibleFields(type2, 'table');
          
          // Different collection types should have different field configurations
          expect(fields1).not.toEqual(fields2);
        }
      }
    });

    it('should have consistent configuration for each collection type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const config = FIELD_CONFIGS[collectionType];

            // Configuration should exist
            expect(config).toBeDefined();
            expect(config.collectionType).toBe(collectionType);

            // Should have at least one default field
            expect(config.defaultFields.length).toBeGreaterThan(0);

            // Hidden fields should not overlap with default or expandable fields
            config.hiddenFields.forEach(hiddenField => {
              expect(config.defaultFields).not.toContain(hiddenField);
              expect(config.expandableFields).not.toContain(hiddenField);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain field uniqueness within each configuration', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const config = FIELD_CONFIGS[collectionType];

            // Default fields should be unique
            const defaultSet = new Set(config.defaultFields);
            expect(defaultSet.size).toBe(config.defaultFields.length);

            // Expandable fields should be unique
            const expandableSet = new Set(config.expandableFields);
            expect(expandableSet.size).toBe(config.expandableFields.length);

            // Hidden fields should be unique
            const hiddenSet = new Set(config.hiddenFields);
            expect(hiddenSet.size).toBe(config.hiddenFields.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
