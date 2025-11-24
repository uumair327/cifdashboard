/**
 * Property-based tests for useCollectionMutations hook
 * Feature: dashboard-redesign
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import { useCollectionMutations } from './useCollectionMutations';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';
import { clearCollectionCache } from './useCollection';

// Mock collection item for testing
interface TestItem extends BaseCollection {
  name: string;
  value: number;
}

// Create a mock repository
function createMockRepository(): ICollectionRepository<TestItem> {
  return {
    getAll: vi.fn(async () => Promise.resolve([])),
    getById: vi.fn(async (id: string) => 
      Promise.resolve({ id, name: 'test', value: 1, createdAt: new Date(), updatedAt: new Date() })
    ),
    create: vi.fn(async (item: any) => {
      const newItem = { 
        ...item, 
        id: `id-${Math.random()}`, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      };
      return Promise.resolve(newItem as TestItem);
    }),
    update: vi.fn(async (id: string, item: any) => {
      return Promise.resolve({ 
        id, 
        ...item, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      } as TestItem);
    }),
    delete: vi.fn(async () => Promise.resolve()),
    bulkDelete: vi.fn(async () => Promise.resolve()),
    search: vi.fn(async () => Promise.resolve([])),
  };
}

describe('useCollectionMutations Properties', () => {
  beforeEach(() => {
    clearCollectionCache();
  });

  describe('Property 19: Optimistic UI update immediacy', () => {
    /**
     * Feature: dashboard-redesign, Property 19: Optimistic UI update immediacy
     * 
     * For any CRUD operation, the UI state should reflect the expected outcome
     * immediately upon operation initiation, before the async operation completes.
     * 
     * Validates: Requirements 8.5
     */
    it('should set loading state immediately when create is called', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1 }),
            value: fc.integer({ min: 0, max: 1000 }),
          }),
          async (item) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName })
            );

            // Initially not creating
            expect(result.current.creating).toBe(false);

            // Start create operation
            let createPromise: Promise<any>;
            act(() => {
              createPromise = result.current.create(item);
            });

            // Should immediately show creating state
            expect(result.current.creating).toBe(true);

            // Wait for operation to complete
            await act(async () => {
              await createPromise!;
            });

            // Should no longer be creating
            await waitFor(() => {
              expect(result.current.creating).toBe(false);
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should set loading state immediately when update is called', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.record({
            name: fc.string({ minLength: 1 }),
            value: fc.integer({ min: 0, max: 1000 }),
          }),
          async (id, updates) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName })
            );

            // Initially not updating
            expect(result.current.updating).toBe(false);

            // Start update operation
            let updatePromise: Promise<any>;
            act(() => {
              updatePromise = result.current.update(id, updates);
            });

            // Should immediately show updating state
            expect(result.current.updating).toBe(true);

            // Wait for operation to complete
            await act(async () => {
              await updatePromise!;
            });

            // Should no longer be updating
            await waitFor(() => {
              expect(result.current.updating).toBe(false);
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should set loading state immediately when delete is called', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (id) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName })
            );

            // Initially not deleting
            expect(result.current.deleting).toBe(false);

            // Start delete operation
            let deletePromise: Promise<any>;
            act(() => {
              deletePromise = result.current.deleteItem(id);
            });

            // Should immediately show deleting state
            expect(result.current.deleting).toBe(true);

            // Wait for operation to complete
            await act(async () => {
              await deletePromise!;
            });

            // Should no longer be deleting
            await waitFor(() => {
              expect(result.current.deleting).toBe(false);
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should set loading state immediately when bulkDelete is called', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
          async (ids) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName })
            );

            // Initially not bulk deleting
            expect(result.current.bulkDeleting).toBe(false);

            // Start bulk delete operation
            let bulkDeletePromise: Promise<any>;
            act(() => {
              bulkDeletePromise = result.current.bulkDelete(ids);
            });

            // Should immediately show bulk deleting state
            expect(result.current.bulkDeleting).toBe(true);

            // Wait for operation to complete
            await act(async () => {
              await bulkDeletePromise!;
            });

            // Should no longer be bulk deleting
            await waitFor(() => {
              expect(result.current.bulkDeleting).toBe(false);
            });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Mutation Success Callbacks', () => {
    it('should call onSuccess callback after successful create', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1 }),
            value: fc.integer({ min: 0, max: 1000 }),
          }),
          async (item) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;
            const onSuccess = vi.fn();

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName, onSuccess })
            );

            await act(async () => {
              await result.current.create(item);
            });

            expect(onSuccess).toHaveBeenCalledWith('create');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should call onSuccess callback after successful update', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.record({
            name: fc.string({ minLength: 1 }),
          }),
          async (id, updates) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;
            const onSuccess = vi.fn();

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName, onSuccess })
            );

            await act(async () => {
              await result.current.update(id, updates);
            });

            expect(onSuccess).toHaveBeenCalledWith('update');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should call onSuccess callback after successful delete', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          async (id) => {
            const repository = createMockRepository();
            const collectionName = `test-${Math.random()}`;
            const onSuccess = vi.fn();

            const { result } = renderHook(() =>
              useCollectionMutations(repository, { collectionName, onSuccess })
            );

            await act(async () => {
              await result.current.deleteItem(id);
            });

            expect(onSuccess).toHaveBeenCalledWith('delete');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Mutation Error Handling', () => {
    it('should call onError callback when create fails', async () => {
      const repository = createMockRepository();
      repository.create = vi.fn(async () => {
        throw new Error('Create failed');
      });

      const collectionName = `test-${Math.random()}`;
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useCollectionMutations(repository, { collectionName, onError })
      );

      await act(async () => {
        await result.current.create({ name: 'test', value: 1 });
      });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][1]).toBe('create');
    });

    it('should return null when create fails', async () => {
      const repository = createMockRepository();
      repository.create = vi.fn(async () => {
        throw new Error('Create failed');
      });

      const collectionName = `test-${Math.random()}`;

      const { result } = renderHook(() =>
        useCollectionMutations(repository, { collectionName })
      );

      let createResult: any;
      await act(async () => {
        createResult = await result.current.create({ name: 'test', value: 1 });
      });

      expect(createResult).toBeNull();
    });

    it('should return false when delete fails', async () => {
      const repository = createMockRepository();
      repository.delete = vi.fn(async () => {
        throw new Error('Delete failed');
      });

      const collectionName = `test-${Math.random()}`;

      const { result } = renderHook(() =>
        useCollectionMutations(repository, { collectionName })
      );

      let deleteResult: any;
      await act(async () => {
        deleteResult = await result.current.deleteItem('test-id');
      });

      expect(deleteResult).toBe(false);
    });
  });
});
