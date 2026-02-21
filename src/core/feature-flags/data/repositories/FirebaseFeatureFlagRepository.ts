/**
 * Firebase Feature Flag Repository (Data Layer)
 *
 * Implements IFeatureFlagRepository using Firestore.
 * Collection: `feature_flags`   Document ID: the FeatureFlagKey string
 *
 * Features:
 * - Real-time updates via onSnapshot
 * - Atomic writes with serverTimestamp
 * - Idempotent seeding of defaults
 *
 * @module core/feature-flags/data/repositories
 */

import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../../../firebase';
import type { IFeatureFlagRepository } from '../../domain/repositories/IFeatureFlagRepository';
import {
    type FeatureFlag,
    type FeatureFlagKey,
    APP_FEATURE_FLAGS,
} from '../../domain/entities/FeatureFlag';
import { FeatureFlagService } from '../../domain/services/FeatureFlagService';
import { logger } from '../../../utils/logger';

const COLLECTION = 'feature_flags';

/** Convert a raw Firestore document to a typed FeatureFlag. */
function docToFlag(id: string, data: Record<string, unknown>): FeatureFlag {
    return FeatureFlagService.hydrate(id as FeatureFlagKey, {
        enabled: data.enabled as boolean,
        lastModifiedBy: data.lastModifiedBy as string | undefined,
        lastModifiedAt:
            data.lastModifiedAt instanceof Timestamp
                ? data.lastModifiedAt.toDate()
                : undefined,
    });
}

export class FirebaseFeatureFlagRepository implements IFeatureFlagRepository {
    private readonly colRef = collection(db, COLLECTION);

    async getAll(): Promise<FeatureFlag[]> {
        const snapshot = await getDocs(this.colRef);
        if (snapshot.empty) {
            await this.seedDefaults();
            const seeded = await getDocs(this.colRef);
            return seeded.docs.map(d => docToFlag(d.id, d.data() as Record<string, unknown>));
        }
        return snapshot.docs.map(d => docToFlag(d.id, d.data() as Record<string, unknown>));
    }

    subscribe(
        onUpdate: (flags: FeatureFlag[]) => void,
        onError: (error: Error) => void
    ): () => void {
        return onSnapshot(
            this.colRef,
            snapshot => {
                const flags = snapshot.docs.map(d =>
                    docToFlag(d.id, d.data() as Record<string, unknown>)
                );
                onUpdate(flags);
            },
            error => {
                logger.error('[FeatureFlags] Firestore subscription error:', error);
                onError(error);
            }
        );
    }

    async update(
        key: FeatureFlagKey,
        enabled: boolean,
        updatedBy: string
    ): Promise<void> {
        const docRef = doc(db, COLLECTION, key);
        await updateDoc(docRef, {
            enabled,
            lastModifiedBy: updatedBy,
            lastModifiedAt: serverTimestamp(),
        });
        logger.debug(`[FeatureFlags] '${key}' set to ${enabled} by ${updatedBy}`);
    }

    async seedDefaults(): Promise<void> {
        logger.debug('[FeatureFlags] Seeding defaults...');
        const snapshot = await getDocs(this.colRef);
        const existingIds = new Set(snapshot.docs.map(d => d.id));

        const seeds = Object.entries(APP_FEATURE_FLAGS)
            .filter(([id]) => !existingIds.has(id))
            .map(([id, def]) =>
                setDoc(doc(db, COLLECTION, id), {
                    enabled: def.defaultEnabled,
                    name: def.name,
                    description: def.description,
                    category: def.category,
                    isLocked: def.isLocked ?? false,
                    lastModifiedBy: 'system',
                    lastModifiedAt: serverTimestamp(),
                })
            );

        await Promise.all(seeds);
        logger.debug(`[FeatureFlags] Seeded ${seeds.length} defaults.`);
    }
}
