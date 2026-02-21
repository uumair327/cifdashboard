/**
 * Feature Flag Repository Interface (Domain Layer)
 *
 * Follows the Dependency Inversion Principle — domain does not depend on
 * any specific backend. Firebase, Supabase, or any other store can implement this.
 *
 * @module core/feature-flags/domain/repositories
 */

import { type FeatureFlag, type FeatureFlagKey } from '../entities/FeatureFlag';

export interface IFeatureFlagRepository {
    /**
     * Fetch all feature flags from the store.
     * Seeds defaults if the store is empty.
     */
    getAll(): Promise<FeatureFlag[]>;

    /**
     * Subscribe to real-time updates for all flags.
     * Returns an unsubscribe function.
     */
    subscribe(
        onUpdate: (flags: FeatureFlag[]) => void,
        onError: (error: Error) => void
    ): () => void;

    /**
     * Toggle a single flag on or off.
     * Records who made the change and when.
     */
    update(
        key: FeatureFlagKey,
        enabled: boolean,
        updatedBy: string
    ): Promise<void>;

    /**
     * Seed default flags if they don't exist yet.
     * Safe to call multiple times (idempotent).
     */
    seedDefaults(): Promise<void>;
}
