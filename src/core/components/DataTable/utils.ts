// DataTable utility functions

export interface PaginationResult<T> {
  paginatedData: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Paginate an array of data
 * @param data The full dataset
 * @param pageIndex Current page index (0-based)
 * @param pageSize Number of items per page
 * @returns Paginated data and metadata
 */
export function paginateData<T>(
  data: T[],
  pageIndex: number,
  pageSize: number
): PaginationResult<T> {
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = pageIndex * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    paginatedData,
    totalPages,
    startIndex,
    endIndex,
  };
}

/**
 * Sort an array of data by a field
 * @param data The dataset to sort
 * @param field The field to sort by
 * @param direction Sort direction
 * @returns Sorted data
 */
export function sortData<T>(
  data: T[],
  field: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

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
