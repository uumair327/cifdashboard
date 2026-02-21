/**
 * Feature Flags Barrel Export
 * @module core/feature-flags
 */

// Domain
export type { FeatureFlag, FeatureFlagKey, FeatureFlagCategory } from './domain/entities/FeatureFlag';
export { APP_FEATURE_FLAGS } from './domain/entities/FeatureFlag';
export type { IFeatureFlagRepository } from './domain/repositories/IFeatureFlagRepository';
export { FeatureFlagService } from './domain/services/FeatureFlagService';

// Data
export { FirebaseFeatureFlagRepository } from './data/repositories/FirebaseFeatureFlagRepository';

// Presentation
export { FeatureFlagProvider, useFeatureFlags } from './providers/FeatureFlagProvider';
export { useFeatureFlag } from './hooks/useFeatureFlag';
export { FeatureGate } from './components/FeatureGate';
