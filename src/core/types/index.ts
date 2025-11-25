// Core type definitions for the application

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SelectionConfig {
  enabled: boolean;
  multiple: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
