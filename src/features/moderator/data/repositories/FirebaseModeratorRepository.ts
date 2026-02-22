/**
 * Firebase implementation of IModeratorRepository
 *
 * Collection: `moderator_applications`
 * Also reads/writes the `users/{uid}` document for role management.
 *
 * Follows the same patterns as FirebaseCollectionRepository used elsewhere.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    Timestamp,
    DocumentData,
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import { IModeratorRepository } from '../../domain/repositories/IModeratorRepository';
import {
    ModeratorApplication,
    ReviewApplicationPayload,
    SubmitApplicationPayload,
} from '../../domain/entities/ModeratorApplication';
import { DashboardErrors } from '../../../../core/errors/DashboardError';
import { logger } from '../../../../core/utils/logger';

const COLLECTION = 'moderator_applications';

/**
 * Convert Firestore doc → domain entity
 */
function docToEntity(id: string, data: DocumentData): ModeratorApplication {
    return {
        id,
        applicantUid: data.applicantUid ?? '',
        applicantEmail: data.applicantEmail ?? '',
        applicantName: data.applicantName ?? '',
        applicantPhotoURL: data.applicantPhotoURL ?? null,
        reason: data.reason ?? '',
        experience: data.experience ?? '',
        status: data.status ?? 'pending',
        reviewedBy: data.reviewedBy ?? null,
        reviewedAt: data.reviewedAt?.toDate() ?? null,
        reviewNote: data.reviewNote ?? null,
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
    };
}

export class FirebaseModeratorRepository implements IModeratorRepository {
    // ── Submit ───────────────────────────────────────────────────────────────

    async submitApplication(payload: SubmitApplicationPayload): Promise<ModeratorApplication> {
        try {
            // Use the applicant UID as doc ID → at most one application per user
            const docRef = doc(db, COLLECTION, payload.applicantUid);
            const now = Timestamp.now();

            const docData = {
                ...payload,
                status: 'pending' as const,
                reviewedBy: null,
                reviewedAt: null,
                reviewNote: null,
                createdAt: now,
                updatedAt: now,
            };

            await setDoc(docRef, docData);

            logger.info(`[ModeratorRepo] Application submitted by ${payload.applicantUid}`);
            return docToEntity(payload.applicantUid, { ...docData, createdAt: now, updatedAt: now });
        } catch (error) {
            logger.error('[ModeratorRepo] submitApplication failed:', error);
            throw DashboardErrors.operationFailed(
                'submit moderator application',
                error instanceof Error ? error : undefined,
            );
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    async getAll(): Promise<ModeratorApplication[]> {
        try {
            const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map((d) => docToEntity(d.id, d.data()));
        } catch (error) {
            logger.error('[ModeratorRepo] getAll failed:', error);
            throw DashboardErrors.operationFailed(
                'fetch moderator applications',
                error instanceof Error ? error : undefined,
            );
        }
    }

    async getById(id: string): Promise<ModeratorApplication | null> {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            return snap.exists() ? docToEntity(snap.id, snap.data()) : null;
        } catch (error) {
            logger.error(`[ModeratorRepo] getById(${id}) failed:`, error);
            throw DashboardErrors.operationFailed(
                'fetch moderator application',
                error instanceof Error ? error : undefined,
            );
        }
    }

    async getByApplicantUid(uid: string): Promise<ModeratorApplication | null> {
        try {
            const q = query(collection(db, COLLECTION), where('applicantUid', '==', uid));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const d = snapshot.docs[0];
            return docToEntity(d.id, d.data());
        } catch (error) {
            logger.error(`[ModeratorRepo] getByApplicantUid(${uid}) failed:`, error);
            throw DashboardErrors.operationFailed(
                'fetch moderator application by UID',
                error instanceof Error ? error : undefined,
            );
        }
    }

    // ── Review ────────────────────────────────────────────────────────────────

    async reviewApplication(
        id: string,
        review: ReviewApplicationPayload,
    ): Promise<ModeratorApplication> {
        try {
            const docRef = doc(db, COLLECTION, id);
            const snap = await getDoc(docRef);

            if (!snap.exists()) {
                throw DashboardErrors.notFound('moderator_applications', id);
            }

            const now = Timestamp.now();
            const updateData = {
                status: review.status,
                reviewedBy: review.reviewedBy,
                reviewedAt: now,
                reviewNote: review.reviewNote ?? null,
                updatedAt: now,
            };

            // Step 1: Update the application status
            await updateDoc(docRef, updateData);
            logger.info(`[ModeratorRepo] Application ${id} set to ${review.status}`);

            // Step 2: If approved, grant 'moderator' role on the users doc.
            // This is a best-effort write — even if it fails (e.g. rules not yet deployed),
            // the application.status === 'approved' still grants access via the App-level check.
            if (review.status === 'approved') {
                const existingData = snap.data();
                const userDocRef = doc(db, 'users', existingData.applicantUid);
                try {
                    await setDoc(userDocRef, { role: 'moderator' }, { merge: true });
                    logger.info(`[ModeratorRepo] Granted moderator role to ${existingData.applicantUid}`);
                } catch (roleError) {
                    // Non-fatal: approval is persisted, application.status drives access
                    logger.warn(
                        `[ModeratorRepo] Could not write role to users/${existingData.applicantUid}.`,
                        `Check Firestore rules for users collection. Error:`,
                        roleError,
                    );
                }
            }

            const updatedSnap = await getDoc(docRef);
            return docToEntity(updatedSnap.id, updatedSnap.data()!);
        } catch (error) {
            logger.error(`[ModeratorRepo] reviewApplication(${id}) failed:`, error);
            throw DashboardErrors.operationFailed(
                'review moderator application',
                error instanceof Error ? error : undefined,
            );
        }
    }

    // ── Real-time ─────────────────────────────────────────────────────────────

    subscribe(
        onData: (items: ModeratorApplication[]) => void,
        onError: (error: Error) => void,
    ): () => void {
        const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));

        return onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map((d) => docToEntity(d.id, d.data()));
                onData(items);
            },
            onError,
        );
    }

    // ── Real-time: user role ──────────────────────────────────────────────────

    subscribeToUserRole(
        uid: string,
        onRole: (role: string | null) => void,
    ): () => void {
        const userDocRef = doc(db, 'users', uid);

        return onSnapshot(
            userDocRef,
            (snap) => {
                if (!snap.exists()) {
                    onRole(null);
                    return;
                }
                const role = (snap.data().role as string) ?? null;
                logger.debug(`[ModeratorRepo] Role update for ${uid}: ${role}`);
                onRole(role);
            },
            (error) => {
                logger.error(`[ModeratorRepo] subscribeToUserRole error:`, error);
                onRole(null);
            },
        );
    }

    // ── Real-time: my application ───────────────────────────────────────────

    subscribeToMyApplication(
        uid: string,
        onData: (app: ModeratorApplication | null) => void,
    ): () => void {
        // Doc ID is the applicant UID
        const appDocRef = doc(db, COLLECTION, uid);

        return onSnapshot(
            appDocRef,
            (snap) => {
                if (!snap.exists()) {
                    onData(null);
                    return;
                }
                onData(docToEntity(snap.id, snap.data()));
            },
            (error) => {
                logger.error(`[ModeratorRepo] subscribeToMyApplication error:`, error);
                onData(null);
            },
        );
    }

    // ── Role check ────────────────────────────────────────────────────────────

    async getUserRole(uid: string): Promise<string | null> {
        try {
            const snap = await getDoc(doc(db, 'users', uid));
            if (!snap.exists()) return null;
            return (snap.data().role as string) ?? null;
        } catch (error) {
            logger.error(`[ModeratorRepo] getUserRole(${uid}) failed:`, error);
            return null;
        }
    }
}
