/**
 * Moderator Application Domain Entity
 *
 * Represents a user's application to become a CIF Dashboard moderator.
 * Follows the entity pattern used by BaseCollection throughout the project.
 *
 * Firestore collection: `moderator_applications`
 *
 * Lifecycle:  submitted → pending → approved | rejected
 */

import { BaseEntity } from '@/core/types';

/** Possible states a moderator application can be in.
 *  pending   → awaiting admin review
 *  approved  → moderator access active
 *  rejected  → access denied
 *  suspended → access temporarily disabled by an admin
 */
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

/**
 * Core domain entity stored in Firestore.
 *
 * Field mapping (Firestore document → TS interface):
 *   uid              → applicantUid
 *   email            → applicantEmail
 *   displayName      → applicantName
 *   photoURL         → applicantPhotoURL
 *   reason           → reason
 *   experience       → experience
 *   status           → status
 *   reviewedBy       → reviewedBy        (admin UID who reviewed)
 *   reviewedAt       → reviewedAt        (timestamp of review)
 *   reviewNote       → reviewNote        (optional admin note)
 *   createdAt        → createdAt
 *   updatedAt        → updatedAt
 */
export interface ModeratorApplication extends BaseEntity {
  /** Firebase Auth UID of the applicant */
  applicantUid: string;

  /** Email address of the applicant */
  applicantEmail: string;

  /** Display name of the applicant */
  applicantName: string;

  /** Profile photo URL */
  applicantPhotoURL: string | null;

  /** Free-text: why do they want to be a moderator? */
  reason: string;

  /** Free-text: relevant experience */
  experience: string;

  /** Current review status */
  status: ApplicationStatus;

  /** UID of the admin who reviewed (null while pending) */
  reviewedBy: string | null;

  /** Timestamp of admin review (null while pending) */
  reviewedAt: Date | null;

  /** Optional note left by the reviewing admin */
  reviewNote: string | null;
}

/** Payload required to submit a new application (auto-generated fields excluded). */
export type SubmitApplicationPayload = Pick<
  ModeratorApplication,
  'applicantUid' | 'applicantEmail' | 'applicantName' | 'applicantPhotoURL' | 'reason' | 'experience'
>;

/** Payload an admin sends when reviewing (first-time approval/rejection). */
export interface ReviewApplicationPayload {
  status: 'approved' | 'rejected';
  reviewedBy: string;
  reviewNote?: string;
}

/** Payload used when toggling an already-approved moderator's access on/off. */
export interface ToggleModeratorPayload {
  /** UID of the admin performing the action */
  adminUid: string;
}
