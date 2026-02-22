/**
 * Custom React hook for moderator application operations.
 *
 * Key behaviours:
 *  - Uses two real-time Firestore listeners: one on users/{uid} for role changes,
 *    one on moderator_applications/{uid} for status changes.
 *  - `loading` is true until BOTH listeners have emitted at least once with a real UID.
 *  - When currentUid transitions null → actual UID the loading flag is reset to true
 *    so the app NEVER flashes an access-blocked state during the listener setup window.
 *  - The all-applications subscription is only started for admins, preventing
 *    Firestore permission errors for regular/moderator users.
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
    /**
     * True while the initial role + application snapshots haven't arrived yet.
     * The app MUST render a spinner while this is true to prevent UI flashes.
     */
    loading: boolean;
    /** Last error message, if any. */
    error: string | null;
    /** Submit a new moderator application. */
    submitApplication: (payload: SubmitApplicationPayload) => Promise<void>;
    /** Admin: approve or reject an application. */
    reviewApplication: (id: string, review: ReviewApplicationPayload) => Promise<void>;
    /** Refresh all data (admin use). */
    refresh: () => Promise<void>;
}

export function useModeratorApplications(
    repository: IModeratorRepository,
    currentUid: string | null,
): UseModeratorResult {
    const [applications, setApplications] = useState<ModeratorApplication[]>([]);
    const [myApplication, setMyApplication] = useState<ModeratorApplication | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    // Start loading=true; we will flip to false only after both listeners have fired
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Guards: both must be true before loading is cleared
    const roleReady = useRef(false);
    const appReady = useRef(false);

    // Computes whether BOTH listeners have emitted at least once
    const maybeFinishLoading = useCallback(() => {
        if (roleReady.current && appReady.current) {
            setLoading(false);
        }
    }, []);

    // ── Reset whenever the UID changes ─────────────────────────────────────
    // This is the critical fix for the flash: whenever currentUid changes,
    // we immediately raise the loading flag again so no stale null-state leaks
    // through to the access gate while the new listeners are being set up.
    useEffect(() => {
        if (!currentUid) {
            // No user — nothing to load; clear state but keep loading=true
            // (App.tsx will redirect to /login before rendering the gate)
            setUserRole(null);
            setMyApplication(null);
            roleReady.current = true;   // treat null-user as "loaded"
            appReady.current = true;
            setLoading(false);
            return;
        }

        // New real UID arrived — reset and wait for both listeners
        roleReady.current = false;
        appReady.current = false;
        setLoading(true);
    }, [currentUid]);

    // ── Real-time: user role (users/{uid}) ─────────────────────────────────
    useEffect(() => {
        if (!currentUid) return;

        const unsubscribe = repository.subscribeToUserRole(currentUid, (role) => {
            setUserRole(role);
            if (!roleReady.current) {
                roleReady.current = true;
                maybeFinishLoading();
            }
        });

        return unsubscribe;
    }, [currentUid, repository, maybeFinishLoading]);

    // ── Real-time: my application (moderator_applications/{uid}) ───────────
    useEffect(() => {
        if (!currentUid) return;

        const unsubscribe = repository.subscribeToMyApplication(currentUid, (app) => {
            setMyApplication(app);
            if (!appReady.current) {
                appReady.current = true;
                maybeFinishLoading();
            }
        });

        return unsubscribe;
    }, [currentUid, repository, maybeFinishLoading]);

    // ── Real-time: all applications (admin only) ───────────────────────────
    useEffect(() => {
        // Guard: only admins can query the entire collection
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

    // ── Fetch all (manual refresh, admin) ──────────────────────────────────
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

    const refresh = useCallback(async () => {
        setError(null);
        await fetchAll();
    }, [fetchAll]);

    // ── Submit ─────────────────────────────────────────────────────────────
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

    // ── Review ─────────────────────────────────────────────────────────────
    const reviewApplication = useCallback(
        async (id: string, review: ReviewApplicationPayload) => {
            setError(null);
            try {
                await repository.reviewApplication(id, review);
                // Real-time listener auto-updates the list; no manual fetch needed
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
