import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import type { IAuthenticationService, LoginCredentials, AuthResult } from '@domain/ports/services/autentication.port';

type CognitoConfig = {
	region: string;
	userPoolId: string;
	clientId: string;
};

const createCognitoAuthAdapter = (config: CognitoConfig): IAuthenticationService => {
	const client = new CognitoIdentityProviderClient({ region: config.region });

	const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
		const command = new InitiateAuthCommand({
			AuthFlow: 'USER_PASSWORD_AUTH',
			ClientId: config.clientId,
			AuthParameters: {
				USERNAME: credentials.username,
				PASSWORD: credentials.password,
			},
		});

		const response = await client.send(command);

		if (!response.AuthenticationResult) {
			throw new Error('Authentication failed');
		}

		return {
			accessToken: response.AuthenticationResult.AccessToken!,
			expiresIn: response.AuthenticationResult.ExpiresIn!,
		};
	};

	return {
		login,
	};
};

export default createCognitoAuthAdapter;