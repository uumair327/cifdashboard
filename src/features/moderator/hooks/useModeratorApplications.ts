/**
 * Custom React hook for moderator application operations.
 *
 * Encapsulates all moderator-related state and side-effects.
 * Depends on IModeratorRepository (injected) → testable and backend-agnostic.
 *
 * Key design:
 *   - `userRole` uses a real-time Firestore listener on `users/{uid}`
 *     so it updates **instantly** when an admin approves/rejects.
 *   - `myApplication` uses a real-time listener on `moderator_applications/{uid}`
 *     so the applicant's status card updates live.
 *   - The collection-wide `subscribe()` is only called when the user is an admin,
 *     avoiding Firestore permission errors for regular users.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { IModeratorRepository } from '../domain/repositories/IModeratorRepository';
import {
    ModeratorApplication,
    ReviewApplicationPayload,
    SubmitApplicationPayload,
} from '../domain/entities/ModeratorApplication';
import { logger } from '../../../core/utils/logger';

export interface UseModeratorResult {
    /** All applications (admin view). */
    applications: ModeratorApplication[];
    /** Current user's own application (applicant view). */
    myApplication: ModeratorApplication | null;
    /** Current user's role from Firestore users collection. */
    userRole: string | null;
    /** Whether initial data is still loading. */
    loading: boolean;
    /** Last error message, if any. */
    error: string | null;
    /** Submit a new moderator application. */
    submitApplication: (payload: SubmitApplicationPayload) => Promise<void>;
    /** Admin: approve or reject an application. */
    reviewApplication: (id: string, review: ReviewApplicationPayload) => Promise<void>;
    /** Refresh all data. */
    refresh: () => Promise<void>;
}

/**
 * Hook factory — accepts a repository instance for DI.
 */
export function useModeratorApplications(
    repository: IModeratorRepository,
    currentUid: string | null,
): UseModeratorResult {
    const [applications, setApplications] = useState<ModeratorApplication[]>([]);
    const [myApplication, setMyApplication] = useState<ModeratorApplication | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track whether we've received the first role snapshot
    const roleLoadedRef = useRef(false);
    const appLoadedRef = useRef(false);

    // ── Real-time listener: user role ────────────────────────────────────────
    useEffect(() => {
        if (!currentUid) {
            setUserRole(null);
            setLoading(false);
            return;
        }

        roleLoadedRef.current = false;

        const unsubscribe = repository.subscribeToUserRole(currentUid, (role) => {
            setUserRole(role);

            if (!roleLoadedRef.current) {
                roleLoadedRef.current = true;
                // Check if both listeners have fired at least once
                if (appLoadedRef.current) {
                    setLoading(false);
                }
            }
        });

        return unsubscribe;
    }, [currentUid, repository]);

    // ── Real-time listener: my application ──────────────────────────────────
    useEffect(() => {
        if (!currentUid) {
            setMyApplication(null);
            return;
        }

        appLoadedRef.current = false;

        const unsubscribe = repository.subscribeToMyApplication(currentUid, (app) => {
            setMyApplication(app);

            if (!appLoadedRef.current) {
                appLoadedRef.current = true;
                if (roleLoadedRef.current) {
                    setLoading(false);
                }
            }
        });

        return unsubscribe;
    }, [currentUid, repository]);

    // ── Real-time listener: all applications (admin only) ───────────────────
    useEffect(() => {
        // Only subscribe to all applications if user is admin
        // This avoids Firestore permission errors for regular users
        if (userRole !== 'admin') {
            setApplications([]);
            return;
        }

        const unsubscribe = repository.subscribe(
            (items) => setApplications(items),
            (err) => {
                logger.error('[useModeratorApplications] subscribe error:', err);
                setError(err.message);
            },
        );

        return unsubscribe;
    }, [repository, userRole]);

    // ── Fetch all (admin) for refresh ────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        if (userRole !== 'admin') return;
        try {
            const items = await repository.getAll();
            setApplications(items);
        } catch (err) {
            logger.error('[useModeratorApplications] fetchAll error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load applications');
        }
    }, [repository, userRole]);

    // ── Refresh ──────────────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        setError(null);
        await fetchAll();
    }, [fetchAll]);

    // ── Submit ───────────────────────────────────────────────────────────────
    const submitApplication = useCallback(
        async (payload: SubmitApplicationPayload) => {
            setError(null);
            try {
                const result = await repository.submitApplication(payload);
                setMyApplication(result);
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to submit application';
                setError(msg);
                throw err;
            }
        },
        [repository],
    );

    // ── Review ───────────────────────────────────────────────────────────────
    const reviewApplication = useCallback(
        async (id: string, review: ReviewApplicationPayload) => {
            setError(null);
            try {
                await repository.reviewApplication(id, review);
                // Real-time listener will automatically update the list
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to review application';
                setError(msg);
                throw err;
            }
        },
        [repository],
    );

    return {
        applications,
        myApplication,
        userRole,
        loading,
        error,
        submitApplication,
        reviewApplication,
        refresh,
    };
}
