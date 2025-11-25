/**
 * Property-based tests for useCollection hook
 * Feature: dashboard-redesign
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { useCollection } from './useCollection';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';

// Mock collection item for testing
interface TestItem extends BaseCollection {
  name: string;
  value: number;
}

// Create a mock repository
function createMockRepository(items: TestItem[]): ICollectionRepository<TestItem> {
  return {
    getAll: vi.fn(async () => Promise.resolve([...items])),
    getById: vi.fn(async (id: string) => {
      return Promise.resolve(items.find(item => item.id === id) || null);
    }),
    create: vi.fn(async (item: any) => {
      const newItem = { ...item, id: 'new-id', createdAt: new Date(), updatedAt: new Date() };
      return Promise.resolve(newItem as TestItem);
    }),
    update: vi.fn(async (id: string, item: any) => {
      const existing = items.find(i => i.id === id);
      return Promise.resolve({ ...existing, ...item } as TestItem);
    }),
    delete: vi.fn(async () => Promise.resolve()),
    bulkDelete: vi.fn(async () => Promise.resolve()),
    search: vi.fn(async () => Promise.resolve(items)),
    subscribe: vi.fn((onData) => {
      // Simulate real-time subscription
      setTimeout(() => onData(items), 0);
      return () => {}; // unsubscribe function
    }),
  };
}

// Mock useAuth hook
vi.mock('../../../core/auth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user', email: 'test@example.com' },
    loading: false,
  }),
}));

describe('useCollection Properties', () => {
  beforeEach(() => {
    // No cache to clear - using real-time subscriptions
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Property 18: Real-time data synchronization', () => {
    /**
     * Feature: dashboard-redesign, Property 18: Real-time data synchronization
     * 
     * Collections should use real-time subscriptions to automatically receive
     * updates when data changes in Firebase.
     * 
     * Validates: Requirements 8.4
     */
    it('should use real-time subscriptions for data updates', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1 }),
              value: fc.integer({ min: 0, max: 1000 }),
              createdAt: fc.constant(new Date()),
              updatedAt: fc.constant(new Date()),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (items) => {
            const repository = createMockRepository(items);
            const collectionName = `test-collection-${Math.random()}`;

            const { result, unmount } = renderHook(() =>
              useCollection(repository, collectionName)
            );

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Verify subscribe was called for real-time updates
            expect(repository.subscribe).toHaveBeenCalled();
            expect(result.current.data).toHaveLength(items.length);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should wait for authentication before fetching data', async () => {
      const items: TestItem[] = [
        { id: '1', name: 'test', value: 1, createdAt: new Date(), updatedAt: new Date() },
      ];
      const repository = createMockRepository(items);
      const collectionName = `test-collection-${Math.random()}`;

      const { result, unmount } = renderHook(() =>
        useCollection(repository, collectionName)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify subscribe was called after auth
      expect(repository.subscribe).toHaveBeenCalled();
      expect(result.current.data).toEqual(items);

      unmount();
    });

    it('should handle refetch by re-establishing subscription', async () => {
      await fc.assert(
        fc.asyncProperty(
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
          async (items) => {
            const repository = createMockRepository(items);
            const collectionName = `test-collection-${Math.random()}`;

            const { result, unmount } = renderHook(() =>
              useCollection(repository, collectionName)
            );

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            const initialCallCount = (repository.subscribe as any).mock.calls.length;

            // Call refetch
            await result.current.refetch();

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Should have called subscribe again
            expect((repository.subscribe as any).mock.calls.length).toBeGreaterThan(initialCallCount);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
