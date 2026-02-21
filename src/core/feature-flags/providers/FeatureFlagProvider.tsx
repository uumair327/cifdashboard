/**
 * Feature Flag Provider (Presentation Layer)
 *
 * Root-level React context that:
 * 1. Opens a real-time Firestore subscription on mount
 * 2. Makes flags available application-wide with zero prop-drilling
 * 3. Exposes a toggle function for the management UI
 *
 * @module core/feature-flags/providers
 */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import type { FeatureFlag, FeatureFlagKey } from '../domain/entities/FeatureFlag';
import type { IFeatureFlagRepository } from '../domain/repositories/IFeatureFlagRepository';
import { FeatureFlagService } from '../domain/services/FeatureFlagService';
import { logger } from '../../utils/logger';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface FeatureFlagContextValue {
    /** All flags, live-updated from Firestore */
    flags: FeatureFlag[];
    /** True during initial load */
    loading: boolean;
    /** Any repository error */
    error: Error | null;
    /** Check a specific flag — returns the default if not yet loaded */
    isEnabled: (key: FeatureFlagKey) => boolean;
    /** Toggle a flag (persists to Firestore) */
    toggle: (key: FeatureFlagKey, enabled: boolean, updatedBy: string) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface FeatureFlagProviderProps {
    repository: IFeatureFlagRepository;
    children: ReactNode;
}

export function FeatureFlagProvider({
    repository,
    children,
}: FeatureFlagProviderProps) {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // ── Seed + Subscribe on mount ─────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        // Seed defaults first (no-op if already seeded), then subscribe
        repository
            .seedDefaults()
            .then(() => {
                if (!mounted) return;

                const unsubscribe = repository.subscribe(
                    updatedFlags => {
                        if (mounted) {
                            setFlags(updatedFlags);
                            setLoading(false);
                        }
                    },
                    err => {
                        if (mounted) {
                            logger.error('[FeatureFlagProvider] subscription error:', err);
                            setError(err);
                            setLoading(false);
                        }
                    }
                );

                return unsubscribe;
            })
            .catch(err => {
                if (mounted) {
                    logger.error('[FeatureFlagProvider] seed error:', err);
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setLoading(false);
                }
            });

        return () => { mounted = false; };
    }, [repository]);

    // ── isEnabled ──────────────────────────────────────────────────────────────

    const isEnabled = useCallback(
        (key: FeatureFlagKey): boolean =>
            FeatureFlagService.isEnabled(flags, key),
        [flags]
    );

    // ── toggle ────────────────────────────────────────────────────────────────

    const toggle = useCallback(
        async (key: FeatureFlagKey, enabled: boolean, updatedBy: string) => {
            await repository.update(key, enabled, updatedBy);
            // Firestore subscription will automatically push the update back
        },
        [repository]
    );

    // ── Context value (memoised) ──────────────────────────────────────────────

    const value = useMemo<FeatureFlagContextValue>(
        () => ({ flags, loading, error, isEnabled, toggle }),
        [flags, loading, error, isEnabled, toggle]
    );

    return (
        <FeatureFlagContext.Provider value={value}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFeatureFlags(): FeatureFlagContextValue {
    const ctx = useContext(FeatureFlagContext);
    if (!ctx) {
        throw new Error('useFeatureFlags must be used inside <FeatureFlagProvider>');
    }
    return ctx;
}
