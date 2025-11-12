import { ExternalServiceError, DomainError } from '@domain/errors';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';
import { BussinesActivity, IBussinesActivity } from '@domain/entities/bussines-activity.entity';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface IUseCaseProps {
	readonly repository: IBussinesActivityRepository;
}

interface BusinessActivityInput {
	readonly id: string;
	readonly name: string;
	readonly skus: number;
}

// ============================================================================
// PURE FUNCTIONS - VALIDATION
// ============================================================================

/**
 * Validates business activity input parameters
 * Pure function: performs validation without side effects
 */
const validateInput = (input: BusinessActivityInput): void => {
	DomainValidatorUtils.validateRequiredString('id', input.id);
	DomainValidatorUtils.validateRequiredString('name', input.name);
	DomainValidatorUtils.validatePositiveNumber('skus', input.skus);
};

// ============================================================================
// PURE FUNCTIONS - ENTITY CREATION
// ============================================================================

/**
 * Creates a business activity entity from input
 * Pure function: creates entity without side effects
 */
const createBusinessActivityEntity = (input: BusinessActivityInput): IBussinesActivity =>
	BussinesActivity.create(input.id, input.name, input.skus);

// ============================================================================
// SIDE EFFECTS - PERSISTENCE
// ============================================================================

/**
 * Persists business activity to repository
 * Side effect: database operation
 */
const persistBusinessActivity = async (
	repository: IBussinesActivityRepository,
	entity: IBussinesActivity
): Promise<void> => {
	await repository.save(entity);
};

// ============================================================================
// MAIN ORCHESTRATION - COMPOSING THE ENTIRE FLOW
// ============================================================================

/**
 * Main orchestration function that composes the entire workflow
 * Coordinates validation, entity creation, and persistence
 */
const orchestrateBusinessActivityCreation = async (
	config: IUseCaseProps,
	input: BusinessActivityInput
): Promise<void> => {
	// Validate input (pure)
	validateInput(input);

	// Create entity (pure)
	const entity = createBusinessActivityEntity(input);

	// Persist entity (side effect)
	await persistBusinessActivity(config.repository, entity);
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Wraps execution with centralized error handling
 * Ensures domain errors are preserved and unexpected errors are wrapped
 */
const wrapWithErrorHandling =
	(fn: (config: IUseCaseProps, input: BusinessActivityInput) => Promise<void>, errorMessage: string) =>
	async (config: IUseCaseProps, input: BusinessActivityInput): Promise<void> => {
		try {
			await fn(config, input);
		} catch (error: any) {
			if (error instanceof DomainError) throw error;
			throw ExternalServiceError(errorMessage, error);
		}
	};

// ============================================================================
// USE CASE FACTORY
// ============================================================================

/**
 * Factory function that creates the use case with dependency injection
 * Returns an object with the execute method
 */
function CreateBussinesActivityUseCase(
	repository: IBussinesActivityRepository,
	errorMessage: string = 'Failed to create business activity'
) {
	const config: IUseCaseProps = { repository };

	// Create error-wrapped version of orchestration
	const safeExecute = wrapWithErrorHandling(orchestrateBusinessActivityCreation, errorMessage);

	return {
		execute: async (id: string, name: string, skus: number): Promise<void> => {
			const input: BusinessActivityInput = { id, name, skus };
			await safeExecute(config, input);
		},
	};
}

export default CreateBussinesActivityUseCase;
