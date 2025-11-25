/**
 * Property-based tests for useFieldVisibility hook
 * Feature: dashboard-redesign
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import fc from 'fast-check';
import { useFieldVisibility } from './useFieldVisibility';
import { CollectionType } from '../domain/entities/Collection';

const collectionTypes: CollectionType[] = [
  'carousel_items',
  'home_images',
  'forum',
  'learn',
  'quizes',
  'quiz_questions',
  'videos',
];

describe('useFieldVisibility Properties', () => {
  describe('Property 7: Empty field hiding', () => {
    /**
     * Feature: dashboard-redesign, Property 7: Empty field hiding
     * 
     * For any item displayed in the UI, fields with null, undefined, or empty
     * string values should not appear in the rendered output.
     * 
     * Validates: Requirements 2.4
     */
    it('should filter out empty fields from items', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.record({
            field1: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined), fc.constant('')),
            field2: fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined), fc.constant('')),
            field3: fc.string({ minLength: 1 }), // Always has value
          }),
          (collectionType, item) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'table' })
            );

            const filtered = result.current.filterItem(item);

            // Check that filtered result doesn't contain empty values
            Object.values(filtered).forEach(value => {
              expect(value).not.toBe(null);
              expect(value).not.toBe(undefined);
              expect(value).not.toBe('');
            });

            // field3 should always be present (it always has a value)
            if (result.current.isFieldVisible('field3')) {
              expect(filtered.field3).toBeDefined();
              expect(filtered.field3).toBe(item.field3);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve non-empty values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.record({
            name: fc.string({ minLength: 1 }),
            count: fc.integer({ min: 0, max: 100 }),
            active: fc.boolean(),
            empty: fc.constant(''),
            nullValue: fc.constant(null),
          }),
          (collectionType, item) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'detail' })
            );

            const filtered = result.current.filterItem(item);

            // Non-empty values should be preserved if visible
            if (result.current.isFieldVisible('name')) {
              expect(filtered.name).toBe(item.name);
            }
            if (result.current.isFieldVisible('count')) {
              expect(filtered.count).toBe(item.count);
            }
            if (result.current.isFieldVisible('active')) {
              expect(filtered.active).toBe(item.active);
            }

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

  describe('Property 5: Expanded view completeness', () => {
    /**
     * Feature: dashboard-redesign, Property 5: Expanded view completeness
     * 
     * For any item in any collection, the expanded detail view should contain
     * all fields present in the item's data structure, excluding only those
     * in the hiddenFields configuration.
     * 
     * Validates: Requirements 2.2
     */
    it('should include all non-hidden fields in detail view', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { result: tableResult } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'table' })
            );

            const { result: detailResult } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'detail' })
            );

            // Detail view should have more or equal fields than table view
            expect(detailResult.current.visibleFields.length).toBeGreaterThanOrEqual(
              tableResult.current.visibleFields.length
            );

            // All table fields should be in detail view
            tableResult.current.visibleFields.forEach(field => {
              expect(detailResult.current.visibleFields).toContain(field);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not include hidden fields in any view', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.constantFrom('table', 'detail'),
          (collectionType, viewMode) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode })
            );

            // 'id' is hidden in all collections
            expect(result.current.visibleFields).not.toContain('id');
            expect(result.current.isFieldVisible('id')).toBe(false);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Field Visibility Consistency', () => {
    it('should return consistent visible fields for same collection type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { result: result1 } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'table' })
            );

            const { result: result2 } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'table' })
            );

            expect(result1.current.visibleFields).toEqual(result2.current.visibleFields);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have different visible fields for different collection types', () => {
      // Compare all pairs of collection types
      for (let i = 0; i < collectionTypes.length; i++) {
        for (let j = i + 1; j < collectionTypes.length; j++) {
          const type1 = collectionTypes[i];
          const type2 = collectionTypes[j];

          const { result: result1 } = renderHook(() =>
            useFieldVisibility({ collectionType: type1, viewMode: 'table' })
          );

          const { result: result2 } = renderHook(() =>
            useFieldVisibility({ collectionType: type2, viewMode: 'table' })
          );

          // Different collection types should have different field configurations
          expect(result1.current.visibleFields).not.toEqual(result2.current.visibleFields);
        }
      }
    });

    it('should correctly identify visible fields', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.string(),
          (collectionType, fieldName) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'table' })
            );

            const isVisible = result.current.isFieldVisible(fieldName);
            const shouldBeVisible = result.current.visibleFields.includes(fieldName);

            expect(isVisible).toBe(shouldBeVisible);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Searchable and Sortable Fields', () => {
    it('should provide searchable fields for each collection type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType })
            );

            // Should have searchable fields
            expect(result.current.searchableFields).toBeDefined();
            expect(Array.isArray(result.current.searchableFields)).toBe(true);

            // Searchable fields should not include hidden fields
            result.current.searchableFields.forEach(field => {
              expect(result.current.isFieldVisible(field) || field === 'id').toBe(true);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide sortable fields for each collection type', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { result } = renderHook(() =>
              useFieldVisibility({ collectionType, viewMode: 'detail' })
            );

            // Should have sortable fields
            expect(result.current.sortableFields).toBeDefined();
            expect(Array.isArray(result.current.sortableFields)).toBe(true);

            // Sortable fields should be visible in detail view or be 'id' (which is hidden but sortable)
            result.current.sortableFields.forEach(field => {
              const isVisibleInDetail = result.current.isFieldVisible(field);
              const isHiddenButSortable = field === 'id';
              expect(isVisibleInDetail || isHiddenButSortable).toBe(true);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
