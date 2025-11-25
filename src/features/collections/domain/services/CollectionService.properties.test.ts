/**
 * Property-based tests for CollectionService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { CollectionService } from './CollectionService';
import { ICollectionRepository } from '../repositories/ICollectionRepository';

describe('CollectionService Properties', () => {
  describe('Property 13: Bulk operation completeness', () => {
    /**
     * Feature: dashboard-redesign, Property 13: Bulk operation completeness
     * 
     * For any set of selected items and any bulk operation, the operation should
     * affect all and only the selected items, with no items affected outside the selection.
     */
    it('should delete all and only selected items', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({ id: fc.integer().map(String), value: fc.string() }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.integer({ min: 0, max: 19 })),
          async (allItems, selectedIndices) => {
            // Create mock repository
            const mockRepo: ICollectionRepository<any> = {
              getAll: vi.fn().mockResolvedValue(allItems),
              getById: vi.fn(),
              create: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              bulkDelete: vi.fn().mockResolvedValue(undefined),
              search: vi.fn(),
            };

            const service = new CollectionService(mockRepo);

            // Get unique valid indices
            const validIndices = [...new Set(selectedIndices.filter(i => i < allItems.length))];
            const idsToDelete = validIndices.map(i => allItems[i].id);

            // Perform bulk delete
            await service.bulkDeleteItems(idsToDelete);

            // Verify behavior based on whether there are items to delete
            if (idsToDelete.length > 0) {
              expect(mockRepo.bulkDelete).toHaveBeenCalledWith(idsToDelete);
              expect(mockRepo.bulkDelete).toHaveBeenCalledTimes(1);
            } else {
              // Empty array should not call repository
              expect(mockRepo.bulkDelete).not.toHaveBeenCalled();
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty selection gracefully', async () => {
      const mockRepo: ICollectionRepository<any> = {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        bulkDelete: vi.fn(),
        search: vi.fn(),
      };

      const service = new CollectionService(mockRepo);

      // Delete with empty array
      await service.bulkDeleteItems([]);

      // Should not call repository
      expect(mockRepo.bulkDelete).not.toHaveBeenCalled();
    });

    it('should not affect items outside selection', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.record({ id: fc.integer().map(String), value: fc.string() }), { minLength: 2, maxLength: 10 }),
          async (items) => {
            const deletedIds = new Set<string>();
            
            const mockRepo: ICollectionRepository<any> = {
              getAll: vi.fn().mockResolvedValue(items),
              getById: vi.fn(),
              create: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              bulkDelete: vi.fn().mockImplementation(async (ids: string[]) => {
                ids.forEach(id => deletedIds.add(id));
              }),
              search: vi.fn(),
            };

            const service = new CollectionService(mockRepo);

            // Select half the items
            const selectedIds = items.slice(0, Math.floor(items.length / 2)).map(item => item.id);
            const unselectedIds = items.slice(Math.floor(items.length / 2)).map(item => item.id);

            await service.bulkDeleteItems(selectedIds);

            // Verify only selected items were affected
            selectedIds.forEach(id => {
              expect(deletedIds.has(id)).toBe(true);
            });

            // Verify unselected items were not affected
            unselectedIds.forEach(id => {
              expect(deletedIds.has(id)).toBe(false);
            });

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
