/**
 * Custom hook for searching and filtering collection data
 * Applies SearchService filtering with debouncing and caching
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BaseCollection } from '../domain/entities/Collection';
import { FilterCriteria, SortCriteria } from '../domain/entities/Search';
import { SearchService } from '../domain/services/SearchService';

/**
 * Simple cache for search results
 */
interface SearchCache<T> {
  key: string;
  result: T[];
}

/**
 * Generate cache key from search parameters
 */
function generateCacheKey(
  query: string,
  filters: FilterCriteria[],
  sortBy: SortCriteria | null
): string {
  return JSON.stringify({ query, filters, sortBy });
}

interface UseCollectionSearchOptions {
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;
  
  /**
   * Fields to search in
   */
  searchFields: string[];
}

interface UseCollectionSearchResult<T extends BaseCollection> {
  filteredData: T[];
  query: string;
  setQuery: (query: string) => void;
  filters: FilterCriteria[];
  setFilters: (filters: FilterCriteria[]) => void;
  sortBy: SortCriteria | null;
  setSortBy: (sort: SortCriteria | null) => void;
  clearAll: () => void;
}

/**
 * Hook for searching and filtering collection data
 * @param data The collection data to search/filter
 * @param options Configuration options
 */
export function useCollectionSearch<T extends BaseCollection>(
  data: T[] | null,
  options: UseCollectionSearchOptions
): UseCollectionSearchResult<T> {
  const { debounceMs = 300, searchFields } = options;

  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [sortBy, setSortBy] = useState<SortCriteria | null>(null);

  // Cache for search results
  const cacheRef = useRef<SearchCache<T> | null>(null);

  // Create search service instance
  const searchService = useMemo(() => new SearchService<T>(), []);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Apply search, filter, and sort with caching
  const filteredData = useMemo(() => {
    if (!data) return [];

    // Generate cache key
    const cacheKey = generateCacheKey(debouncedQuery, filters, sortBy);

    // Check cache
    if (cacheRef.current && cacheRef.current.key === cacheKey) {
      return cacheRef.current.result;
    }

    // Compute result
    const result = searchService.searchFilterSort(
      data,
      debouncedQuery,
      searchFields,
      filters,
      sortBy || undefined
    );

    // Update cache
    cacheRef.current = { key: cacheKey, result };

    return result;
  }, [data, debouncedQuery, searchFields, filters, sortBy, searchService]);

  // Clear all filters and search
  const clearAll = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setFilters([]);
    setSortBy(null);
    cacheRef.current = null; // Clear cache
  }, []);

  return {
    filteredData,
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    clearAll,
  };
}
