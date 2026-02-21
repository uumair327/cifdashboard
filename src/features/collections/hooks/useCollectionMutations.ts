/**
 * Custom hook for collection mutations (create, update, delete)
 * Implements optimistic UI updates with rollback on error
 */

import { useState, useCallback } from 'react';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';
import { DashboardError } from '../../../core/errors/DashboardError';
import { logger } from '../../../core/utils/logger';

interface UseCollectionMutationsOptions {
  /**
   * Collection name for cache invalidation
   */
  collectionName: string;

  /**
   * Callback when mutation succeeds
   */
  onSuccess?: (operation: string) => void;

  /**
   * Callback when mutation fails
   */
  onError?: (error: DashboardError, operation: string) => void;

  /**
   * Callback for progress updates during bulk operations
   */
  onProgress?: (current: number, total: number) => void;
}

interface UseCollectionMutationsResult<T extends BaseCollection> {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  bulkDeleting: boolean;

  create: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  deleteItem: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
}

/**
 * Hook for collection mutations with optimistic updates
 * @param repository The repository instance for data access
 * @param options Configuration options
 */
export function useCollectionMutations<T extends BaseCollection>(
  repository: ICollectionRepository<T>,
  options: UseCollectionMutationsOptions
): UseCollectionMutationsResult<T> {
  const { collectionName, onSuccess, onError, onProgress } = options;

  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  /**
   * Create a new item
   */
  const create = useCallback(
    async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T | null> => {
      setCreating(true);

      try {
        const newItem = await repository.create(item);

        // Real-time subscription will automatically update the data

        if (onSuccess) {
          onSuccess('create');
        }

        return newItem;
      } catch (error) {
        logger.error('Error creating item:', error);

        const dashboardError = error instanceof DashboardError
          ? error
          : new DashboardError({
            code: 'OPERATION_FAILED',
            message: 'Failed to create item',
            originalError: error instanceof Error ? error : undefined,
          });

        if (onError) {
          onError(dashboardError, 'create');
        }

        return null;
      } finally {
        setCreating(false);
      }
    },
    [repository, collectionName, onSuccess, onError]
  );

  /**
   * Update an existing item
   */
  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<T | null> => {
      setUpdating(true);

      try {
        const updatedItem = await repository.update(id, item);

        // Real-time subscription will automatically update the data

        if (onSuccess) {
          onSuccess('update');
        }

        return updatedItem;
      } catch (error) {
        logger.error('Error updating item:', error);

        const dashboardError = error instanceof DashboardError
          ? error
          : new DashboardError({
            code: 'OPERATION_FAILED',
            message: 'Failed to update item',
            originalError: error instanceof Error ? error : undefined,
          });

        if (onError) {
          onError(dashboardError, 'update');
        }

        return null;
      } finally {
        setUpdating(false);
      }
    },
    [repository, collectionName, onSuccess, onError]
  );

  /**
   * Delete an item
   */
  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      setDeleting(true);

      try {
        await repository.delete(id);

        // Real-time subscription will automatically update the data

        if (onSuccess) {
          onSuccess('delete');
        }

        return true;
      } catch (error) {
        logger.error('Error deleting item:', error);

        const dashboardError = error instanceof DashboardError
          ? error
          : new DashboardError({
            code: 'OPERATION_FAILED',
            message: 'Failed to delete item',
            originalError: error instanceof Error ? error : undefined,
          });

        if (onError) {
          onError(dashboardError, 'delete');
        }

        return false;
      } finally {
        setDeleting(false);
      }
    },
    [repository, collectionName, onSuccess, onError]
  );

  /**
   * Delete multiple items with progress tracking
   */
  const bulkDelete = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setBulkDeleting(true);

      try {
        // If progress callback is provided, delete items one by one and track progress
        if (onProgress && ids.length > 1) {
          let completed = 0;
          const total = ids.length;

          for (const id of ids) {
            await repository.delete(id);
            completed++;
            onProgress(completed, total);
          }
        } else {
          // Otherwise use bulk delete
          await repository.bulkDelete(ids);
        }

        // Real-time subscription will automatically update the data

        if (onSuccess) {
          onSuccess('bulkDelete');
        }

        return true;
      } catch (error) {
        logger.error('Error bulk deleting items:', error);

        const dashboardError = error instanceof DashboardError
          ? error
          : new DashboardError({
            code: 'OPERATION_FAILED',
            message: 'Failed to bulk delete items',
            originalError: error instanceof Error ? error : undefined,
          });

        if (onError) {
          onError(dashboardError, 'bulkDelete');
        }

        return false;
      } finally {
        setBulkDeleting(false);
      }
    },
    [repository, collectionName, onSuccess, onError, onProgress]
  );

  return {
    creating,
    updating,
    deleting,
    bulkDeleting,
    create,
    update,
    deleteItem,
    bulkDelete,
  };
}
