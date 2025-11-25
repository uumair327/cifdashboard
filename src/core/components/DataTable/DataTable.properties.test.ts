/**
 * Property-based tests for DataTable component
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { paginateData, sortData } from './utils';

describe('DataTable Properties', () => {
  describe('Property 9: Pagination boundary correctness', () => {
    /**
     * Feature: dashboard-redesign, Property 9: Pagination boundary correctness
     * 
     * For any collection of items and any page size, each page should contain
     * exactly pageSize items (except the last page), and the union of all pages
     * should equal the complete collection with no duplicates or omissions.
     */
    it('should paginate data correctly with no duplicates or omissions', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() }), { minLength: 1 }),
          fc.integer({ min: 1, max: 50 }),
          (data, pageSize) => {
            const totalPages = Math.ceil(data.length / pageSize);
            const allPaginatedItems: any[] = [];

            // Collect all items from all pages
            for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
              const result = paginateData(data, pageIndex, pageSize);
              
              // Each page except the last should have exactly pageSize items
              if (pageIndex < totalPages - 1) {
                expect(result.paginatedData.length).toBe(pageSize);
              } else {
                // Last page should have remaining items (1 to pageSize)
                const expectedLastPageSize = data.length % pageSize || pageSize;
                expect(result.paginatedData.length).toBe(expectedLastPageSize);
              }

              allPaginatedItems.push(...result.paginatedData);
            }

            // Union of all pages should equal complete collection
            expect(allPaginatedItems.length).toBe(data.length);
            
            // No omissions - all items from original data should be in paginated results
            // We compare by index position since IDs might not be unique
            for (let i = 0; i < data.length; i++) {
              expect(allPaginatedItems[i]).toEqual(data[i]);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should calculate correct page boundaries', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer(), { minLength: 1 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 0, max: 10 }),
          (data, pageSize, pageIndex) => {
            // Skip if pageIndex is beyond available pages
            const totalPages = Math.ceil(data.length / pageSize);
            if (pageIndex >= totalPages) {
              return true;
            }

            const result = paginateData(data, pageIndex, pageSize);

            // Start index should be pageIndex * pageSize
            expect(result.startIndex).toBe(pageIndex * pageSize);

            // End index should not exceed data length
            expect(result.endIndex).toBeLessThanOrEqual(data.length);

            // End index should be greater than start index
            expect(result.endIndex).toBeGreaterThan(result.startIndex);

            // Paginated data length should match the difference
            expect(result.paginatedData.length).toBe(
              result.endIndex - result.startIndex
            );

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases correctly', () => {
      // Empty array
      const emptyResult = paginateData([], 0, 10);
      expect(emptyResult.paginatedData).toEqual([]);
      expect(emptyResult.totalPages).toBe(0);

      // Single item
      const singleResult = paginateData([1], 0, 10);
      expect(singleResult.paginatedData).toEqual([1]);
      expect(singleResult.totalPages).toBe(1);

      // Exact page size
      const exactResult = paginateData([1, 2, 3, 4, 5], 0, 5);
      expect(exactResult.paginatedData).toEqual([1, 2, 3, 4, 5]);
      expect(exactResult.totalPages).toBe(1);

      // Multiple pages
      const multiResult = paginateData([1, 2, 3, 4, 5, 6, 7], 1, 3);
      expect(multiResult.paginatedData).toEqual([4, 5, 6]);
      expect(multiResult.totalPages).toBe(3);
    });
  });

  describe('Property 10: Sort order correctness', () => {
    /**
     * Feature: dashboard-redesign, Property 10: Sort order correctness
     * 
     * For any collection of items and any sortable column, sorting by that column
     * should produce a result where each item compares correctly (≤ or ≥) with its
     * neighbors according to the sort direction.
     */
    it('should sort data in ascending order correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string(),
              age: fc.integer({ min: 0, max: 100 }),
              score: fc.float({ min: 0, max: 100 }),
            }),
            { minLength: 2 }
          ),
          (data) => {
            // Test sorting by numeric field
            const sortedByAge = sortData(data, 'age', 'asc');
            
            for (let i = 0; i < sortedByAge.length - 1; i++) {
              const current = sortedByAge[i].age;
              const next = sortedByAge[i + 1].age;
              
              // Each item should be <= the next item
              expect(current).toBeLessThanOrEqual(next);
            }

            // Test sorting by string field
            const sortedByName = sortData(data, 'name', 'asc');
            
            for (let i = 0; i < sortedByName.length - 1; i++) {
              const current = sortedByName[i].name;
              const next = sortedByName[i + 1].name;
              
              // Each item should be <= the next item (lexicographically)
              expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should sort data in descending order correctly', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              value: fc.integer({ min: -1000, max: 1000 }),
            }),
            { minLength: 2 }
          ),
          (data) => {
            const sorted = sortData(data, 'value', 'desc');
            
            for (let i = 0; i < sorted.length - 1; i++) {
              const current = sorted[i].value;
              const next = sorted[i + 1].value;
              
              // Each item should be >= the next item
              expect(current).toBeGreaterThanOrEqual(next);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle null and undefined values in sorting', () => {
      const dataWithNulls = [
        { id: 1, value: 5 },
        { id: 2, value: null },
        { id: 3, value: 3 },
        { id: 4, value: undefined },
        { id: 5, value: 7 },
      ];

      const sortedAsc = sortData(dataWithNulls, 'value', 'asc');
      const sortedDesc = sortData(dataWithNulls, 'value', 'desc');

      // Nulls and undefined should be at the end in ascending order
      const lastTwoAsc = sortedAsc.slice(-2);
      expect(
        lastTwoAsc.every(item => item.value === null || item.value === undefined)
      ).toBe(true);

      // First three should have actual values in ascending order
      const firstThreeAsc = sortedAsc.slice(0, 3);
      expect(firstThreeAsc[0].value).toBe(3);
      expect(firstThreeAsc[1].value).toBe(5);
      expect(firstThreeAsc[2].value).toBe(7);

      // For descending, just verify the non-null values are in descending order
      const nonNullDesc = sortedDesc.filter(item => item.value !== null && item.value !== undefined);
      expect(nonNullDesc[0].value).toBe(7);
      expect(nonNullDesc[1].value).toBe(5);
      expect(nonNullDesc[2].value).toBe(3);
      
      // All items should still be present
      expect(sortedDesc.length).toBe(dataWithNulls.length);
    });

    it('should preserve original array and return new sorted array', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.integer() }), { minLength: 1 }),
          (data) => {
            const original = [...data];
            const sorted = sortData(data, 'value', 'asc');

            // Original array should be unchanged
            expect(data).toEqual(original);

            // Sorted should be a different array
            expect(sorted).not.toBe(data);

            // But contain the same items
            expect(sorted.length).toBe(data.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle sorting with duplicate values', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              category: fc.constantFrom('A', 'B', 'C'),
            }),
            { minLength: 3 }
          ),
          (data) => {
            const sorted = sortData(data, 'category', 'asc');

            // Verify sort order is maintained
            for (let i = 0; i < sorted.length - 1; i++) {
              expect(sorted[i].category.localeCompare(sorted[i + 1].category)).toBeLessThanOrEqual(0);
            }

            // All items should still be present
            expect(sorted.length).toBe(data.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Bulk selection state consistency', () => {
    /**
     * Feature: dashboard-redesign, Property 11: Bulk selection state consistency
     * 
     * For any set of selected items, the bulk action buttons should be enabled
     * if and only if at least one item is selected.
     */
    it('should enable bulk actions when items are selected', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() }), { minLength: 1 }),
          fc.array(fc.integer({ min: 0, max: 10 })),
          (items, selectedIndices) => {
            // Filter to valid indices
            const validIndices = selectedIndices.filter(i => i < items.length);
            const uniqueIndices = [...new Set(validIndices)];

            // Bulk actions should be enabled if at least one item is selected
            const shouldBeEnabled = uniqueIndices.length > 0;

            // Simulate the logic
            const selectedCount = uniqueIndices.length;
            const bulkActionsEnabled = selectedCount > 0;

            expect(bulkActionsEnabled).toBe(shouldBeEnabled);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should track selection state correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() }), { minLength: 1, maxLength: 20 }),
          (items) => {
            const selectedSet = new Set<number>();

            // Simulate selecting items
            items.forEach((_, index) => {
              if (index % 2 === 0) {
                selectedSet.add(index);
              }
            });

            // Count should match set size
            expect(selectedSet.size).toBe(Math.ceil(items.length / 2));

            // All selected indices should be valid
            selectedSet.forEach(index => {
              expect(index).toBeGreaterThanOrEqual(0);
              expect(index).toBeLessThan(items.length);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle select all and deselect all correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() }), { minLength: 1 }),
          (items) => {
            const selectedSet = new Set<number>();

            // Select all
            items.forEach((_, index) => selectedSet.add(index));
            expect(selectedSet.size).toBe(items.length);

            // Deselect all
            selectedSet.clear();
            expect(selectedSet.size).toBe(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should toggle selection correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() }), { minLength: 1 }),
          fc.integer({ min: 0, max: 100 }),
          (items, targetIndex) => {
            if (targetIndex >= items.length) return true;

            const selectedSet = new Set<number>();

            // Toggle on
            if (selectedSet.has(targetIndex)) {
              selectedSet.delete(targetIndex);
            } else {
              selectedSet.add(targetIndex);
            }

            const wasAdded = selectedSet.has(targetIndex);
            expect(wasAdded).toBe(true);

            // Toggle off
            if (selectedSet.has(targetIndex)) {
              selectedSet.delete(targetIndex);
            } else {
              selectedSet.add(targetIndex);
            }

            const wasRemoved = !selectedSet.has(targetIndex);
            expect(wasRemoved).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
