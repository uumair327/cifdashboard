// Collection service - Business logic for collection operations

import { ICollectionRepository } from '../repositories/ICollectionRepository';
import { FilterCriteria } from '../entities/Search';
import { DashboardError, ErrorCodes } from '../errors/DashboardError';

/**
 * Service for managing collection operations
 * Implements business logic and orchestrates repository calls
 */
export class CollectionService<T> {
  constructor(private repository: ICollectionRepository<T>) {}

  /**
   * Get all items with optional filtering
   */
  async getItems(filters?: FilterCriteria[]): Promise<T[]> {
    try {
      const items = await this.repository.getAll();
      
      if (!filters || filters.length === 0) {
        return items;
      }

      // Apply filters
      return this.applyFilters(items, filters);
    } catch (error) {
      throw DashboardError.fromError(error, ErrorCodes.FETCH_FAILED);
    }
  }

  /**
   * Get a single item by ID
   */
  async getItemById(id: string): Promise<T> {
    try {
      const item = await this.repository.getById(id);
      
      if (!item) {
        throw new DashboardError(
          `Item with ID ${id} not found`,
          ErrorCodes.NOT_FOUND,
          'warning',
          true
        );
      }

      return item;
    } catch (error) {
      if (error instanceof DashboardError) throw error;
      throw DashboardError.fromError(error, ErrorCodes.FETCH_FAILED);
    }
  }

  /**
   * Create a new item
   */
  async createItem(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      return await this.repository.create(data);
    } catch (error) {
      throw DashboardError.fromError(error, ErrorCodes.CREATE_FAILED);
    }
  }

  /**
   * Update an existing item
   */
  async updateItem(id: string, data: Partial<T>): Promise<T> {
    try {
      // Verify item exists
      await this.getItemById(id);
      
      return await this.repository.update(id, data);
    } catch (error) {
      if (error instanceof DashboardError) throw error;
      throw DashboardError.fromError(error, ErrorCodes.UPDATE_FAILED);
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<void> {
    try {
      // Verify item exists
      await this.getItemById(id);
      
      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof DashboardError) throw error;
      throw DashboardError.fromError(error, ErrorCodes.DELETE_FAILED);
    }
  }

  /**
   * Delete multiple items
   */
  async bulkDeleteItems(ids: string[]): Promise<void> {
    try {
      if (ids.length === 0) {
        return;
      }

      await this.repository.bulkDelete(ids);
    } catch (error) {
      throw DashboardError.fromError(error, ErrorCodes.DELETE_FAILED);
    }
  }

  /**
   * Export items to a specific format
   */
  async exportItems(format: 'csv' | 'json', filters?: FilterCriteria[]): Promise<Blob> {
    try {
      const items = await this.getItems(filters);

      if (format === 'json') {
        const jsonString = JSON.stringify(items, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
      } else {
        // CSV format
        const csv = this.convertToCSV(items);
        return new Blob([csv], { type: 'text/csv' });
      }
    } catch (error) {
      throw DashboardError.fromError(error, 'EXPORT_FAILED');
    }
  }

  /**
   * Apply filters to items
   */
  private applyFilters(items: T[], filters: FilterCriteria[]): T[] {
    return items.filter((item) => {
      return filters.every((filter) => {
        const value = (item as any)[filter.field];
        if (value === null || value === undefined) return false;

        const strValue = String(value).toLowerCase();
        const filterValue = String(filter.value).toLowerCase();

        switch (filter.operator) {
          case 'equals':
            return strValue === filterValue;
          case 'contains':
            return strValue.includes(filterValue);
          case 'startsWith':
            return strValue.startsWith(filterValue);
          case 'endsWith':
            return strValue.endsWith(filterValue);
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          default:
            return false;
        }
      });
    });
  }

  /**
   * Convert items to CSV format
   */
  private convertToCSV(items: T[]): string {
    if (items.length === 0) return '';

    // Get headers from first item
    const headers = Object.keys(items[0] as any);
    const csvHeaders = headers.join(',');

    // Convert items to CSV rows
    const csvRows = items.map((item) => {
      return headers
        .map((header) => {
          const value = (item as any)[header];
          // Escape quotes and wrap in quotes if contains comma
          const strValue = String(value ?? '');
          if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        })
        .join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }
}
