# Implementation Plan

- [x] 1. Set up Clean Architecture folder structure and core infrastructure



  - Create feature-based directory structure (src/core, src/features)
  - Set up testing infrastructure with Vitest and fast-check
  - Configure path aliases in tsconfig.json for clean imports
  - Create base types and interfaces for the domain layer
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Implement core reusable components


  - [x] 2.1 Create DataTable component with column configuration


    - Implement basic table rendering with configurable columns
    - Add column header rendering with custom renderers
    - Support row click handlers and basic styling
    - _Requirements: 3.1_

  - [x] 2.2 Write property test for DataTable pagination



    - **Property 9: Pagination boundary correctness**
    - **Validates: Requirements 3.1**

  - [x] 2.3 Add sorting functionality to DataTable


    - Implement column header click handlers for sorting
    - Add sort direction indicators (ascending/descending)
    - Support multi-column sorting
    - _Requirements: 3.2_

  - [x] 2.4 Write property test for DataTable sorting



    - **Property 10: Sort order correctness**
    - **Validates: Requirements 3.2**

  - [x] 2.5 Add pagination to DataTable


    - Implement page navigation controls
    - Add configurable page size selector
    - Display current page and total pages
    - _Requirements: 3.1_

  - [x] 2.6 Add row selection to DataTable



    - Implement checkbox selection (single and multi-select)
    - Add select all functionality
    - Track selected rows in state
    - _Requirements: 3.3_

  - [x] 2.7 Write property test for bulk selection state


    - **Property 11: Bulk selection state consistency**
    - **Validates: Requirements 3.3**

  - [x] 2.8 Add responsive design and virtual scrolling


    - Implement horizontal scrolling for many columns
    - Add fixed action columns
    - Integrate react-virtual for large datasets
    - _Requirements: 3.4, 3.5_

- [x] 3. Create SearchBar component with filtering capabilities


  - [x] 3.1 Implement basic search input with debouncing


    - Create search input component with icon
    - Add debounce logic (300ms delay)
    - Emit search events to parent
    - _Requirements: 1.1_

  - [x] 3.2 Add field-specific filter UI


    - Create filter dropdown for field selection
    - Add operator selection (contains, equals, etc.)
    - Display active filters as chips
    - _Requirements: 1.5_

  - [x] 3.3 Implement filter clearing functionality

    - Add clear all filters button
    - Add individual filter chip removal
    - Emit clear events to parent
    - _Requirements: 1.4_

  - [x] 3.4 Write property test for search filtering

    - **Property 1: Search filtering correctness**
    - **Validates: Requirements 1.1, 1.5**

  - [x] 3.5 Write property test for multi-criteria filtering

    - **Property 2: Multi-criteria filter conjunction**
    - **Validates: Requirements 1.2**

  - [x] 3.6 Write property test for search clear

    - **Property 3: Search clear restores original state**
    - **Validates: Requirements 1.4**

- [x] 4. Build Modal component for forms and confirmations


  - [x] 4.1 Create base Modal component


    - Implement modal overlay and content container
    - Add backdrop click handling
    - Implement ESC key to close
    - Add ARIA labels and focus trap for accessibility
    - _Requirements: 4.3, 5.1_

  - [x] 4.2 Write unit test for Modal keyboard navigation


    - Test ESC key closes modal
    - Test focus trap keeps focus within modal
    - Test backdrop click closes modal
    - _Requirements: 4.3_

- [x] 5. Implement domain layer for collections feature

  - [x] 5.1 Define collection entity interfaces


    - Create BaseCollection interface with common fields
    - Define specific interfaces for each collection type (CarouselItem, Video, etc.)
    - Create SearchCriteria, FilterCriteria, and SortCriteria types
    - _Requirements: 1.2, 3.2_

  - [x] 5.2 Create ICollectionRepository interface

    - Define repository methods (getAll, getById, create, update, delete, bulkDelete, search)
    - Add TypeScript generics for type safety
    - Document expected behavior for each method
    - _Requirements: 6.2_

  - [x] 5.3 Implement CollectionService



    - Create service class with repository dependency injection
    - Implement getItems with optional filtering
    - Implement createItem, updateItem, deleteItem methods
    - Add bulkDeleteItems for bulk operations
    - _Requirements: 4.4, 5.3_

  - [x] 5.4 Write property test for bulk operation completeness



    - **Property 13: Bulk operation completeness**
    - **Validates: Requirements 4.4**

  - [x] 5.5 Implement SearchService

    - Create search method with query and field parameters
    - Implement filter method for FilterCriteria array
    - Implement sort method with field and direction
    - Use case-insensitive matching for search
    - _Requirements: 1.1, 1.2, 3.2_


  - [x] 5.6 Create field visibility configuration

    - Define FieldVisibilityConfig interface
    - Create FIELD_CONFIGS object with rules for each collection type
    - Implement getVisibleFields utility function
    - _Requirements: 2.1, 2.5_


  - [x] 5.7 Write property test for default field visibility

    - **Property 4: Default field visibility enforcement**
    - **Validates: Requirements 2.1**

  - [x] 5.8 Write property test for collection-specific visibility

    - **Property 8: Collection-specific visibility rules**
    - **Validates: Requirements 2.5**

- [x] 6. Implement data layer with Firebase integration



  - [x] 6.1 Create FirebaseCollectionRepository


    - Implement ICollectionRepository interface
    - Use Firestore SDK for CRUD operations
    - Add error handling and retry logic
    - Map Firestore documents to domain entities
    - _Requirements: 6.2_

  - [x] 6.2 Implement collection data mappers


    - Create mapper functions to convert Firestore docs to entities
    - Create mapper functions to convert entities to Firestore docs
    - Handle timestamp conversions (Firestore Timestamp to Date)
    - _Requirements: 6.1_

  - [x] 6.3 Add error handling with DashboardError class


    - Create DashboardError class with code, severity, and recoverable fields
    - Wrap repository errors with appropriate DashboardError instances
    - Add error codes for common scenarios (not-found, permission-denied, etc.)
    - _Requirements: 9.3_

  - [x] 6.4 Write property test for error notification


    - **Property 22: Error notification on operation failure**
    - **Validates: Requirements 9.3**

- [x] 7. Create custom hooks for collection management



  - [x] 7.1 Implement useCollection hook


    - Fetch collection data on mount
    - Implement caching with 5-minute TTL
    - Return loading, error, and data states
    - Add refetch function
    - _Requirements: 8.4_

  - [x] 7.2 Write property test for data caching



    - **Property 18: Data caching prevents redundant requests**
    - **Validates: Requirements 8.4**

  - [x] 7.3 Implement useCollectionSearch hook


    - Accept search query and filter criteria
    - Apply SearchService filtering to collection data
    - Debounce search input
    - Return filtered results
    - _Requirements: 1.1, 1.2_

  - [x] 7.4 Implement useCollectionMutations hook


    - Provide create, update, delete, and bulkDelete functions
    - Implement optimistic UI updates
    - Handle rollback on error
    - Invalidate cache after successful mutations
    - _Requirements: 8.5_

  - [x] 7.5 Write property test for optimistic updates


    - **Property 19: Optimistic UI update immediacy**
    - **Validates: Requirements 8.5**

  - [x] 7.6 Implement useFieldVisibility hook


    - Accept collection type and current view mode (table/detail)
    - Return visible fields based on configuration
    - Filter out empty fields
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 7.7 Write property test for empty field hiding


    - **Property 7: Empty field hiding**
    - **Validates: Requirements 2.4**

  - [x] 7.8 Write property test for expanded view completeness

    - **Property 5: Expanded view completeness**
    - **Validates: Requirements 2.2**

- [x] 8. Build CollectionTable component



  - [x] 8.1 Create CollectionTable component


    - Integrate DataTable with collection data
    - Configure columns based on field visibility
    - Add action column with edit and delete buttons
    - Handle row selection for bulk operations
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 4.1_

  - [x] 8.2 Add loading and error states



    - Display loading spinner during data fetch
    - Show error message on fetch failure
    - Display empty state when no items exist
    - _Requirements: 9.1_

  - [x] 8.3 Write property test for loading indicators



    - **Property 20: Loading indicator presence during async operations**
    - **Validates: Requirements 9.1**

  - [x] 8.4 Integrate SearchBar component




    - Add SearchBar above table
    - Connect search to useCollectionSearch hook
    - Display active filters
    - Show "no results" message when search returns empty
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 8.5 Add bulk action toolbar


    - Show toolbar when items are selected
    - Add bulk delete button
    - Display count of selected items
    - Confirm bulk operations with modal
    - _Requirements: 3.3, 4.4_

- [x] 9. Create CollectionForm component


  - [x] 9.1 Build dynamic form generator


    - Generate form fields based on collection schema
    - Distinguish required vs optional fields
    - Add appropriate input types (text, number, select, textarea)
    - _Requirements: 5.1_

  - [x] 9.2 Implement form validation




    - Add required field validation
    - Implement field-specific validation rules (email, URL, etc.)
    - Display validation errors inline
    - Prevent submission when validation fails
    - _Requirements: 5.2_

  - [x] 9.3 Write property test for form validation blocking



    - **Property 14: Form validation blocking**
    - **Validates: Requirements 5.2**

  - [x] 9.4 Add real-time validation feedback


    - Validate fields on blur
    - Show error messages immediately
    - Clear errors when field becomes valid
    - _Requirements: 5.4_

  - [x] 9.5 Write property test for real-time validation



    - **Property 16: Real-time validation feedback**
    - **Validates: Requirements 5.4**

  - [x] 9.6 Implement form submission


    - Handle create and update modes
    - Call appropriate mutation hook
    - Show loading state during submission
    - Display success notification on completion
    - _Requirements: 5.3, 9.2_

  - [x] 9.7 Write property test for form submission persistence


    - **Property 15: Successful form submission persistence**
    - **Validates: Requirements 5.3**

  - [x] 9.8 Write property test for success notifications

    - **Property 21: Success notification on operation completion**
    - **Validates: Requirements 9.2**

  - [x] 9.9 Implement form cancellation


    - Add cancel button
    - Discard unsaved changes
    - Close form modal
    - _Requirements: 5.5_

  - [x] 9.10 Write property test for form cancellation


    - **Property 17: Form cancellation state preservation**
    - **Validates: Requirements 5.5**

  - [x] 9.11 Add edit mode with data population


    - Accept item prop for edit mode
    - Pre-populate form fields with item data
    - Update form title to indicate edit mode
    - _Requirements: 4.2_

  - [x] 9.12 Write property test for edit form population


    - **Property 12: Edit form data population**
    - **Validates: Requirements 4.2**

- [x] 10. Implement Toast notification system



  - [x] 10.1 Create Toast component


    - Display notification with icon, message, and close button
    - Support different types (success, error, info, warning)
    - Auto-dismiss after configurable timeout
    - _Requirements: 9.2, 9.3_

  - [x] 10.2 Create ToastProvider context


    - Manage toast queue
    - Provide addToast function
    - Handle toast positioning and stacking
    - _Requirements: 9.5_

  - [x] 10.3 Write property test for notification queuing

    - **Property 24: Notification queuing without overlap**
    - **Validates: Requirements 9.5**

  - [x] 10.4 Integrate toasts with mutation hooks

    - Show success toast on successful operations
    - Show error toast on failed operations
    - Include operation details in toast message
    - _Requirements: 9.2, 9.3_

- [x] 11. Add export functionality



  - [x] 11.1 Create ExportService


    - Implement exportToCSV method
    - Implement exportToJSON method
    - Handle field formatting for export
    - _Requirements: 10.2_

  - [x] 11.2 Write property test for export format support

    - **Property 26: Export format support**
    - **Validates: Requirements 10.2**

  - [x] 11.3 Add export button to CollectionTable


    - Add export dropdown with CSV and JSON options
    - Trigger download on selection
    - Show loading state during export
    - _Requirements: 10.1_

  - [x] 11.4 Implement filtered export

    - Pass current filter criteria to export service
    - Export only visible/filtered items
    - Include search query in export filename
    - _Requirements: 10.5_

  - [x] 11.5 Write property test for filtered export

    - **Property 25: Export content matches filtered view**
    - **Validates: Requirements 10.1, 10.5**

- [x] 12. Build CollectionPage component





  - [x] 12.1 Create CollectionPage layout




    - Add page header with collection title
    - Add "Add New" button
    - Integrate CollectionTable component
    - Handle modal state for add/edit forms
    - _Requirements: 5.1_

  - [x] 12.2 Implement add item flow


    - Open CollectionForm modal on "Add New" click
    - Pass collection type to form
    - Refresh table after successful add
    - _Requirements: 5.3_

  - [x] 12.3 Implement edit item flow


    - Open CollectionForm modal with item data on edit click
    - Update table after successful edit
    - _Requirements: 4.2_

  - [x] 12.4 Implement delete confirmation


    - Show confirmation modal on delete click
    - Call delete mutation on confirmation
    - Refresh table after successful delete
    - _Requirements: 4.3_

  - [x] 12.5 Add column visibility customization


    - Add column selector dropdown
    - Save preferences to localStorage
    - Load preferences on page mount
    - _Requirements: 2.3_

  - [x] 12.6 Write property test for column preference persistence


    - **Property 6: Column preference persistence round-trip**
    - **Validates: Requirements 2.3**

- [x] 13. Implement progress reporting for long operations

  - [x] 13.1 Add progress tracking to bulk operations
    - Track completion count during bulk delete
    - Emit progress events
    - Display progress bar in UI
    - _Requirements: 9.4_

  - [ ]* 13.2 Write property test for progress reporting
    - **Property 23: Progress reporting for long operations**
    - **Validates: Requirements 9.4**

- [x] 14. Migrate existing collections to new architecture



  - [x] 14.1 Create generic CollectionPage component
    - Generic CollectionPage component has been created
    - Supports all CRUD operations with proper modals
    - Integrates with all hooks and services
    - _Requirements: 2.5_

  - [x] 14.2 Create collection-specific page instances


    - Create specific page files for carousel_items, home_images, forum, learn, quizes, videos
    - Configure field visibility for each collection type
    - Define form field configurations for each collection
    - Create repository instances for each collection
    - _Requirements: 2.5, 5.1_

  - [x] 14.3 Set up routing for collection pages


    - Add routes for each collection page in main.tsx
    - Update router configuration with collection paths
    - Ensure proper navigation between pages
    - _Requirements: 7.4_

  - [x] 14.4 Update navigation sidebar


    - Update Sidebar component to use React Router Links
    - Link to new collection page routes instead of state management
    - Maintain existing navigation structure
    - Add active state indicators based on current route
    - _Requirements: 7.4_

  - [x] 14.5 Preserve quiz-specific functionality



    - Migrate QuizManager component to new architecture
    - Maintain quiz question multi-step form
    - Integrate with new CollectionService
    - Create dedicated quiz page with custom form
    - _Requirements: 5.3_

  - [x] 14.6 Remove legacy components


    - Remove or deprecate old Adder and Displayer components
    - Clean up unused state management in App.tsx
    - Update App.tsx to use new routing structure
    - _Requirements: 6.1, 7.1_

- [x] 15. Add performance optimizations



  - [x] 15.1 Implement code splitting


    - Add lazy loading for collection pages
    - Split vendor bundles
    - Add loading fallbacks
    - _Requirements: 8.1_

  - [x] 15.2 Add memoization to expensive components


    - Wrap DataTable with React.memo
    - Use useMemo for sorting and filtering
    - Use useCallback for event handlers
    - _Requirements: 8.2_

  - [x] 15.3 Optimize search performance


    - Add search result caching
    - Implement search index for large collections
    - Use Web Workers for heavy filtering (optional)
    - _Requirements: 8.2_

- [x] 16. Final checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Fix Clean Architecture violations






  - [x] 17.1 Create repository factory for dependency injection


    - Create RepositoryFactory class in src/features/collections/data/factories/
    - Implement createRepository function that returns ICollectionRepository
    - Create barrel export in src/features/collections/data/index.ts
    - _Requirements: 6.2, 6.3_

  - [x] 17.2 Update collection pages to use repository factory


    - Replace direct FirebaseCollectionRepository imports with createRepository
    - Update CarouselItemsPage, HomeImagesPage, ForumPage, LearnPage, QuizesPage, VideosPage
    - Move repository instantiation inside component functions
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 17.3 Create authentication service abstraction


    - Create IAuthService interface in src/core/auth/domain/
    - Implement FirebaseAuthService in src/core/auth/data/
    - Create AuthProvider context that uses IAuthService
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 17.4 Update App.tsx and Login.tsx to use auth service


    - Replace direct Firebase auth imports with IAuthService
    - Update App.tsx to use AuthProvider
    - Update Login.tsx to use useAuth hook
    - _Requirements: 6.3, 6.5_

  - [x] 17.5 Move collection pages to feature directory


    - Move src/pages/CarouselItemsPage.tsx to src/features/collections/pages/
    - Move src/pages/HomeImagesPage.tsx to src/features/collections/pages/
    - Move src/pages/ForumPage.tsx to src/features/collections/pages/
    - Move src/pages/LearnPage.tsx to src/features/collections/pages/
    - Move src/pages/QuizesPage.tsx to src/features/collections/pages/
    - Move src/pages/VideosPage.tsx to src/features/collections/pages/
    - Update all import paths in main.tsx and other files
    - _Requirements: 7.1, 7.2_

  - [x] 17.6 Remove duplicate ToastContext


    - Delete src/context/ToastContext.tsx or convert to re-export
    - Update any remaining imports to use src/core/components/Toast/ToastProvider
    - Verify no broken imports remain
    - _Requirements: 6.1, 7.1_

  - [x] 17.7 Verify Clean Architecture compliance




    - Run architecture validation checks
    - Ensure domain layer has no data/presentation imports
    - Ensure presentation layer uses only domain interfaces
    - Document architectural boundaries in ARCHITECTURE.md
    - _Requirements: 6.4, 6.5_
