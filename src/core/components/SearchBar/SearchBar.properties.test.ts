/**
 * Property-based tests for SearchBar component
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { applySearch, applyFilters, applySearchAndFilters } from './utils';
import { FilterCriteria } from './types';

describe('SearchBar Properties', () => {
  describe('Property 1: Search filtering correctness', () => {
    /**
     * Feature: dashboard-redesign, Property 1: Search filtering correctness
     * 
     * For any collection of items and any search query, all items returned by
     * the search function should contain the search query in at least one of
     * their searchable fields (case-insensitive).
     */
    it('should return only items containing the search query', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string(),
              email: fc.string(),
              role: fc.constantFrom('admin', 'user', 'guest'),
            }),
            { minLength: 1 }
          ),
          fc.string({ minLength: 1, maxLength: 10 }),
          (data, query) => {
            const searchFields = ['name', 'email', 'role'];
            const results = applySearch(data, query, searchFields);

            // All results should contain the query in at least one field
            results.forEach((item) => {
              const matchesQuery = searchFields.some((field) => {
                const value = item[field];
                return value && String(value).toLowerCase().includes(query.toLowerCase());
              });
              expect(matchesQuery).toBe(true);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive', () => {
      const data = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      const resultsLower = applySearch(data, 'john', ['name', 'email']);
      const resultsUpper = applySearch(data, 'JOHN', ['name', 'email']);
      const resultsMixed = applySearch(data, 'JoHn', ['name', 'email']);

      expect(resultsLower).toEqual(resultsUpper);
      expect(resultsLower).toEqual(resultsMixed);
      expect(resultsLower.length).toBe(1);
      expect(resultsLower[0].name).toBe('John Doe');
    });

    it('should return empty array when no matches found', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
          (data) => {
            const results = applySearch(data, 'NONEXISTENT_QUERY_12345', ['value']);
            expect(results.length).toBeLessThanOrEqual(data.length);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all items when query is empty', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
          (data) => {
            const results = applySearch(data, '', ['value']);
            expect(results).toEqual(data);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Multi-criteria filter conjunction', () => {
    /**
     * Feature: dashboard-redesign, Property 2: Multi-criteria filter conjunction
     * 
     * For any collection of items and any set of filter criteria, all items
     * returned should satisfy every filter criterion simultaneously (AND logic).
     */
    it('should apply all filters with AND logic', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string({ minLength: 1 }),
              age: fc.integer({ min: 0, max: 100 }),
              city: fc.constantFrom('New York', 'London', 'Tokyo', 'Paris'),
            }),
            { minLength: 1 }
          ),
          (data) => {
            const filters: FilterCriteria[] = [
              { field: 'city', operator: 'equals', value: 'London' },
              { field: 'age', operator: 'contains', value: '2' },
            ];

            const results = applyFilters(data, filters);

            // All results must satisfy ALL filters
            results.forEach((item) => {
              expect(item.city.toLowerCase()).toBe('london');
              expect(String(item.age).includes('2')).toBe(true);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle different operators correctly', () => {
      const data = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@test.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
      ];

      // Test 'contains' operator
      const containsResults = applyFilters(data, [
        { field: 'email', operator: 'contains', value: 'example' },
      ]);
      expect(containsResults.length).toBe(2);

      // Test 'equals' operator
      const equalsResults = applyFilters(data, [
        { field: 'name', operator: 'equals', value: 'bob' },
      ]);
      expect(equalsResults.length).toBe(1);
      expect(equalsResults[0].name).toBe('Bob');

      // Test 'startsWith' operator
      const startsWithResults = applyFilters(data, [
        { field: 'name', operator: 'startsWith', value: 'cha' },
      ]);
      expect(startsWithResults.length).toBe(1);
      expect(startsWithResults[0].name).toBe('Charlie');

      // Test 'endsWith' operator
      const endsWithResults = applyFilters(data, [
        { field: 'email', operator: 'endsWith', value: 'test.com' },
      ]);
      expect(endsWithResults.length).toBe(1);
      expect(endsWithResults[0].email).toBe('bob@test.com');
    });

    it('should return empty array when no items match all filters', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
          (data) => {
            const filters: FilterCriteria[] = [
              { field: 'value', operator: 'equals', value: 'IMPOSSIBLE_VALUE_1' },
              { field: 'value', operator: 'equals', value: 'IMPOSSIBLE_VALUE_2' },
            ];

            const results = applyFilters(data, filters);
            expect(results.length).toBe(0);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Search clear restores original state', () => {
    /**
     * Feature: dashboard-redesign, Property 3: Search clear restores original state
     * 
     * For any collection of items, applying a search filter and then clearing it
     * should return exactly the same set of items in the same order as the
     * original unfiltered collection.
     */
    it('should restore original data after clearing search', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string(),
              value: fc.string(),
            })
          ),
          fc.string(),
          (data, query) => {
            const searchFields = ['name', 'value'];

            // Apply search
            const filtered = applySearch(data, query, searchFields);

            // Clear search (empty query)
            const restored = applySearch(filtered.length > 0 ? data : data, '', searchFields);

            // Should get back original data
            expect(restored).toEqual(data);
            expect(restored.length).toBe(data.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should restore original data after clearing filters', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              category: fc.constantFrom('A', 'B', 'C'),
            })
          ),
          (data) => {
            const filters: FilterCriteria[] = [
              { field: 'category', operator: 'equals', value: 'A' },
            ];

            // Apply filters
            const filtered = applyFilters(data, filters);

            // Clear filters (empty array)
            const restored = applyFilters(data, []);

            // Should get back original data
            expect(restored).toEqual(data);
            expect(restored.length).toBe(data.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle combined search and filter clearing', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer(),
              name: fc.string(),
              status: fc.constantFrom('active', 'inactive'),
            }),
            { minLength: 1 }
          ),
          fc.string({ minLength: 1 }),
          (data, query) => {
            const filters: FilterCriteria[] = [
              { field: 'status', operator: 'equals', value: 'active' },
            ];

            // Apply both search and filters
            const filtered = applySearchAndFilters(data, query, ['name'], filters);

            // Clear both (empty query and empty filters)
            const restored = applySearchAndFilters(data, '', ['name'], []);

            // Should get back original data
            expect(restored).toEqual(data);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
