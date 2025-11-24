/**
 * CollectionTable component
 * Integrates DataTable with collection data, field visibility, and actions
 */

import { useMemo, useState, memo, useCallback } from 'react';
import { DataTable } from '../../../core/components/DataTable/DataTable';
import { ColumnDef } from '../../../core/components/DataTable/types';
import { SearchBar } from '../../../core/components/SearchBar/SearchBar';
import { FilterCriteria as SearchFilterCriteria } from '../../../core/components/SearchBar/types';
import { BaseCollection, CollectionType } from '../domain/entities/Collection';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import { useCollectionSearch } from '../hooks/useCollectionSearch';

interface CollectionTableProps<T extends BaseCollection> {
  /**
   * Collection type for field visibility configuration
   */
  collectionType: CollectionType;
  
  /**
   * Collection data to display
   */
  data: T[] | null;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Error state
   */
  error?: Error | null;
  
  /**
   * Selected row IDs
   */
  selectedIds?: string[];
  
  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void;
  
  /**
   * Callback when edit is clicked
   */
  onEdit?: (item: T) => void;
  
  /**
   * Callback when delete is clicked
   */
  onDelete?: (item: T) => void;
  
  /**
   * Callback when row is clicked
   */
  onRowClick?: (item: T) => void;
  
  /**
   * Callback to retry loading data
   */
  onRetry?: () => void;
  
  /**
   * Enable search functionality
   */
  searchEnabled?: boolean;
}

/**
 * Format field value for display
 */
function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Get field display name (converts camelCase to Title Case)
 */
function getFieldDisplayName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function CollectionTableComponent<T extends BaseCollection>({
  collectionType,
  data,
  loading = false,
  error = null,
  onSelectionChange,
  onEdit,
  onDelete,
  onRowClick,
  onRetry,
  searchEnabled = true,
}: CollectionTableProps<T>) {
  const { visibleFields, filterItem, searchableFields } = useFieldVisibility({
    collectionType,
    viewMode: 'table',
  });

  // Use collection search hook for filtering
  const {
    filteredData: searchFilteredData,
    query,
    setQuery,
    filters: searchFilters,
    setFilters: setSearchFilters,
    clearAll: clearSearch,
  } = useCollectionSearch(data, {
    searchFields: searchableFields,
  });

  // Track if search is active
  const hasActiveSearch = query.length > 0 || searchFilters.length > 0;

  // Filter data to only include visible, non-empty fields
  const filteredData = useMemo(() => {
    const dataToFilter = searchEnabled ? searchFilteredData : (data || []);
    console.log('[CollectionTable] dataToFilter:', dataToFilter.length, 'items');
    console.log('[CollectionTable] visibleFields:', visibleFields);
    const result = dataToFilter.map(item => filterItem(item) as T);
    console.log('[CollectionTable] filteredData after filterItem:', result.length, 'items');
    console.log('[CollectionTable] sample filtered item:', result[0]);
    return result;
  }, [searchEnabled, searchFilteredData, data, filterItem, visibleFields]);

  // Convert searchable fields to SearchBar field format
  const searchBarFields = useMemo(() => {
    return searchableFields.map(field => ({
      key: field,
      label: getFieldDisplayName(field),
    }));
  }, [searchableFields]);

  // Generate columns configuration
  const columns: ColumnDef<T>[] = useMemo(() => {
    const cols: ColumnDef<T>[] = visibleFields.map((field) => ({
      id: field,
      header: getFieldDisplayName(field),
      accessorKey: field as keyof T,
      cell: (value: any) => formatFieldValue(value),
      sortable: true,
    }));

    // Add actions column if edit or delete handlers provided
    if (onEdit || onDelete) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: (info: { value: any; row: T }) => (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(info.row);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(info.row);
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        ),
        sortable: false,
      });
    }

    return cols;
  }, [visibleFields, onEdit, onDelete]);

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Show empty state when no data
  console.log('[CollectionTable] Empty check - loading:', loading, 'data:', data?.length, 'filteredData:', filteredData.length);
  
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">No Items Found</h3>
        <p className="text-sm text-gray-500">There are no items in this collection yet.</p>
        <details className="mt-4 text-xs text-left">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded">
            {JSON.stringify({ loading, dataLength: data?.length, filteredDataLength: filteredData.length }, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  // Handle search from SearchBar
  const handleSearch = (searchQuery: string, searchBarFilters: SearchFilterCriteria[]) => {
    setQuery(searchQuery);
    
    // Convert SearchBar filters to domain filters
    const domainFilters = searchBarFilters.map(f => ({
      field: f.field,
      operator: f.operator,
      value: f.value,
    }));
    setSearchFilters(domainFilters);
  };

  // Handle selection change
  const handleSelectionChange = (selected: T[]) => {
    if (onSelectionChange) {
      const ids = selected.map(item => item.id);
      onSelectionChange(ids);
    }
  };

  return (
    <DataTable
      data={filteredData}
      columns={columns}
      loading={loading}
      selection={onSelectionChange ? {
        enabled: true,
        multiple: true,
        onSelectionChange: handleSelectionChange,
      } : undefined}
      onRowClick={onRowClick}
      pagination={{
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
      }}
    />
  );
}

// Export memoized version for performance
export const CollectionTable = memo(CollectionTableComponent) as typeof CollectionTableComponent;
