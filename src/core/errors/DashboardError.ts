/**
 * Custom error class for dashboard operations
 * Provides structured error information for better error handling and user feedback
 */

export type ErrorCode =
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'
  | 'OPERATION_FAILED'
  | 'TIMEOUT'
  | 'CONFLICT';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DashboardErrorOptions {
  code: ErrorCode;
  message: string;
  severity?: ErrorSeverity;
  recoverable?: boolean;
  originalError?: Error;
  context?: Record<string, any>;
}

/**
 * Custom error class for dashboard operations
 */
export class DashboardError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly recoverable: boolean;
  public readonly originalError?: Error;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(options: DashboardErrorOptions) {
    super(options.message);
    
    this.name = 'DashboardError';
    this.code = options.code;
    this.severity = options.severity || 'medium';
    this.recoverable = options.recoverable ?? true;
    this.originalError = options.originalError;
    this.context = options.context;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DashboardError);
    }
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.code) {
      case 'NOT_FOUND':
        return 'The requested item could not be found.';
      case 'PERMISSION_DENIED':
        return 'You do not have permission to perform this action.';
      case 'NETWORK_ERROR':
        return 'A network error occurred. Please check your connection and try again.';
      case 'VALIDATION_ERROR':
        return this.message; // Validation errors should have specific messages
      case 'TIMEOUT':
        return 'The operation took too long. Please try again.';
      case 'CONFLICT':
        return 'This operation conflicts with existing data.';
      case 'OPERATION_FAILED':
        return 'The operation failed. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if the error is recoverable
   */
  isRecoverable(): boolean {
    return this.recoverable;
  }

  /**
   * Get error details for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
      originalError: this.originalError ? {
        message: this.originalError.message,
        stack: this.originalError.stack,
      } : undefined,
    };
  }
}

/**
 * Factory functions for common error scenarios
 */
export const DashboardErrors = {
  notFound: (resource: string, id?: string): DashboardError => {
    return new DashboardError({
      code: 'NOT_FOUND',
      message: id 
        ? `${resource} with ID "${id}" not found`
        : `${resource} not found`,
      severity: 'low',
      recoverable: false,
      context: { resource, id },
    });
  },

  permissionDenied: (action: string, resource: string): DashboardError => {
    return new DashboardError({
      code: 'PERMISSION_DENIED',
      message: `Permission denied: Cannot ${action} ${resource}`,
      severity: 'high',
      recoverable: false,
      context: { action, resource },
    });
  },

  networkError: (originalError?: Error): DashboardError => {
    return new DashboardError({
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      severity: 'medium',
      recoverable: true,
      originalError,
    });
  },

  validationError: (field: string, reason: string): DashboardError => {
    return new DashboardError({
      code: 'VALIDATION_ERROR',
      message: `Validation failed for ${field}: ${reason}`,
      severity: 'low',
      recoverable: true,
      context: { field, reason },
    });
  },

  operationFailed: (operation: string, originalError?: Error): DashboardError => {
    return new DashboardError({
      code: 'OPERATION_FAILED',
      message: `Operation "${operation}" failed`,
      severity: 'medium',
      recoverable: true,
      originalError,
      context: { operation },
    });
  },

  timeout: (operation: string, timeoutMs: number): DashboardError => {
    return new DashboardError({
      code: 'TIMEOUT',
      message: `Operation "${operation}" timed out after ${timeoutMs}ms`,
      severity: 'medium',
      recoverable: true,
      context: { operation, timeoutMs },
    });
  },

  conflict: (resource: string, reason: string): DashboardError => {
    return new DashboardError({
      code: 'CONFLICT',
      message: `Conflict with ${resource}: ${reason}`,
      severity: 'medium',
      recoverable: true,
      context: { resource, reason },
    });
  },
};
