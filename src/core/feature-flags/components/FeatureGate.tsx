/**
 * FeatureGate Component
 *
 * Declarative guard that only renders its children if a feature flag is enabled.
 * Shows an optional fallback when disabled.
 *
 * @example
 *   // Hide the whole forum section
 *   <FeatureGate flag="feature.forum">
 *     <ForumPage />
 *   </FeatureGate>
 *
 *   // With custom disabled state
 *   <FeatureGate flag="feature.quiz_manager" fallback={<ComingSoon />}>
 *     <QuizManagerPage />
 *   </FeatureGate>
 *
 * @module core/feature-flags/components
 */

import type { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import type { FeatureFlagKey } from '../domain/entities/FeatureFlag';

interface FeatureGateProps {
    flag: FeatureFlagKey;
    /** Rendered when the flag is disabled. Defaults to null. */
    fallback?: ReactNode;
    children: ReactNode;
}

export function FeatureGate({ flag, fallback = null, children }: FeatureGateProps) {
    const enabled = useFeatureFlag(flag);
    return enabled ? <>{children}</> : <>{fallback}</>;
}
