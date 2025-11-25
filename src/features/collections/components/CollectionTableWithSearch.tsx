/**
 * CollectionTableWithSearch component
 * Integrates CollectionTable with SearchBar for filtering and searching
 */
import { useMemo, useState } from 'react';
import { CollectionTable } from './CollectionTable';
import { BulkActionToolbar } from './BulkActionToolbar';
import { SearchBar } from '../../../core/components/SearchBar/SearchBar';
import { BaseCollection, CollectionType } from '../domain/entities/Collection';
import { useCollectionSearch } from '../hooks/useCollectionSearch';
import { useFieldVisibility } from '../hooks/useFieldVisibility';
import { ExportService, ExportFormat } from '../domain/services/ExportService';

interface CollectionTableWithSearchProps<T extends BaseCollection> {
  collectionType: CollectionType;
  data: T[] | null;
  loading?: boolean;
  error?: Error | null;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onBulkDelete?: (items: T[]) => void;
  onRowClick?: (item: T) => void;
  onRetry?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  bulkLoading?: boolean;
  bulkProgress?: { current: number; total: number };
  showExport?: boolean;
}

export function CollectionTableWithSearch<T extends BaseCollection>({
  collectionType,
  data,
  loading = false,
  error = null,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onRowClick,
  onRetry,
  showSearch = true,
  searchPlaceholder,
  onBulkDelete,
  bulkLoading = false,
  bulkProgress,
  showExport = true,
}: CollectionTableWithSearchProps<T>) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Get searchable fields for this collection type
  const { searchableFields } = useFieldVisibility({ collectionType });

  // Use search hook for filtering
  console.log('[CollectionTableWithSearch] Received data:', data?.length, 'items');
  const {
    filteredData,
    query,
    setQuery,
    clearAll,
  } = useCollectionSearch(data, {
    searchFields: searchableFields,
    debounceMs: 300,
  });
  console.log('[CollectionTableWithSearch] filteredData:', filteredData.length, 'items');

  // Generate placeholder if not provided
  const placeholder = useMemo(() => {
    if (searchPlaceholder) return searchPlaceholder;
    const typeName = collectionType.replace(/_/g, ' ');
    return `Search ${typeName}...`;
  }, [searchPlaceholder, collectionType]);

  // Handle search from SearchBar
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  // Calculate result counts
  const totalCount = data?.length || 0;
  const filteredCount = filteredData.length;
  const hasActiveSearch = query.trim().length > 0;

  // Get selected items from IDs
  const selectedItems = useMemo(() => {
    if (!selectedIds.length || !filteredData.length) return [];
    return filteredData.filter(item => selectedIds.includes(item.id));
  }, [selectedIds, filteredData]);

  // Handle clear selection
  const handleClearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  // Handle export
  const handleExport = (format: ExportFormat) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${collectionType}_${timestamp}`;
    
    // Export filtered data (respects current search/filter)
    ExportService.export(filteredData, format, filename);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearch && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md w-full">
            <SearchBar
              onSearch={handleSearch}
              placeholder={placeholder}
              debounceMs={300}
            />
          </div>

          {/* Results Summary and Export */}
          {!loading && data && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasActiveSearch ? (
                  <span>
                    Showing {filteredCount} of {totalCount} items
                    {query && (
                      <span className="ml-1">
                        for "<span className="font-medium">{query}</span>"
                      </span>
                    )}
                  </span>
                ) : (
                  <span>{totalCount} items</span>
                )}
              </div>

              {/* Export Button */}
              {showExport && filteredData.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport('csv')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Action Toolbar */}
      {onSelectionChange && onBulkDelete && (
        <BulkActionToolbar
          selectedItems={selectedItems}
          onBulkDelete={onBulkDelete}
          onClearSelection={handleClearSelection}
          loading={bulkLoading}
          progress={bulkProgress}
        />
      )}

      {/* No Results Message */}
      {!loading && hasActiveSearch && filteredCount === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-medium">No results found</p>
          <p className="mt-1">
            Try adjusting your search query or{' '}
            <button
              onClick={clearAll}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              clear the search
            </button>
          </p>
        </div>
      )}

      {/* Collection Table */}
      <CollectionTable
        collectionType={collectionType}
        data={filteredData}
        loading={loading}
        error={error}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onRowClick={onRowClick}
        onRetry={onRetry}
      />
    </div>
  );
}
