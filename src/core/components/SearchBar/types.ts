// SearchBar type definitions

export interface SearchableField {
  key: string;
  label: string;
}

export interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: string;
}

export interface SearchBarProps {
  onSearch: (query: string, filters: FilterCriteria[]) => void;
  fields?: SearchableField[];
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}
