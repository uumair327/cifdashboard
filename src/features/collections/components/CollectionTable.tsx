/**
 * CollectionTable component
 * Integrates DataTable with collection data, field visibility, and actions
 */

import { useMemo, memo } from 'react';
import { DataTable } from '../../../core/components/DataTable/DataTable';
import { ColumnDef } from '../../../core/components/DataTable/types';
import { BaseCollection, CollectionType } from '../domain/entities/Collection';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import { logger } from '../../../core/utils/logger';

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
}: CollectionTableProps<T>) {
  const { visibleFields } = useFieldVisibility({
    collectionType,
    viewMode: 'table',
  });

  // Just use the data as-is (search filtering is handled by parent component)
  const displayData = useMemo(() => {
    const dataToDisplay = data || [];
    logger.debug('[CollectionTable] displayData:', dataToDisplay.length, 'items, visibleFields:', visibleFields.length);
    return dataToDisplay;
  }, [data, visibleFields]);



  // Generate columns configuration
  const columns: ColumnDef<T>[] = useMemo(() => {
    const cols: ColumnDef<T>[] = visibleFields.map((field) => {
      // Determine if field is likely a URL field
      const isUrlField = field.toLowerCase().includes('url') ||
        field.toLowerCase().includes('link') ||
        field.toLowerCase().includes('image');

      return {
        id: field,
        header: getFieldDisplayName(field),
        accessorKey: field as keyof T,
        cell: (value: any) => formatFieldValue(value),
        sortable: true,
        // Set appropriate width for URL fields
        maxWidth: isUrlField ? '400px' : '300px',
        minWidth: isUrlField ? '200px' : '100px',
      };
    });

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
      </div>
    );
  }

  // Handle selection change
  const handleSelectionChange = (selected: T[]) => {
    if (onSelectionChange) {
      const ids = selected.map(item => item.id);
      onSelectionChange(ids);
    }
  };

  return (
    <DataTable
      data={displayData}
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
