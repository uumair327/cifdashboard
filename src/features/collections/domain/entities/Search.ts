// Search and filter domain types

export interface SearchCriteria {
  query: string;
  fields: string[];
  filters: FilterCriteria[];
}

export interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export type FilterOperator = FilterCriteria['operator'];
