// Search service - Business logic for search and filtering operations

import { FilterCriteria, SortCriteria } from '../entities/Search';

/**
 * Service for searching, filtering, and sorting collection data
 */
export class SearchService<T extends Record<string, any>> {
  /**
   * Search items by query across specified fields
   */
  search(items: T[], query: string, fields: string[]): T[] {
    if (!query || query.trim() === '') {
      return items;
    }

    const lowerQuery = query.toLowerCase();

    return items.filter((item) => {
      return fields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        const strValue = String(value);
        if (strValue.trim() === '') return false;
        return strValue.toLowerCase().includes(lowerQuery);
      });
    });
  }

  /**
   * Filter items by criteria (AND logic)
   */
  filter(items: T[], criteria: FilterCriteria[]): T[] {
    if (criteria.length === 0) {
      return items;
    }

    return items.filter((item) => {
      return criteria.every((filter) => {
        const value = item[filter.field];
        if (value === null || value === undefined) return false;

        const strValue = String(value).toLowerCase();
        const filterValue = String(filter.value).toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return strValue === filterValue;
          case 'contains':
            return strValue.includes(filterValue);
          case 'startsWith':
            return strValue.startsWith(filterValue);
          case 'endsWith':
            return strValue.endsWith(filterValue);
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          default:
            return false;
        }
      });
    });
  }

  /**
   * Sort items by field and direction
   */
  sort(items: T[], sortBy: string, direction: 'asc' | 'desc'): T[] {
    return [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === bVal) return 0;

      let comparison = 0;
      if (aVal === null || aVal === undefined) {
        comparison = 1;
      } else if (bVal === null || bVal === undefined) {
        comparison = -1;
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Apply search, filter, and sort in sequence
   */
  searchFilterSort(
    items: T[],
    query: string,
    searchFields: string[],
    filters: FilterCriteria[],
    sortCriteria?: SortCriteria
  ): T[] {
    let result = items;

    // Apply search
    if (query && query.trim() !== '') {
      result = this.search(result, query, searchFields);
    }

    // Apply filters
    if (filters.length > 0) {
      result = this.filter(result, filters);
    }

    // Apply sort
    if (sortCriteria) {
      result = this.sort(result, sortCriteria.field, sortCriteria.direction);
    }

    return result;
  }
}
