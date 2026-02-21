/**
 * Production-safe Logger Utility
 *
 * In development mode (`import.meta.env.DEV`), all log levels are active.
 * In production builds, only `error` and `warn` are emitted — `debug` and
 * `info` calls are silenced to avoid leaking internal state to DevTools.
 *
 * Usage:
 * ```ts
 * import { logger } from '@/core/utils/logger';
 *
 * logger.debug('[MyComponent]', 'Fetched items:', items);
 * logger.info('[MyComponent]', 'Operation complete');
 * logger.warn('[MyComponent]', 'Deprecation warning');
 * logger.error('[MyComponent]', 'Something failed:', error);
 * ```
 *
 * @module logger
 */

/** Whether the app is running in development mode. */
const isDev = import.meta.env.DEV;

/* eslint-disable no-console */

/**
 * Application logger that suppresses debug/info output in production builds.
 * Errors and warnings are always emitted regardless of environment.
 */
export const logger = {
    /**
     * Debug-level log — stripped in production.
     * Use for verbose diagnostic messages (data dumps, flow tracing, etc.)
     */
    debug: (...args: unknown[]): void => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Info-level log — stripped in production.
     * Use for operational messages (fetch started, subscription set up, etc.)
     */
    info: (...args: unknown[]): void => {
        if (isDev) {
            console.info(...args);
        }
    },

    /**
     * Warning — always emitted.
     * Use for recoverable issues and deprecation notices.
     */
    warn: (...args: unknown[]): void => {
        console.warn(...args);
    },

    /**
     * Error — always emitted.
     * Use for failures that need attention.
     */
    error: (...args: unknown[]): void => {
        console.error(...args);
    },
} as const;

/* eslint-enable no-console */
