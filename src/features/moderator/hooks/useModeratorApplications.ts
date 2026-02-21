/**
 * Custom React hook for moderator application operations.
 *
 * Encapsulates all moderator-related state and side-effects.
 * Depends on IModeratorRepository (injected) → testable and backend-agnostic.
 */

import { useCallback, useEffect, useState } from 'react';
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

    // ── Fetch user role ─────────────────────────────────────────────────────
    const fetchRole = useCallback(async () => {
        if (!currentUid) return;
        try {
            const role = await repository.getUserRole(currentUid);
            setUserRole(role);
        } catch (err) {
            logger.error('[useModeratorApplications] fetchRole error:', err);
        }
    }, [currentUid, repository]);

    // ── Fetch my own application ────────────────────────────────────────────
    const fetchMyApplication = useCallback(async () => {
        if (!currentUid) return;
        try {
            const app = await repository.getByApplicantUid(currentUid);
            setMyApplication(app);
        } catch (err) {
            logger.error('[useModeratorApplications] fetchMyApplication error:', err);
        }
    }, [currentUid, repository]);

    // ── Fetch all (admin) ───────────────────────────────────────────────────
    const fetchAll = useCallback(async () => {
        try {
            const items = await repository.getAll();
            setApplications(items);
        } catch (err) {
            logger.error('[useModeratorApplications] fetchAll error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load applications');
        }
    }, [repository]);

    // ── Refresh all data ────────────────────────────────────────────────────
    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        await Promise.all([fetchRole(), fetchMyApplication(), fetchAll()]);
        setLoading(false);
    }, [fetchRole, fetchMyApplication, fetchAll]);

    // ── Initial load ────────────────────────────────────────────────────────
    useEffect(() => {
        refresh();
    }, [refresh]);

    // ── Real-time subscription (admin) ──────────────────────────────────────
    useEffect(() => {
        const unsubscribe = repository.subscribe(
            (items) => setApplications(items),
            (err) => setError(err.message),
        );
        return unsubscribe;
    }, [repository]);

    // ── Submit ──────────────────────────────────────────────────────────────
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

    // ── Review ──────────────────────────────────────────────────────────────
    const reviewApplication = useCallback(
        async (id: string, review: ReviewApplicationPayload) => {
            setError(null);
            try {
                await repository.reviewApplication(id, review);
                // Refresh to get updated data
                await fetchAll();
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to review application';
                setError(msg);
                throw err;
            }
        },
        [repository, fetchAll],
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
