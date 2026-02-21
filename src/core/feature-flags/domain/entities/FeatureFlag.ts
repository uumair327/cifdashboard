/**
 * Feature Flag Domain Entities
 *
 * Single source of truth for all feature flag definitions.
 * To add a new flag: add it to APP_FEATURE_FLAGS constant and FeatureFlagKey type.
 *
 * @module core/feature-flags/domain/entities
 */

// ─── All Known Feature Flag Keys ─────────────────────────────────────────────
// This union type is the compile-time registry of all valid flags.
// The build will fail if an unknown key is used anywhere.

export type FeatureFlagKey =
    // App Features (GuardianCare mobile app)
    | 'feature.carousel'
    | 'feature.home_images'
    | 'feature.forum'
    | 'feature.forum_parent'
    | 'feature.forum_children'
    | 'feature.learn'
    | 'feature.quizzes'
    | 'feature.videos'
    | 'feature.quiz_manager'
    // Dashboard Features (this admin panel)
    | 'dashboard.feature_flags'
    | 'dashboard.analytics';

// ─── Flag Categories ──────────────────────────────────────────────────────────

export type FeatureFlagCategory = 'app' | 'dashboard' | 'experimental';

// ─── Flag Environment ────────────────────────────────────────────────────────

export type FeatureFlagEnvironment = 'all' | 'production' | 'development';

// ─── Core Entity ─────────────────────────────────────────────────────────────

export interface FeatureFlag {
    /** Unique identifier matching FeatureFlagKey */
    readonly id: FeatureFlagKey;
    /** Human-readable display name */
    readonly name: string;
    /** What this flag controls */
    readonly description: string;
    /** Whether the feature is currently active */
    enabled: boolean;
    /** Grouping for the management UI */
    readonly category: FeatureFlagCategory;
    /** Who last changed this flag */
    lastModifiedBy?: string;
    /** When it was last changed */
    lastModifiedAt?: Date;
    /** Whether this flag can be toggled from the UI */
    readonly isLocked?: boolean;
}

// ─── App Feature Definitions (defaults) ──────────────────────────────────────
// These are stored in Firestore. First run seeds these defaults if missing.

export const APP_FEATURE_FLAGS: Readonly<Record<FeatureFlagKey, Omit<FeatureFlag, 'id' | 'enabled'> & { defaultEnabled: boolean }>> = {
    // App features
    'feature.carousel': {
        name: 'Carousel Items',
        description: 'Controls the home screen carousel / banner slides in the GuardianCare app.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.home_images': {
        name: 'Home Images',
        description: 'Controls home screen image grid visible to app users.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.forum': {
        name: 'Community Forum',
        description: 'Main toggle for all forum functionality in the GuardianCare app.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.forum_parent': {
        name: 'Parent Forum',
        description: 'Forum section specifically for parents.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.forum_children': {
        name: 'Children Forum',
        description: 'Forum section specifically for children.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.learn': {
        name: 'Learn Section',
        description: 'Educational content visible in the GuardianCare app.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.quizzes': {
        name: 'Quizzes',
        description: 'Interactive quiz feature in the GuardianCare app.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.videos': {
        name: 'Videos',
        description: 'Video content library in the GuardianCare app.',
        category: 'app',
        defaultEnabled: true,
    },
    'feature.quiz_manager': {
        name: 'Quiz Manager',
        description: 'Admin quiz creation and management tool.',
        category: 'app',
        defaultEnabled: true,
    },
    // Dashboard features
    'dashboard.feature_flags': {
        name: 'Feature Flags Dashboard',
        description: 'This feature flag management panel itself.',
        category: 'dashboard',
        defaultEnabled: true,
        isLocked: true, // Prevent disabling the flags panel from itself
    },
    'dashboard.analytics': {
        name: 'Analytics Overview',
        description: 'Collection counts and statistics shown on the Dashboard home.',
        category: 'dashboard',
        defaultEnabled: true,
    },
} as const;
