// SearchBar utility functions

import { FilterCriteria } from './types';

/**
 * Apply search query to data
 * @param data The dataset to search
 * @param query The search query
 * @param fields Fields to search in
 * @returns Filtered data
 */
export function applySearch<T extends Record<string, any>>(
  data: T[],
  query: string,
  fields: string[]
): T[] {
  if (!query || query.trim() === '') {
    return data;
  }

  const lowerQuery = query.toLowerCase();

  return data.filter((item) => {
    return fields.some((field) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      const strValue = String(value);
      // Skip empty values when searching
      if (strValue.trim() === '') return false;
      return strValue.toLowerCase().includes(lowerQuery);
    });
  });
}

/**
 * Apply filter criteria to data
 * @param data The dataset to filter
 * @param filters Array of filter criteria
 * @returns Filtered data
 */
export function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: FilterCriteria[]
): T[] {
  if (filters.length === 0) {
    return data;
  }

  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.field];
      if (value === null || value === undefined) return false;

      const strValue = String(value).toLowerCase();
      const filterValue = filter.value.toLowerCase();

      switch (filter.operator) {
        case 'equals':
          return strValue === filterValue;
        case 'contains':
          return strValue.includes(filterValue);
        case 'startsWith':
          return strValue.startsWith(filterValue);
        case 'endsWith':
          return strValue.endsWith(filterValue);
        default:
          return false;
      }
    });
  });
}

/**
 * Apply both search and filters to data
 * @param data The dataset
 * @param query Search query
 * @param searchFields Fields to search in
 * @param filters Filter criteria
 * @returns Filtered data
 */
export function applySearchAndFilters<T extends Record<string, any>>(
  data: T[],
  query: string,
  searchFields: string[],
  filters: FilterCriteria[]
): T[] {
  let result = data;

  // Apply search first
  if (query && query.trim() !== '') {
    result = applySearch(result, query, searchFields);
  }

  // Then apply filters
  if (filters.length > 0) {
    result = applyFilters(result, filters);
  }

  return result;
}
