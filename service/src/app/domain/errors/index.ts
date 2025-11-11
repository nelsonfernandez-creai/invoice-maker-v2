/**
 * Interface for all domain errors
 */
export interface IDomainError extends Error {
	code: number;
}

/**
 * Creates a new domain error object
 * @param code - The error code
 * @param message - The error message
 * @param name - The error name
 * @returns The created error object
 */
function create(code: number, message: string, name: string): IDomainError {
	const error = new Error(message) as IDomainError;
	error.code = code;
	error.name = name;
	error.stack = new Error().stack;

	return error;
}

// ============================================
// Errors For Validation
// ============================================

/**
 *
 * @param message - The error message
 * @param code - The error code
 * @returns The created error object
 */
export function ValidationError(message: string, code: number = 400): IDomainError {
	return create(code, `Validation error: ${message}`, 'ValidationError');
}

// ============================================
// Errors For External Services
// ============================================

/**
 * External service error
 * @param message - The error message
 * @param code - The error code
 * @returns The created error object
 */
export function ExternalServiceError(message: string, code: number = 500): IDomainError {
	return create(code, `External service error: ${message}`, 'ExternalServiceError');
}

// ============================================
// Errors For Authentication
// ============================================

/**
 * Not authorized error
 * @param message - The error message
 * @returns The created error object
 */
export function NotAuthorizedError(message: string): IDomainError {
	return create(401, `Not authorized error: ${message}`, 'NotAuthorizedError');
}

// ============================================
// Errors For Http Requests
// ============================================

/**
 * Bad request error
 * @param message - The error message
 * @returns The created error object
 */
export function BadRequestError(message: string): IDomainError {
	return create(400, `Bad request: ${message}`, 'BadRequestError');
}

/**
 * Missing path parameter error
 * @param message - The error message
 * @returns The created error object
 */
export function MissingPathParameterError(message: string): IDomainError {
	return create(404, `Missing path parameter: ${message || 'Missing path parameter'}`, 'MissingPathParameterError');
}
