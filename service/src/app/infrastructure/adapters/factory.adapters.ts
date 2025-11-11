import { Pinecone } from '@pinecone-database/pinecone';
import Axios from 'axios';

import { IAuthenticationService } from '@domain/ports/services/autentication.port';
import { IVectorStorePort } from '@domain/ports/services/vector-store.port';
import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import CognitoAuthAdapter from './services/cognito-auth.adapter';
import PineconeAdapter from './services/pinecone.adapter';
import MetadataHttpAdapter from './services/http/http.adapter';

/**
 * Adapter factory interface
 */
export interface IAdapterFactory {
	createAuthenticationService(): IAuthenticationService;
	createVectorStorePort(): IVectorStorePort;
	createMetadataApiPort(): IMetadataApiPort;
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
	createVectorStorePort: () =>
		PineconeAdapter.create(
			new Pinecone({
				apiKey: process.env.PINECONE_API_KEY!,
			}),
			{
				indexName: process.env.PINECONE_INDEX_NAME!,
				namespace: process.env.PINECONE_NAMESPACE!,
			}
		),
	createMetadataApiPort: () =>
		MetadataHttpAdapter.create(
			Axios.create({
				baseURL: process.env.METADATA_API_URL!,
				timeout: 30000,
				headers: {
					'Content-Type': 'application/json',
				},
			})
		),
};
