import { ValidationError } from '@domain/errors';

/**
 * Validates that a string is required and is not empty
 * @param fieldName - The name of the field to validate
 * @param value - The value of the field to validate
 * @throws ValidationError if the field is required and is not provided
 */
function validateRequiredString(fieldName: string, value: string): void {
	if (!value || value.trim() === '') {
		throw ValidationError(`${fieldName} is required and must be a string`);
	}
}

/**
 * Validates that a number is positive
 * @param fieldName - The name of the field to validate
 * @param value - The value of the field to validate
 * @param strictlyPositive - Whether the number must be strictly positive
 * @throws ValidationError if the field is required and is not provided
 */
function validatePositiveNumber(fieldName: string, value: number, strictlyPositive: boolean = false): void {
	if (!value || (strictlyPositive && value <= 0)) {
		throw ValidationError(`${fieldName} is required and must be greater than 0`);
	}
}

/**
 * Validates that a number is non-negative
 * @param fieldName - The name of the field to validate
 * @param value - The value of the field to validate
 * @throws ValidationError if the field is required and is not provided
 */
function validateNonNegativeNumber(fieldName: string, value: number): void {
	if (value === undefined || value === null || value < 0) {
		throw ValidationError(`${fieldName} is required and must be greater than or equal to 0`);
	}
}

/**
 * Validates that a value is not null
 * @param fieldName - The name of the field to validate
 * @param value - The value of the field to validate
 * @throws ValidationError if the field is required and is not provided
 */
function validateNotNull(fieldName: string, value: any): void {
	if (value === undefined || value === null) {
		throw ValidationError(`${fieldName} is required and must be not null`);
	}
}

/**
 * Validates that a value is not empty
 * @param fieldName - The name of the field to validate
 * @param value - The value of the field to validate
 * @throws ValidationError if the field is required and is not provided
 */
function validateNotEmpty(fieldName: string, value: any): void {
	if (value === undefined || value === null || value.length === 0) {
		throw ValidationError(`${fieldName} is required and must be not empty`);
	}
}

export const DomainValidatorUtils = {
	validateRequiredString,
	validatePositiveNumber,
	validateNonNegativeNumber,
	validateNotNull,
	validateNotEmpty
} as const;

export default DomainValidatorUtils;
