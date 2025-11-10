import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ExternalServiceError } from '@domain/errors';
import { PersistenceTransforms, IPersistenceClient } from '@domain/ports/services/persistence-client.port';

/**
 * Configuration for the persistence client
 */
interface IDynamoClientConfig<TDomain, TDatabase = any> {
	config: DynamoDBClientConfig;
	tableName: string;
	transforms: PersistenceTransforms<TDomain, TDatabase>;
}

/**
 * Singleton DynamoDB Client instance
 */
let dynamoDBClient: DynamoDBClient | undefined = undefined;

/**
 * Singleton DynamoDB Document Client instance
 */
let documentClient: DynamoDBDocumentClient | undefined = undefined;

/**
 * Creates a new DynamoDB client
 * @param config - The configuration for the DynamoDB client
 * @returns The DynamoDB client
 */
const getDynamoDBClient = (config: DynamoDBClientConfig): DynamoDBClient => {
	if (!dynamoDBClient) {
		dynamoDBClient = new DynamoDBClient(config);
	}

	return dynamoDBClient;
};

/**
 * Initializes or retrieves the singleton DynamoDB Document Client
 * @param client - The base DynamoDB client
 * @param options - Optional configuration for the document client
 * @returns The DynamoDB Document Client instance
 */
const getDynamoDBDocumentClient = (config: DynamoDBClientConfig): DynamoDBDocumentClient => {
	const client = getDynamoDBClient(config);

	if (!documentClient) {
		documentClient = DynamoDBDocumentClient.from(client, {
			marshallOptions: {
				removeUndefinedValues: true,
				convertEmptyValues: false,
			},
		});
	}

	return documentClient;
};

/**
 * Resets the singleton client instance (useful for testing)
 */
const resetDynamoDBDocumentClient = (): void => {
	dynamoDBClient = undefined;
	documentClient = undefined;
};

/**
 * Parameters for DynamoDB get operation
 */
export interface IDynamoDBGetParams<TDomain, TDatabase = any> {
	client: DynamoDBDocumentClient;
	tableName: string;
	key: Record<string, any>;
	transforms: PersistenceTransforms<TDomain, TDatabase>;
}

/**
 * Gets an item from DynamoDB
 * @param params - The parameters for the get operation
 * @returns The domain entity or null if not found
 * @throws ExternalServiceError if the operation fails
 */
const dynamoDBGet = async <TDomain, TDatabase = any>(
	params: IDynamoDBGetParams<TDomain, TDatabase>
): Promise<TDomain | null> => {
	const { client, tableName, key, transforms } = params;

	try {
		const command = new GetCommand({
			TableName: tableName,
			Key: key,
		});

		const response = await client.send(command);

		if (!response.Item) {
			return null;
		}

		return transforms.toDomain(response.Item as TDatabase);
	} catch (error: any) {
		const errorMessage = error?.message || 'Unknown error';
		throw ExternalServiceError(`DynamoDB get operation failed: ${errorMessage}`);
	}
};

const create = <TDomain, TDatabase = any>(
	config: IDynamoClientConfig<TDomain, TDatabase>
): IPersistenceClient<TDomain> => {
	const client = getDynamoDBDocumentClient(config.config);
	const { tableName, transforms } = config;

	return {
		get: (key: Record<string, any>): Promise<TDomain | null> =>
			dynamoDBGet<TDomain, TDatabase>({ client, tableName, key, transforms }),
	};
};

export const DynamoDBClientAdapter = {
	create,
	resetDynamoDBDocumentClient,
} as const;

export default DynamoDBClientAdapter;
