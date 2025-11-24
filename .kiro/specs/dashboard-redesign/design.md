# Design Document

## Overview

The dashboard redesign transforms the CIF Guardian Care application into an industrial-standard content management system using Clean Architecture principles and feature-based organization. The system separates concerns into distinct layers (presentation, domain, data) while organizing code by business capabilities (collections, search, authentication) rather than technical layers.

The architecture enables independent testing, maintainability, and scalability by ensuring that business logic remains independent of frameworks, UI, and external services. Each feature module encapsulates its own components, hooks, services, and types, promoting high cohesion and low coupling.

## Architecture

### Layer Structure

The application follows Clean Architecture with three primary layers:

**1. Presentation Layer** (`src/features/*/components`, `src/features/*/pages`)
- React components and pages
- UI state management
- User interaction handling
- Depends on: Domain layer only

**2. Domain Layer** (`src/features/*/domain`)
- Business logic and rules
- Entity definitions and interfaces
- Use cases and application services
- Depends on: Nothing (pure business logic)

**3. Data Layer** (`src/features/*/data`)
- Repository implementations
- API clients and Firebase integration
- Data transformation and mapping
- Depends on: Domain layer interfaces

### Feature-Based Organization

```
src/
├── core/                          # Shared infrastructure
│   ├── components/                # Reusable UI components
│   │   ├── DataTable/
│   │   ├── SearchBar/
│   │   ├── Modal/
│   │   └── Toast/
│   ├── hooks/                     # Shared hooks
│   ├── utils/                     # Utility functions
│   └── types/                     # Common types
│
├── features/
│   ├── collections/               # Collection management feature
│   │   ├── components/
│   │   │   ├── CollectionTable.tsx
│   │   │   ├── CollectionForm.tsx
│   │   │   ├── CollectionFilters.tsx
│   │   │   └── BulkActions.tsx
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── Collection.ts
│   │   │   ├── repositories/
│   │   │   │   └── ICollectionRepository.ts
│   │   │   └── services/
│   │   │       ├── CollectionService.ts
│   │   │       └── SearchService.ts
│   │   ├── data/
│   │   │   ├── repositories/
│   │   │   │   └── FirebaseCollectionRepository.ts
│   │   │   └── mappers/
│   │   │       └── CollectionMapper.ts
│   │   ├── hooks/
│   │   │   ├── useCollection.ts
│   │   │   ├── useCollectionSearch.ts
│   │   │   └── useCollectionMutations.ts
│   │   └── pages/
│   │       └── CollectionPage.tsx
│   │
│   ├── auth/                      # Authentication feature
│   │   ├── components/
│   │   ├── domain/
│   │   ├── data/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   └── dashboard/                 # Dashboard layout feature
│       ├── components/
│       ├── hooks/
│       └── pages/
│
└── App.tsx
```

## Components and Interfaces

### Core Components

#### DataTable Component
A reusable, feature-rich table component supporting:
- Column configuration with custom renderers
- Sorting (single and multi-column)
- Pagination with configurable page sizes
- Row selection (single and multi-select)
- Responsive design with horizontal scrolling
- Virtual scrolling for large datasets
- Fixed action columns

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  selection?: SelectionConfig;
  onRowClick?: (row: T) => void;
  actions?: ActionConfig<T>[];
}
```

#### SearchBar Component
Advanced search interface with:
- Real-time search with debouncing
- Field-specific filtering
- Filter chips showing active filters
- Clear all filters action
- Search history (optional)

```typescript
interface SearchBarProps {
  onSearch: (query: string, filters: FilterCriteria[]) => void;
  fields: SearchableField[];
  placeholder?: string;
  debounceMs?: number;
}
```

#### Modal Component
Flexible modal for forms and confirmations:
- Configurable size and position
- Backdrop click handling
- Keyboard navigation (ESC to close)
- Accessibility compliant (ARIA labels, focus trap)

### Domain Interfaces

#### ICollectionRepository
```typescript
interface ICollectionRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
  search(criteria: SearchCriteria): Promise<T[]>;
}
```

#### CollectionService
```typescript
class CollectionService<T> {
  constructor(private repository: ICollectionRepository<T>);
  
  async getItems(filters?: FilterCriteria[]): Promise<T[]>;
  async createItem(data: Omit<T, 'id'>): Promise<T>;
  async updateItem(id: string, data: Partial<T>): Promise<T>;
  async deleteItem(id: string): Promise<void>;
  async bulkDeleteItems(ids: string[]): Promise<void>;
  async exportItems(format: 'csv' | 'json', filters?: FilterCriteria[]): Promise<Blob>;
}
```

#### SearchService
```typescript
class SearchService<T> {
  search(items: T[], query: string, fields: string[]): T[];
  filter(items: T[], criteria: FilterCriteria[]): T[];
  sort(items: T[], sortBy: string, direction: 'asc' | 'desc'): T[];
}
```

## Data Models

### Collection Entity
```typescript
interface BaseCollection {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CarouselItem extends BaseCollection {
  type: string;
  imageUrl: string;
  link: string;
  thumbnailUrl: string;
}

interface Video extends BaseCollection {
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
}

// Similar interfaces for other collection types
```

### Search and Filter Models
```typescript
interface SearchCriteria {
  query: string;
  fields: string[];
  filters: FilterCriteria[];
}

interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
  value: any;
}

interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}
```

### Field Visibility Configuration
```typescript
interface FieldVisibilityConfig {
  collectionType: string;
  defaultFields: string[];      // Always visible
  expandableFields: string[];   // Visible in detail view
  hiddenFields: string[];        // Never shown in UI
}

const FIELD_CONFIGS: Record<string, FieldVisibilityConfig> = {
  carousel_items: {
    defaultFields: ['type', 'imageUrl', 'link'],
    expandableFields: ['thumbnailUrl', 'createdAt', 'updatedAt'],
    hiddenFields: ['id']
  },
  // ... other collections
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Search filtering correctness
*For any* collection of items and any search query, all items returned by the search function should contain the search query in at least one of their searchable fields (case-insensitive).
**Validates: Requirements 1.1, 1.5**

### Property 2: Multi-criteria filter conjunction
*For any* collection of items and any set of filter criteria, all items returned should satisfy every filter criterion simultaneously (AND logic).
**Validates: Requirements 1.2**

### Property 3: Search clear restores original state
*For any* collection of items, applying a search filter and then clearing it should return exactly the same set of items in the same order as the original unfiltered collection.
**Validates: Requirements 1.4**

### Property 4: Default field visibility enforcement
*For any* collection type, the table view should display only the fields specified in that collection's defaultFields configuration, excluding all other fields.
**Validates: Requirements 2.1**

### Property 5: Expanded view completeness
*For any* item in any collection, the expanded detail view should contain all fields present in the item's data structure, excluding only those in the hiddenFields configuration.
**Validates: Requirements 2.2**

### Property 6: Column preference persistence round-trip
*For any* set of column visibility preferences, saving the preferences and then loading them in a new session should return exactly the same preference configuration.
**Validates: Requirements 2.3**

### Property 7: Empty field hiding
*For any* item displayed in the UI, fields with null, undefined, or empty string values should not appear in the rendered output.
**Validates: Requirements 2.4**

### Property 8: Collection-specific visibility rules
*For any* two different collection types, their default visible fields should differ according to their respective FieldVisibilityConfig definitions.
**Validates: Requirements 2.5**

### Property 9: Pagination boundary correctness
*For any* collection of items and any page size, each page should contain exactly pageSize items (except the last page), and the union of all pages should equal the complete collection with no duplicates or omissions.
**Validates: Requirements 3.1**

### Property 10: Sort order correctness
*For any* collection of items and any sortable column, sorting by that column should produce a result where each item compares correctly (≤ or ≥) with its neighbors according to the sort direction.
**Validates: Requirements 3.2**

### Property 11: Bulk selection state consistency
*For any* set of selected items, the bulk action buttons should be enabled if and only if at least one item is selected.
**Validates: Requirements 3.3**

### Property 12: Edit form data population
*For any* item in a collection, opening the edit form should populate all form fields with values that exactly match the item's current data.
**Validates: Requirements 4.2**

### Property 13: Bulk operation completeness
*For any* set of selected items and any bulk operation, the operation should affect all and only the selected items, with no items affected outside the selection.
**Validates: Requirements 4.4**

### Property 14: Form validation blocking
*For any* form submission where required fields are missing or invalid, the submission should be prevented and validation errors should be displayed for each invalid field.
**Validates: Requirements 5.2**

### Property 15: Successful form submission persistence
*For any* valid form data, successful submission should result in a new item appearing in the collection with field values matching the submitted form data.
**Validates: Requirements 5.3**

### Property 16: Real-time validation feedback
*For any* form field with validation rules, entering invalid data should immediately trigger validation error messages without requiring form submission.
**Validates: Requirements 5.4**

### Property 17: Form cancellation state preservation
*For any* collection state before opening a form, canceling the form without submission should leave the collection in exactly the same state (no items added, modified, or deleted).
**Validates: Requirements 5.5**

### Property 18: Data caching prevents redundant requests
*For any* collection that has been loaded, switching away and back to that collection should not trigger a new repository request if the data is still cached and valid.
**Validates: Requirements 8.4**

### Property 19: Optimistic UI update immediacy
*For any* CRUD operation, the UI state should reflect the expected outcome immediately upon operation initiation, before the async operation completes.
**Validates: Requirements 8.5**

### Property 20: Loading indicator presence during async operations
*For any* asynchronous operation, a loading indicator should be visible from operation start until operation completion or failure.
**Validates: Requirements 9.1**

### Property 21: Success notification on operation completion
*For any* successfully completed operation, a success notification should be displayed containing information about the operation that completed.
**Validates: Requirements 9.2**

### Property 22: Error notification on operation failure
*For any* failed operation, an error notification should be displayed containing information about what went wrong.
**Validates: Requirements 9.3**

### Property 23: Progress reporting for long operations
*For any* operation that reports progress, progress information should be displayed and updated as the operation proceeds.
**Validates: Requirements 9.4**

### Property 24: Notification queuing without overlap
*For any* sequence of multiple notifications triggered in quick succession, each notification should be displayed in order without visual overlap.
**Validates: Requirements 9.5**

### Property 25: Export content matches filtered view
*For any* active filter criteria, the exported file should contain exactly the same items that are currently displayed in the filtered table view.
**Validates: Requirements 10.1, 10.5**

### Property 26: Export format support
*For any* collection data, the export function should successfully generate both CSV and JSON format files with equivalent data content.
**Validates: Requirements 10.2**

## Error Handling

### Error Categories

**1. Validation Errors**
- Form field validation failures
- Search query syntax errors
- Invalid filter criteria
- Handled at: Presentation layer with immediate user feedback

**2. Repository Errors**
- Firebase connection failures
- Permission denied errors
- Document not found errors
- Handled at: Data layer with retry logic and user notification

**3. Business Logic Errors**
- Attempting to delete non-existent items
- Bulk operations on empty selections
- Invalid state transitions
- Handled at: Domain layer with descriptive error messages

### Error Handling Strategy

```typescript
class DashboardError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'info' | 'warning' | 'error',
    public recoverable: boolean
  ) {
    super(message);
  }
}

// Usage in services
class CollectionService {
  async deleteItem(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      if (error.code === 'not-found') {
        throw new DashboardError(
          'Item not found. It may have been already deleted.',
          'ITEM_NOT_FOUND',
          'warning',
          true
        );
      }
      throw new DashboardError(
        'Failed to delete item. Please try again.',
        'DELETE_FAILED',
        'error',
        true
      );
    }
  }
}
```

### Error Recovery

- **Automatic Retry**: Network errors retry up to 3 times with exponential backoff
- **Optimistic Rollback**: Failed optimistic updates revert UI to previous state
- **Graceful Degradation**: If search fails, display full unfiltered list
- **User Actions**: All errors provide clear next steps (retry, cancel, contact support)

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests. Unit tests will cover:

**Component Testing**:
- DataTable rendering with various data configurations
- SearchBar user interactions and debouncing
- Modal open/close behavior and keyboard navigation
- Form validation and submission flows

**Service Testing**:
- CollectionService CRUD operations with mocked repositories
- SearchService filtering and sorting logic
- Export service file generation

**Hook Testing**:
- useCollection data fetching and caching
- useCollectionSearch filter application
- useCollectionMutations optimistic updates

### Property-Based Testing

The application will use **fast-check** as the property-based testing library for TypeScript. Property-based tests will verify universal properties across randomly generated inputs.

**Configuration**:
- Each property test will run a minimum of 100 iterations
- Each test will be tagged with: `**Feature: dashboard-redesign, Property {number}: {property_text}**`
- Each correctness property will be implemented by a SINGLE property-based test

**Test Organization**:
```
src/features/collections/__tests__/
├── CollectionService.test.ts          # Unit tests
├── CollectionService.properties.test.ts  # Property-based tests
├── SearchService.test.ts
└── SearchService.properties.test.ts
```

**Example Property Test Structure**:
```typescript
import fc from 'fast-check';

describe('SearchService Properties', () => {
  it('Property 1: Search filtering correctness', () => {
    /**
     * Feature: dashboard-redesign, Property 1: Search filtering correctness
     */
    fc.assert(
      fc.property(
        fc.array(fc.record({ /* item generator */ })),
        fc.string(),
        (items, query) => {
          const results = searchService.search(items, query, ['field1', 'field2']);
          return results.every(item => 
            Object.values(item).some(value => 
              String(value).toLowerCase().includes(query.toLowerCase())
            )
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify feature interactions:
- Complete CRUD workflows from UI to Firebase
- Search and filter combinations
- Bulk operations across multiple items
- Export functionality with real data

### Testing Principles

- **Test Pyramid**: Many unit tests, fewer integration tests, minimal E2E tests
- **Test Independence**: Each test should be runnable in isolation
- **Fast Feedback**: Unit tests complete in < 5 seconds total
- **Readable Tests**: Test names clearly describe what is being tested
- **Maintainable**: Tests should not break when implementation details change

## Performance Considerations

### Optimization Strategies

**1. Virtual Scrolling**
- Implement react-virtual or similar for tables with > 100 rows
- Render only visible rows plus small buffer
- Reduces DOM nodes and improves scroll performance

**2. Memoization**
- Use React.memo for expensive components (DataTable, CollectionForm)
- useMemo for expensive computations (sorting, filtering large datasets)
- useCallback for event handlers passed to child components

**3. Code Splitting**
- Lazy load feature modules
- Split vendor bundles (React, Firebase separate from app code)
- Route-based code splitting for each collection page

**4. Data Caching**
- Implement SWR (stale-while-revalidate) pattern
- Cache collection data for 5 minutes
- Invalidate cache on mutations
- Persist cache to localStorage for offline support

**5. Debouncing and Throttling**
- Debounce search input (300ms)
- Throttle scroll events for virtual scrolling
- Debounce window resize handlers

### Performance Targets

- **Initial Load**: < 2 seconds to interactive
- **Search Response**: < 300ms for collections under 1000 items
- **Page Navigation**: < 100ms
- **CRUD Operations**: Optimistic UI update < 50ms, server confirmation < 1 second

## Security Considerations

### Authentication and Authorization

- Firebase Authentication for user identity
- Firestore Security Rules for data access control
- Role-based access control (admin, editor, viewer)
- Session timeout after 30 minutes of inactivity

### Data Validation

- Client-side validation for UX
- Server-side validation (Firestore rules) for security
- Input sanitization to prevent XSS
- SQL injection not applicable (NoSQL database)

### Secure Communication

- HTTPS only in production
- Firebase SDK handles secure communication
- No sensitive data in URLs or logs
- API keys restricted by domain

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
- Set up Clean Architecture folder structure
- Implement core components (DataTable, SearchBar, Modal)
- Create repository interfaces and Firebase implementations
- Set up testing infrastructure

### Phase 2: Collections Feature (Week 3-4)
- Migrate existing collections to new architecture
- Implement search and filter functionality
- Add field visibility management
- Implement CRUD operations with new UI

### Phase 3: Advanced Features (Week 5-6)
- Add bulk operations
- Implement export functionality
- Add caching and performance optimizations
- Implement comprehensive error handling

### Phase 4: Testing and Polish (Week 7-8)
- Write property-based tests for all properties
- Complete unit test coverage
- Performance testing and optimization
- User acceptance testing

### Backward Compatibility

- Maintain existing Firebase collection structure
- No data migration required
- Old and new UI can coexist during transition
- Feature flags to enable new UI per collection type
