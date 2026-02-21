/**
 * useFeatureFlag — single flag hook
 *
 * Convenience hook to check one flag without destructuring the full context.
 *
 * @example
 *   const forumEnabled = useFeatureFlag('feature.forum');
 *   if (!forumEnabled) return null;
 *
 * @module core/feature-flags/hooks
 */

import { useFeatureFlags } from '../providers/FeatureFlagProvider';
import type { FeatureFlagKey } from '../domain/entities/FeatureFlag';

export function useFeatureFlag(key: FeatureFlagKey): boolean {
    const { isEnabled } = useFeatureFlags();
    return isEnabled(key);
}
