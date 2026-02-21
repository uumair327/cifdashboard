/**
 * Feature Flag Service (Domain Layer)
 *
 * Pure business logic — no framework, no Firebase, no React.
 * This is the single place that knows HOW to work with flags.
 *
 * @module core/feature-flags/domain/services
 */

import {
    type FeatureFlag,
    type FeatureFlagKey,
    type FeatureFlagCategory,
    APP_FEATURE_FLAGS,
} from '../entities/FeatureFlag';

export class FeatureFlagService {
    /**
     * Check whether a specific feature flag is enabled.
     * Returns `true` (safe default) if the flag is not found in the store yet.
     */
    static isEnabled(flags: FeatureFlag[], key: FeatureFlagKey): boolean {
        const flag = flags.find(f => f.id === key);
        if (!flag) {
            // Flag not yet seeded — fall back to the declared default
            return APP_FEATURE_FLAGS[key]?.defaultEnabled ?? true;
        }
        return flag.enabled;
    }

    /**
     * Group flags by category for the management UI.
     */
    static groupByCategory(
        flags: FeatureFlag[]
    ): Record<FeatureFlagCategory, FeatureFlag[]> {
        const groups: Record<FeatureFlagCategory, FeatureFlag[]> = {
            app: [],
            dashboard: [],
            experimental: [],
        };
        for (const flag of flags) {
            groups[flag.category].push(flag);
        }
        return groups;
    }

    /**
     * Guard: prevent toggling a locked flag.
     */
    static canToggle(flag: FeatureFlag): boolean {
        return !flag.isLocked;
    }

    /**
     * Build a FeatureFlag from its stored data, merging any missing
     * metadata from the compile-time definition.
     */
    static hydrate(
        id: FeatureFlagKey,
        storedData: Partial<FeatureFlag>
    ): FeatureFlag {
        const definition = APP_FEATURE_FLAGS[id];
        return {
            id,
            name: storedData.name ?? definition?.name ?? id,
            description: storedData.description ?? definition?.description ?? '',
            enabled: storedData.enabled ?? definition?.defaultEnabled ?? true,
            category: storedData.category ?? definition?.category ?? 'app',
            isLocked: storedData.isLocked ?? definition?.isLocked ?? false,
            lastModifiedBy: storedData.lastModifiedBy,
            lastModifiedAt: storedData.lastModifiedAt,
        };
    }
}
