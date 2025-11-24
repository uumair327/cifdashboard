/**
 * Custom hook for fetching and caching collection data
 * Implements 5-minute TTL caching to prevent redundant requests
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';
import { DashboardError } from '../../../core/errors/DashboardError';

interface UseCollectionOptions {
  /**
   * Cache time-to-live in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTTL?: number;
  
  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  fetchOnMount?: boolean;
}

interface UseCollectionResult<T extends BaseCollection> {
  data: T[] | null;
  loading: boolean;
  error: DashboardError | null;
  refetch: () => Promise<void>;
}

// Global cache for collection data
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
}

const collectionCache = new Map<string, CacheEntry<any>>();

/**
 * Hook for fetching and managing collection data with caching
 * @param repository The repository instance for data access
 * @param collectionName Unique identifier for the collection (for caching)
 * @param options Configuration options
 */
export function useCollection<T extends BaseCollection>(
  repository: ICollectionRepository<T>,
  collectionName: string,
  options: UseCollectionOptions = {}
): UseCollectionResult<T> {
  const {
    cacheTTL = 300000, // 5 minutes default
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<DashboardError | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track the last fetch time
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((): boolean => {
    const cached = collectionCache.get(collectionName);
    if (!cached) return false;
    
    const now = Date.now();
    const age = now - cached.timestamp;
    return age < cacheTTL;
  }, [collectionName, cacheTTL]);

  /**
   * Get data from cache if valid
   */
  const getCachedData = useCallback((): T[] | null => {
    if (isCacheValid()) {
      const cached = collectionCache.get(collectionName);
      return cached ? cached.data : null;
    }
    return null;
  }, [collectionName, isCacheValid]);

  /**
   * Store data in cache
   */
  const setCachedData = useCallback((newData: T[]): void => {
    collectionCache.set(collectionName, {
      data: newData,
      timestamp: Date.now(),
    });
  }, [collectionName]);

  /**
   * Fetch data from repository
   */
  const fetchData = useCallback(async (): Promise<void> => {
    console.log(`[useCollection] Starting fetch for ${collectionName}`);
    
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      console.log(`[useCollection] Using cached data for ${collectionName}:`, cachedData);
      if (isMountedRef.current) {
        setData(cachedData);
        setError(null);
      }
      return;
    }

    // Fetch from repository
    console.log(`[useCollection] No cache, fetching from repository for ${collectionName}`);
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await repository.getAll();
      lastFetchRef.current = Date.now();
      console.log(`[useCollection] Fetch successful for ${collectionName}, got ${result.length} items:`, result);
      
      if (isMountedRef.current) {
        setData(result);
        setCachedData(result);
        setError(null);
      }
    } catch (err) {
      console.error(`[useCollection] Error fetching collection data for ${collectionName}:`, err);
      
      if (isMountedRef.current) {
        const dashboardError = err instanceof DashboardError
          ? err
          : new DashboardError({
              code: 'OPERATION_FAILED',
              message: 'Failed to fetch collection data',
              originalError: err instanceof Error ? err : undefined,
            });
        setError(dashboardError);
      }
    } finally {
      if (isMountedRef.current) {
        console.log(`[useCollection] Setting loading to false for ${collectionName}`);
        setLoading(false);
      }
    }
  }, [repository, getCachedData, setCachedData, collectionName]);

  /**
   * Refetch data, bypassing cache
   */
  const refetch = useCallback(async (): Promise<void> => {
    // Clear cache for this collection
    collectionCache.delete(collectionName);
    await fetchData();
  }, [collectionName, fetchData]);

  // Fetch data on mount if enabled
  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Clear all cached collection data
 */
export function clearCollectionCache(): void {
  collectionCache.clear();
}

/**
 * Clear cache for a specific collection
 */
export function clearCollectionCacheByName(collectionName: string): void {
  collectionCache.delete(collectionName);
}

/**
 * Get cache statistics for debugging
 */
export function getCollectionCacheStats(): {
  size: number;
  entries: Array<{ name: string; age: number }>;
} {
  const now = Date.now();
  const entries = Array.from(collectionCache.entries()).map(([name, entry]) => ({
    name,
    age: now - entry.timestamp,
  }));

  return {
    size: collectionCache.size,
    entries,
  };
}
