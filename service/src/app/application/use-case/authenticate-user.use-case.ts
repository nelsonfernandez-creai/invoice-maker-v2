import { AuthResult, IAuthenticationService } from '@domain/ports/services/autentication.port';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';
import { ExternalServiceError, DomainError } from '@domain/errors';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface IUseCaseProps {
	readonly authService: IAuthenticationService;
}

interface AuthenticationInput {
	readonly username: string;
	readonly password: string;
}

// ============================================================================
// PURE FUNCTIONS - VALIDATION
// ============================================================================

/**
 * Validates authentication input parameters
 * Pure function: performs validation without side effects
 */
const validateInput = (input: AuthenticationInput): void => {
	DomainValidatorUtils.validateRequiredString('username', input.username);
	DomainValidatorUtils.validateRequiredString('password', input.password);
};

// ============================================================================
// SIDE EFFECTS - AUTHENTICATION
// ============================================================================

/**
 * Performs authentication against the authentication service
 * Side effect: external service call
 */
const performAuthentication = async (
	authService: IAuthenticationService,
	input: AuthenticationInput
): Promise<AuthResult> => await authService.login(input);

// ============================================================================
// MAIN ORCHESTRATION - COMPOSING THE ENTIRE FLOW
// ============================================================================

/**
 * Main orchestration function that composes the entire workflow
 * Coordinates validation and authentication
 */
const orchestrateAuthentication = async (config: IUseCaseProps, input: AuthenticationInput): Promise<AuthResult> => {
	// Validate input (pure)
	validateInput(input);

	// Perform authentication (side effect)
	return await performAuthentication(config.authService, input);
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Wraps execution with centralized error handling
 * Ensures domain errors are preserved and unexpected errors are wrapped
 */
const wrapWithErrorHandling =
	(fn: (config: IUseCaseProps, input: AuthenticationInput) => Promise<AuthResult>, errorMessage: string) =>
	async (config: IUseCaseProps, input: AuthenticationInput): Promise<AuthResult> => {
		try {
			return await fn(config, input);
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
function CreateAuthenticateUserUseCase(
	authService: IAuthenticationService,
	errorMessage: string = 'Authentication failed'
) {
	const config: IUseCaseProps = { authService };

	// Create error-wrapped version of orchestration
	const safeExecute = wrapWithErrorHandling(orchestrateAuthentication, errorMessage);

	return {
		execute: async (username: string, password: string): Promise<AuthResult> => {
			const input: AuthenticationInput = { username, password };
			return await safeExecute(config, input);
		},
	};
}

export default CreateAuthenticateUserUseCase;
