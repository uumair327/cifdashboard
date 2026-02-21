/**
 * Moderator Repository Interface (Domain Layer)
 *
 * Defines the contract for moderator-application persistence operations.
 * Following DIP: presentation depends on this interface, not on Firebase directly.
 */

import {
    ModeratorApplication,
    ReviewApplicationPayload,
    SubmitApplicationPayload,
} from '../entities/ModeratorApplication';

export interface IModeratorRepository {
    /**
     * Submit a new moderator application.
     * Sets status to 'pending' automatically.
     */
    submitApplication(payload: SubmitApplicationPayload): Promise<ModeratorApplication>;

    /**
     * Get all applications (admin view).
     * Returns most recent first.
     */
    getAll(): Promise<ModeratorApplication[]>;

    /**
     * Get a single application by Firestore document ID.
     */
    getById(id: string): Promise<ModeratorApplication | null>;

    /**
     * Get application(s) for a specific user UID.
     * Typically returns 0 or 1 items.
     */
    getByApplicantUid(uid: string): Promise<ModeratorApplication | null>;

    /**
     * Admin reviews (approves/rejects) an application.
     * Also sets `role` on the Firestore `users/{uid}` document when approved.
     */
    reviewApplication(id: string, review: ReviewApplicationPayload): Promise<ModeratorApplication>;

    /**
     * Subscribe to real-time updates on all applications (admin dashboard).
     */
    subscribe(
        onData: (items: ModeratorApplication[]) => void,
        onError: (error: Error) => void,
    ): () => void;

    /**
     * Check whether a UID has the 'admin' or 'moderator' role
     * in the Firestore `users` collection.
     */
    getUserRole(uid: string): Promise<string | null>;
}
