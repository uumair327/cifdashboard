// Custom error class for dashboard operations

export type ErrorSeverity = 'info' | 'warning' | 'error';

export class DashboardError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity = 'error',
    public recoverable: boolean = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DashboardError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DashboardError);
    }
  }

  static fromError(error: any, code: string = 'UNKNOWN_ERROR'): DashboardError {
    if (error instanceof DashboardError) {
      return error;
    }

    const message = error?.message || 'An unknown error occurred';
    return new DashboardError(message, code, 'error', true, error);
  }
}

// Common error codes
export const ErrorCodes = {
  // Repository errors
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Operation errors
  CREATE_FAILED: 'CREATE_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  FETCH_FAILED: 'FETCH_FAILED',
  
  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
