/**
 * Interface for all domain errors
 */

export class DomainError extends Error {
	code: number;
	name: string;

	constructor(message: string, code: number, name: string) {
		super(message);
		this.code = code;
		this.name = name;
	}
}

/**
 * Creates a new domain error object
 * @param code - The error code
 * @param message - The error message
 * @param name - The error name
 * @returns The created error object
 */
function create(code: number, message: string, name: string): DomainError {
	return new DomainError(message, code, name);
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
export function ValidationError(message: string, code: number = 400): DomainError {
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
export function ExternalServiceError(message: string, code: number = 500): DomainError {
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
export function NotAuthorizedError(message: string): DomainError {
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
export function BadRequestError(message: string): DomainError {
	return create(400, `Bad request: ${message}`, 'BadRequestError');
}

/**
 * Missing path parameter error
 * @param message - The error message
 * @returns The created error object
 */
export function MissingPathParameterError(message: string): DomainError {
	return create(404, `Missing path parameter: ${message || 'Missing path parameter'}`, 'MissingPathParameterError');
}
