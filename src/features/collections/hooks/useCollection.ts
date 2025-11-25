/**
 * Custom hook for fetching and caching collection data
 * Uses real-time subscriptions for automatic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ICollectionRepository } from '../domain/repositories/ICollectionRepository';
import { BaseCollection } from '../domain/entities/Collection';
import { DashboardError } from '../../../core/errors/DashboardError';
import { useAuth } from '../../../core/auth';

interface UseCollectionOptions {
  /**
   * Whether to use real-time subscriptions
   * @default true
   */
  useRealTime?: boolean;
  
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

/**
 * Hook for fetching and managing collection data with real-time updates
 * @param repository The repository instance for data access
 * @param collectionName Unique identifier for the collection
 * @param options Configuration options
 */
export function useCollection<T extends BaseCollection>(
  repository: ICollectionRepository<T>,
  collectionName: string,
  options: UseCollectionOptions = {}
): UseCollectionResult<T> {
  const {
    useRealTime = true,
    fetchOnMount = true,
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<DashboardError | null>(null);
  
  // Get auth state to wait for authentication
  const { user, loading: authLoading } = useAuth();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track unsubscribe function for real-time listener
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clean up subscription on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  /**
   * Fetch data from repository (one-time fetch)
   */
  const fetchData = useCallback(async (): Promise<void> => {
    console.log(`[useCollection] Starting one-time fetch for ${collectionName}`);
    
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await repository.getAll();
      console.log(`[useCollection] Fetch successful for ${collectionName}, got ${result.length} items:`, result);
      
      if (isMountedRef.current) {
        setData(result);
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
  }, [repository, collectionName]);

  /**
   * Set up real-time subscription
   */
  const setupSubscription = useCallback(() => {
    console.log(`[useCollection] Setting up real-time subscription for ${collectionName}`);
    
    if (isMountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Set up new subscription
    unsubscribeRef.current = repository.subscribe(
      (items) => {
        console.log(`[useCollection] Real-time update for ${collectionName}, got ${items.length} items`);
        if (isMountedRef.current) {
          setData(items);
          setError(null);
          setLoading(false);
        }
      },
      (err) => {
        console.error(`[useCollection] Real-time error for ${collectionName}:`, err);
        if (isMountedRef.current) {
          const dashboardError = new DashboardError({
            code: 'OPERATION_FAILED',
            message: 'Failed to subscribe to collection updates',
            originalError: err,
          });
          setError(dashboardError);
          setLoading(false);
        }
      }
    );
  }, [repository, collectionName]);

  /**
   * Refetch data
   */
  const refetch = useCallback(async (): Promise<void> => {
    if (useRealTime) {
      // For real-time mode, just re-setup the subscription
      setupSubscription();
    } else {
      // For one-time fetch mode, fetch again
      await fetchData();
    }
  }, [useRealTime, setupSubscription, fetchData]);

  // Set up data fetching when auth is ready
  useEffect(() => {
    // Don't fetch until auth is ready
    if (authLoading) {
      console.log(`[useCollection] Waiting for auth to complete for ${collectionName}`);
      return;
    }

    // Don't fetch if not mounted or fetch on mount is disabled
    if (!fetchOnMount || !isMountedRef.current) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      console.log(`[useCollection] No authenticated user for ${collectionName}`);
      if (isMountedRef.current) {
        setLoading(false);
        setError(new DashboardError({
          code: 'OPERATION_FAILED',
          message: 'User not authenticated',
        }));
      }
      return;
    }

    console.log(`[useCollection] Auth ready, setting up data fetch for ${collectionName}`);

    // Set up real-time subscription or one-time fetch
    if (useRealTime) {
      setupSubscription();
    } else {
      fetchData();
    }

    // Cleanup subscription on unmount or when dependencies change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [authLoading, user, fetchOnMount, useRealTime, collectionName, setupSubscription, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}


