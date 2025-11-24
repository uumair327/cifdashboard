/**
 * Property-based tests for useCollection hook
 * Feature: dashboard-redesign
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { useCollection, clearCollectionCache, getCollectionCacheStats } from './useCollection';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';

// Mock collection item for testing
interface TestItem extends BaseCollection {
  name: string;
  value: number;
}

// Create a mock repository
function createMockRepository(items: TestItem[]): ICollectionRepository<TestItem> {
  let callCount = 0;
  
  return {
    getAll: vi.fn(async () => {
      callCount++;
      return Promise.resolve([...items]);
    }),
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
  };
}

describe('useCollection Properties', () => {
  beforeEach(() => {
    clearCollectionCache();
  });

  afterEach(() => {
    clearCollectionCache();
  });

  describe('Property 18: Data caching prevents redundant requests', () => {
    /**
     * Feature: dashboard-redesign, Property 18: Data caching prevents redundant requests
     * 
     * For any collection that has been loaded, switching away and back to that collection
     * should not trigger a new repository request if the data is still cached and valid.
     * 
     * Validates: Requirements 8.4
     */
    it('should not make redundant requests when cache is valid', async () => {
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

            // First render - should fetch data
            const { result: result1, unmount: unmount1 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            expect(result1.current.data).toHaveLength(items.length);
            expect(repository.getAll).toHaveBeenCalledTimes(1);

            unmount1();

            // Second render - should use cache, not fetch again
            const { result: result2, unmount: unmount2 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result2.current.data).not.toBeNull();
            });

            expect(result2.current.data).toHaveLength(items.length);
            // Should still be 1 call - cache was used
            expect(repository.getAll).toHaveBeenCalledTimes(1);

            unmount2();
          }
        ),
        { numRuns: 20 } // Reduced runs for async tests
      );
    });

    it('should fetch new data when cache expires', async () => {
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
            const shortTTL = 100; // 100ms cache

            // First render
            const { result: result1, unmount: unmount1 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: shortTTL })
            );

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            expect(repository.getAll).toHaveBeenCalledTimes(1);
            unmount1();

            // Wait for cache to expire
            await new Promise(resolve => setTimeout(resolve, shortTTL + 50));

            // Second render - cache expired, should fetch again
            const { result: result2, unmount: unmount2 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: shortTTL })
            );

            await waitFor(() => {
              expect(result2.current.loading).toBe(false);
            });

            // Should have made 2 calls total
            expect(repository.getAll).toHaveBeenCalledTimes(2);

            unmount2();
          }
        ),
        { numRuns: 10 } // Reduced runs for async tests with delays
      );
    });

    it('should share cache across multiple hook instances with same collection name', async () => {
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

            // First hook instance
            const { result: result1, unmount: unmount1 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            expect(repository.getAll).toHaveBeenCalledTimes(1);

            // Second hook instance with same collection name (simultaneous)
            const { result: result2, unmount: unmount2 } = renderHook(() =>
              useCollection(repository, collectionName, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result2.current.data).not.toBeNull();
            });

            // Should still only have 1 call - second instance used cache
            expect(repository.getAll).toHaveBeenCalledTimes(1);
            
            // Both should have the same data
            expect(result1.current.data).toEqual(result2.current.data);

            unmount1();
            unmount2();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should maintain separate caches for different collection names', async () => {
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
          async (items1, items2) => {
            const repository1 = createMockRepository(items1);
            const repository2 = createMockRepository(items2);
            const collectionName1 = `test-collection-1-${Math.random()}`;
            const collectionName2 = `test-collection-2-${Math.random()}`;

            // Fetch first collection
            const { result: result1, unmount: unmount1 } = renderHook(() =>
              useCollection(repository1, collectionName1, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            // Fetch second collection
            const { result: result2, unmount: unmount2 } = renderHook(() =>
              useCollection(repository2, collectionName2, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result2.current.loading).toBe(false);
            });

            // Each should have been called once
            expect(repository1.getAll).toHaveBeenCalledTimes(1);
            expect(repository2.getAll).toHaveBeenCalledTimes(1);

            // Data should be different
            expect(result1.current.data).toHaveLength(items1.length);
            expect(result2.current.data).toHaveLength(items2.length);

            unmount1();
            unmount2();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when refetch is called', async () => {
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
              useCollection(repository, collectionName, { cacheTTL: 5000 })
            );

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            expect(repository.getAll).toHaveBeenCalledTimes(1);

            // Call refetch
            await result.current.refetch();

            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Should have made 2 calls total
            expect(repository.getAll).toHaveBeenCalledTimes(2);

            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should track cache statistics correctly', async () => {
      const items: TestItem[] = [
        { id: '1', name: 'test', value: 1, createdAt: new Date(), updatedAt: new Date() },
      ];
      const repository = createMockRepository(items);
      const collectionName = `test-collection-${Math.random()}`;

      const { result, unmount } = renderHook(() =>
        useCollection(repository, collectionName, { cacheTTL: 5000 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stats = getCollectionCacheStats();
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.entries.some(e => e.name === collectionName)).toBe(true);

      unmount();
    });
  });
});
