// DataTable type definitions

import { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string | (() => ReactNode);
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (info: { value: any; row: T }) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface SelectionConfig {
  enabled: boolean;
  multiple?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  selection?: SelectionConfig;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
  getRowId?: (row: T) => string;
}

export interface SortState {
  columnId: string;
  direction: 'asc' | 'desc';
}
