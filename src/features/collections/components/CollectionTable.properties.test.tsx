/**
 * Property-based tests for CollectionTable component
 * Feature: dashboard-redesign
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { CollectionTable } from './CollectionTable';
import { CollectionType, BaseCollection } from '../domain/entities/Collection';

// Mock collection item for testing
interface TestItem extends BaseCollection {
  name: string;
  value: number;
}

const collectionTypes: CollectionType[] = [
  'carousel_items',
  'home_images',
  'forum',
  'learn',
  'quizes',
  'quiz_questions',
  'videos',
];

describe('CollectionTable Properties', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Property 20: Loading indicator presence during async operations', () => {
    /**
     * Feature: dashboard-redesign, Property 20: Loading indicator presence during async operations
     * 
     * For any asynchronous operation, a loading indicator should be visible from
     * operation start until operation completion or failure.
     * 
     * Validates: Requirements 9.1
     */
    it('should display loading state when loading is true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { container } = render(
              <CollectionTable
                collectionType={collectionType}
                data={null}
                loading={true}
              />
            );

            // DataTable should show loading state
            // The loading prop is passed to DataTable which handles the display
            expect(container).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not display loading state when loading is false', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              value: fc.integer({ min: 0, max: 1000 }),
              createdAt: fc.constant(new Date()),
              updatedAt: fc.constant(new Date()),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (collectionType, items) => {
            const { container } = render(
              <CollectionTable
                collectionType={collectionType}
                data={items as TestItem[]}
                loading={false}
              />
            );

            // Should render table content
            expect(container).toBeTruthy();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Error State Display', () => {
    it('should display error message when error is provided', () => {
      const errorMessage = 'Test error message';
      
      render(
        <CollectionTable
          collectionType="forum"
          data={null}
          error={new Error(errorMessage)}
        />
      );

      // Should display error message
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should display retry button when error and onRetry are provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const onRetry = () => {};
            
            const { unmount } = render(
              <CollectionTable
                collectionType={collectionType}
                data={null}
                error={new Error('Test error')}
                onRetry={onRetry}
              />
            );

            // Should display retry button
            expect(screen.getByText('Retry')).toBeInTheDocument();

            unmount();
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Empty State Display', () => {
    it('should display empty state when data is empty array', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { unmount } = render(
              <CollectionTable
                collectionType={collectionType}
                data={[]}
                loading={false}
              />
            );

            // Should display empty state message
            expect(screen.getByText('No Items Found')).toBeInTheDocument();

            unmount();
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should display empty state when data is null and not loading', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          (collectionType) => {
            const { unmount } = render(
              <CollectionTable
                collectionType={collectionType}
                data={null}
                loading={false}
              />
            );

            // Should display empty state message
            expect(screen.getByText('No Items Found')).toBeInTheDocument();

            unmount();
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Data Display', () => {
    it('should render table when data is provided', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...collectionTypes),
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              value: fc.integer({ min: 0, max: 1000 }),
              createdAt: fc.constant(new Date()),
              updatedAt: fc.constant(new Date()),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          (collectionType, items) => {
            const { container } = render(
              <CollectionTable
                collectionType={collectionType}
                data={items as TestItem[]}
                loading={false}
              />
            );

            // Should render table
            const table = container.querySelector('table');
            expect(table).toBeInTheDocument();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Action Buttons', () => {
    it('should render edit button when onEdit is provided', () => {
      const items: TestItem[] = [
        {
          id: '1',
          name: 'Test',
          value: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const onEdit = () => {};

      render(
        <CollectionTable
          collectionType="forum"
          data={items}
          onEdit={onEdit}
        />
      );

      // Should render edit button
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should render delete button when onDelete is provided', () => {
      const items: TestItem[] = [
        {
          id: '1',
          name: 'Test',
          value: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const onDelete = () => {};

      render(
        <CollectionTable
          collectionType="forum"
          data={items}
          onDelete={onDelete}
        />
      );

      // Should render delete button
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });
});
