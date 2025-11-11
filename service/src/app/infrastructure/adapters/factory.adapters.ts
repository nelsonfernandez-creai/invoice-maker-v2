// Factory to create the adapters

import { IAuthenticationService } from '@domain/ports/services/autentication.port';
import CognitoAuthAdapter from './services/cognito-auth.adapter';

/**
 * Adapter factory interface
 */
export interface IAdapterFactory {
	createAuthenticationService(): IAuthenticationService;
}

/**
 * Adapter factory implementation
 * @returns The adapter factory
 */
export const AdapterFactory: IAdapterFactory = {
	createAuthenticationService: () =>
		CognitoAuthAdapter.create({
			region: process.env.COGNITO_REGION!,
			userPoolId: process.env.COGNITO_USER_POOL_ID!,
			clientId: process.env.COGNITO_CLIENT_ID!,
		}),
};
