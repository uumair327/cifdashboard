import { useState, useMemo, useCallback, memo } from 'react';
import { ColumnDef, DataTableProps, SortState } from './types';
import { classNames } from '../../utils';
import { sortData, paginateData } from './utils';
import { CellRenderer } from './CellRenderer';

function DataTableComponent<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  selection,
  onRowClick,
  className,
  emptyMessage = 'No data available',
  getRowId = (row) => row.id || String(Math.random()),
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const pageSizeOptions = pagination?.pageSizeOptions || [10, 25, 50, 100];

  const getCellValue = (row: T, column: ColumnDef<T>): any => {
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey];
    }
    return null;
  };

  const handleSort = useCallback((column: ColumnDef<T>) => {
    if (!column.sortable) return;

    const columnKey = column.accessorKey;
    if (!columnKey) return;

    setSortState((prev) => {
      if (prev?.columnId === column.id) {
        // Toggle direction or clear sort
        if (prev.direction === 'asc') {
          return { columnId: column.id, direction: 'desc' };
        } else {
          return null; // Clear sort
        }
      } else {
        // New column sort
        return { columnId: column.id, direction: 'asc' };
      }
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortState) return data;

    const column = columns.find((col) => col.id === sortState.columnId);
    if (!column || !column.accessorKey) return data;

    return sortData(data, column.accessorKey, sortState.direction);
  }, [data, sortState, columns]);

  const paginatedResult = useMemo(() => {
    if (!pagination?.enabled) {
      return {
        paginatedData: sortedData,
        totalPages: 1,
        startIndex: 0,
        endIndex: sortedData.length,
      };
    }

    return paginateData(sortedData, pageIndex, pageSize);
  }, [sortedData, pageIndex, pageSize, pagination?.enabled]);

  const displayData = paginatedResult.paginatedData;
  const totalPages = paginatedResult.totalPages;

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    pagination?.onPageChange?.(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page
    pagination?.onPageSizeChange?.(newPageSize);
  };

  const handleRowSelection = (rowId: string) => {
    if (!selection?.enabled) return;

    setSelectedRowIds((prev) => {
      const newSelection = new Set(prev);
      
      if (selection.multiple) {
        if (newSelection.has(rowId)) {
          newSelection.delete(rowId);
        } else {
          newSelection.add(rowId);
        }
      } else {
        // Single selection
        if (newSelection.has(rowId)) {
          newSelection.clear();
        } else {
          newSelection.clear();
          newSelection.add(rowId);
        }
      }

      // Notify parent of selection change
      const selectedRows = displayData.filter((row) => newSelection.has(getRowId(row)));
      selection.onSelectionChange?.(selectedRows);

      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (!selection?.enabled || !selection.multiple) return;

    setSelectedRowIds((prev) => {
      const allCurrentPageIds = displayData.map(getRowId);
      const allSelected = allCurrentPageIds.every((id) => prev.has(id));

      const newSelection = new Set(prev);
      
      if (allSelected) {
        // Deselect all on current page
        allCurrentPageIds.forEach((id) => newSelection.delete(id));
      } else {
        // Select all on current page
        allCurrentPageIds.forEach((id) => newSelection.add(id));
      }

      // Notify parent of selection change
      const selectedRows = sortedData.filter((row) => newSelection.has(getRowId(row)));
      selection.onSelectionChange?.(selectedRows);

      return newSelection;
    });
  };

  const isRowSelected = (rowId: string) => selectedRowIds.has(rowId);
  const isAllSelected = displayData.length > 0 && displayData.every((row) => isRowSelected(getRowId(row)));
  const isSomeSelected = displayData.some((row) => isRowSelected(getRowId(row))) && !isAllSelected;

  const renderCell = (row: T, column: ColumnDef<T>) => {
    const value = getCellValue(row, column);
    
    // Use custom cell renderer if provided
    if (column.cell) {
      return column.cell({ value, row });
    }
    
    // Use smart cell renderer for default rendering
    return <CellRenderer value={value} />;
  };

  const renderHeader = (column: ColumnDef<T>) => {
    const headerContent = typeof column.header === 'function' ? column.header() : column.header;
    const isSorted = sortState?.columnId === column.id;
    const sortDirection = isSorted ? sortState.direction : null;

    if (!column.sortable) {
      return headerContent;
    }

    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <span>{headerContent}</span>
        <span className="flex flex-col">
          {sortDirection === 'asc' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          ) : sortDirection === 'desc' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
            </svg>
          )}
        </span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 table-fixed">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {selection?.enabled && selection.multiple && (
                <th scope="col" className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded cursor-pointer"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {renderHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
            {displayData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const selected = isRowSelected(rowId);

              return (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={classNames(
                    'transition-colors',
                    selected && 'bg-blue-50 dark:bg-blue-900/20',
                    onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {selection?.enabled && (
                    <td className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelection(rowId);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100 max-w-xs break-words"
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth || '300px',
                      }}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination?.enabled && totalPages > 1 && (
        <div className="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Showing <span className="font-medium">{paginatedResult.startIndex + 1}</span> to{' '}
                <span className="font-medium">{paginatedResult.endIndex}</span> of{' '}
                <span className="font-medium">{sortedData.length}</span> results
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="ml-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (pageIndex < 3) {
                    pageNum = i;
                  } else if (pageIndex > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = pageIndex - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={classNames(
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        pageNum === pageIndex
                          ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      )}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pageIndex + 1)}
                  disabled={pageIndex >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized version for performance
export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
