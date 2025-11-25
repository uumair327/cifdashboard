/**
 * Custom hook for managing field visibility based on collection type and view mode
 */

import { useMemo } from 'react';
import { CollectionType } from '../domain/entities/Collection';
import { 
  getVisibleFields, 
  filterEmptyFields,
  FIELD_CONFIGS 
} from '../domain/config/fieldVisibility';

interface UseFieldVisibilityOptions {
  /**
   * Collection type
   */
  collectionType: CollectionType;
  
  /**
   * View mode (table or detail)
   * @default 'table'
   */
  viewMode?: 'table' | 'detail';
}

interface UseFieldVisibilityResult {
  /**
   * Fields that should be visible in the current view mode
   */
  visibleFields: string[];
  
  /**
   * Filter an item to only include visible, non-empty fields
   */
  filterItem: <T extends Record<string, any>>(item: T) => Partial<T>;
  
  /**
   * Check if a field should be visible
   */
  isFieldVisible: (fieldName: string) => boolean;
  
  /**
   * Get all searchable fields for this collection type
   */
  searchableFields: string[];
  
  /**
   * Get all sortable fields for this collection type
   */
  sortableFields: string[];
}

/**
 * Hook for managing field visibility
 * @param options Configuration options
 */
export function useFieldVisibility(
  options: UseFieldVisibilityOptions
): UseFieldVisibilityResult {
  const { collectionType, viewMode = 'table' } = options;

  // Get visible fields for current view mode
  const visibleFields = useMemo(() => {
    return getVisibleFields(collectionType, viewMode);
  }, [collectionType, viewMode]);

  // Get configuration for this collection type
  const config = useMemo(() => {
    return FIELD_CONFIGS[collectionType];
  }, [collectionType]);

  // Get searchable fields
  const searchableFields = useMemo(() => {
    return config.searchableFields || [];
  }, [config]);

  // Get sortable fields
  const sortableFields = useMemo(() => {
    return config.sortableFields || [];
  }, [config]);

  // Filter an item to only include visible, non-empty fields
  const filterItem = useMemo(() => {
    return <T extends Record<string, any>>(item: T): Partial<T> => {
      // First filter to visible fields
      const visibleOnly: Partial<T> = {};
      visibleFields.forEach(field => {
        if (field in item) {
          visibleOnly[field as keyof T] = item[field];
        }
      });
      
      // Then filter out empty fields
      return filterEmptyFields(visibleOnly as T);
    };
  }, [visibleFields]);

  // Check if a field should be visible
  const isFieldVisible = useMemo(() => {
    return (fieldName: string): boolean => {
      return visibleFields.includes(fieldName);
    };
  }, [visibleFields]);

  return {
    visibleFields,
    filterItem,
    isFieldVisible,
    searchableFields,
    sortableFields,
  };
}
