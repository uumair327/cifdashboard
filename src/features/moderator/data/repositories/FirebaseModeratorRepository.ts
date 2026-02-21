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

            await updateDoc(docRef, updateData);

            // If approved → set the user's role to 'moderator' in the users collection
            if (review.status === 'approved') {
                const existingData = snap.data();
                const userDocRef = doc(db, 'users', existingData.applicantUid);
                await setDoc(userDocRef, { role: 'moderator' }, { merge: true });
                logger.info(`[ModeratorRepo] Granted moderator role to ${existingData.applicantUid}`);
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
