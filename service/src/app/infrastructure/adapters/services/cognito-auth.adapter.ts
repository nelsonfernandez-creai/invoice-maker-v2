import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import type { IAuthenticationService, LoginCredentials, AuthResult } from '@domain/ports/services/autentication.port';

export interface ICognitoConfig {
	region: string;
	userPoolId: string;
	clientId: string;
};

async function login(
	client: CognitoIdentityProviderClient,
	config: ICognitoConfig,
	credentials: LoginCredentials
): Promise<AuthResult> {
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
}

const create = (config: ICognitoConfig): IAuthenticationService => {
	const client = new CognitoIdentityProviderClient({ region: config.region });

	return {
		login: (credentials: LoginCredentials) => login(client, config, credentials),
	};
};

export const CognitoAuthAdapter = {
	create,
} as const;

export default CognitoAuthAdapter;
