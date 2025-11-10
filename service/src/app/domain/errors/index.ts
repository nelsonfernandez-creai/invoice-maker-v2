/**
 * Interface for all domain errors
 */
export interface DomainError extends Error {
	code: number;
}

/**
 * Creates a new domain error object
 * @param code - The error code
 * @param message - The error message
 * @param name - The error name
 * @returns The created error object
 */
function create(code: number, message: string, name: string): DomainError {
	const error = new Error(message) as DomainError;
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
export function ValidationError(message: string, code: number = 400): DomainError {
	return create(code, `Validation error: ${message}`, 'ValidationError');
}
