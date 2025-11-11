import { AuthResult, IAuthenticationService } from '@domain/ports/services/autentication.port';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';
import { ExternalServiceError, DomainError } from '@domain/errors';

/**
 * Execute the use case
 * @param data - The login data
 * @returns The auth tokens
 * @throws {ValidationError} If login data is invalid
 * @throws {ExternalServiceError} If authentication fails
 */
async function execute(authService: IAuthenticationService, username: string, password: string): Promise<AuthResult> {
	try {
		DomainValidatorUtils.validateRequiredString('username', username);
		DomainValidatorUtils.validateRequiredString('password', password);

		return await authService.login({ username, password });
	} catch (error: any) {
		// Re-throw domain errors as-is
		if (error instanceof DomainError) {
			throw error;
		}
		// Wrap unexpected errors
		throw ExternalServiceError('Authentication failed', error);
	}
}

const create = (authService: IAuthenticationService) => {
	return {
		execute: (username: string, password: string) => execute(authService, username, password),
	};
};

export const AuthenticateUserUseCase = {
	create,
} as const;

export default AuthenticateUserUseCase;
