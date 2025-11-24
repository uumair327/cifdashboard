/**
 * Property-based tests for DashboardError
 * Feature: dashboard-redesign
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { DashboardError, DashboardErrors, ErrorCode, ErrorSeverity } from './DashboardError';

describe('DashboardError Properties', () => {
  describe('Property 22: Error notification on operation failure', () => {
    /**
     * Feature: dashboard-redesign, Property 22: Error notification on operation failure
     * 
     * For any failed operation, an error notification should be displayed containing
     * information about what went wrong.
     * 
     * Validates: Requirements 9.3
     */
    it('should provide user-friendly error messages for all error codes', () => {
      const errorCodes: ErrorCode[] = [
        'NOT_FOUND',
        'PERMISSION_DENIED',
        'NETWORK_ERROR',
        'VALIDATION_ERROR',
        'UNKNOWN_ERROR',
        'OPERATION_FAILED',
        'TIMEOUT',
        'CONFLICT',
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...errorCodes),
          fc.string({ minLength: 1 }),
          (code, message) => {
            const error = new DashboardError({
              code,
              message,
            });

            // Should have a user-friendly message
            const userMessage = error.getUserMessage();
            expect(userMessage).toBeDefined();
            expect(userMessage.length).toBeGreaterThan(0);
            
            // User message should be different from technical message
            // (except for validation errors which use the original message)
            if (code !== 'VALIDATION_ERROR') {
              expect(userMessage).not.toBe(message);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should contain all necessary error information', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ErrorCode>(
            'NOT_FOUND',
            'PERMISSION_DENIED',
            'NETWORK_ERROR',
            'VALIDATION_ERROR',
            'UNKNOWN_ERROR',
            'OPERATION_FAILED',
            'TIMEOUT',
            'CONFLICT'
          ),
          fc.string({ minLength: 1 }),
          fc.constantFrom<ErrorSeverity>('low', 'medium', 'high', 'critical'),
          fc.boolean(),
          (code, message, severity, recoverable) => {
            const error = new DashboardError({
              code,
              message,
              severity,
              recoverable,
            });

            // Should contain all required fields
            expect(error.code).toBe(code);
            expect(error.message).toBe(message);
            expect(error.severity).toBe(severity);
            expect(error.recoverable).toBe(recoverable);
            expect(error.timestamp).toBeInstanceOf(Date);

            // Should be serializable for logging
            const json = error.toJSON();
            expect(json.code).toBe(code);
            expect(json.message).toBe(message);
            expect(json.severity).toBe(severity);
            expect(json.recoverable).toBe(recoverable);
            expect(json.timestamp).toBeDefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve original error information', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (errorMessage, contextMessage) => {
            const originalError = new Error(errorMessage);
            const dashboardError = new DashboardError({
              code: 'OPERATION_FAILED',
              message: contextMessage,
              originalError,
            });

            // Should preserve original error
            expect(dashboardError.originalError).toBe(originalError);
            expect(dashboardError.originalError?.message).toBe(errorMessage);

            // Should include original error in JSON
            const json = dashboardError.toJSON();
            expect(json.originalError).toBeDefined();
            expect(json.originalError?.message).toBe(errorMessage);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide context information for debugging', () => {
      fc.assert(
        fc.property(
          fc.record({
            operation: fc.string({ minLength: 1 }),
            resource: fc.string({ minLength: 1 }),
            userId: fc.string({ minLength: 1 }),
          }),
          (context) => {
            const error = new DashboardError({
              code: 'OPERATION_FAILED',
              message: 'Operation failed',
              context,
            });

            // Should preserve context
            expect(error.context).toEqual(context);

            // Should include context in JSON
            const json = error.toJSON();
            expect(json.context).toEqual(context);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Error Factory Functions', () => {
    it('should create not found errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (resource, id) => {
            const error = DashboardErrors.notFound(resource, id);

            expect(error.code).toBe('NOT_FOUND');
            expect(error.severity).toBe('low');
            expect(error.recoverable).toBe(false);
            expect(error.message).toContain(resource);
            expect(error.message).toContain(id);
            expect(error.context?.resource).toBe(resource);
            expect(error.context?.id).toBe(id);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create permission denied errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (action, resource) => {
            const error = DashboardErrors.permissionDenied(action, resource);

            expect(error.code).toBe('PERMISSION_DENIED');
            expect(error.severity).toBe('high');
            expect(error.recoverable).toBe(false);
            expect(error.message).toContain(action);
            expect(error.message).toContain(resource);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create validation errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (field, reason) => {
            const error = DashboardErrors.validationError(field, reason);

            expect(error.code).toBe('VALIDATION_ERROR');
            expect(error.severity).toBe('low');
            expect(error.recoverable).toBe(true);
            expect(error.message).toContain(field);
            expect(error.message).toContain(reason);
            expect(error.context?.field).toBe(field);
            expect(error.context?.reason).toBe(reason);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create operation failed errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          (operation) => {
            const error = DashboardErrors.operationFailed(operation);

            expect(error.code).toBe('OPERATION_FAILED');
            expect(error.severity).toBe('medium');
            expect(error.recoverable).toBe(true);
            expect(error.message).toContain(operation);
            expect(error.context?.operation).toBe(operation);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create timeout errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.integer({ min: 100, max: 60000 }),
          (operation, timeoutMs) => {
            const error = DashboardErrors.timeout(operation, timeoutMs);

            expect(error.code).toBe('TIMEOUT');
            expect(error.severity).toBe('medium');
            expect(error.recoverable).toBe(true);
            expect(error.message).toContain(operation);
            expect(error.message).toContain(String(timeoutMs));
            expect(error.context?.operation).toBe(operation);
            expect(error.context?.timeoutMs).toBe(timeoutMs);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create conflict errors with correct properties', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (resource, reason) => {
            const error = DashboardErrors.conflict(resource, reason);

            expect(error.code).toBe('CONFLICT');
            expect(error.severity).toBe('medium');
            expect(error.recoverable).toBe(true);
            expect(error.message).toContain(resource);
            expect(error.message).toContain(reason);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Error Recoverability', () => {
    it('should correctly identify recoverable errors', () => {
      const recoverableErrors = [
        DashboardErrors.networkError(),
        DashboardErrors.validationError('field', 'reason'),
        DashboardErrors.operationFailed('operation'),
        DashboardErrors.timeout('operation', 5000),
        DashboardErrors.conflict('resource', 'reason'),
      ];

      recoverableErrors.forEach(error => {
        expect(error.isRecoverable()).toBe(true);
        expect(error.recoverable).toBe(true);
      });
    });

    it('should correctly identify non-recoverable errors', () => {
      const nonRecoverableErrors = [
        DashboardErrors.notFound('resource', 'id'),
        DashboardErrors.permissionDenied('action', 'resource'),
      ];

      nonRecoverableErrors.forEach(error => {
        expect(error.isRecoverable()).toBe(false);
        expect(error.recoverable).toBe(false);
      });
    });
  });
});
