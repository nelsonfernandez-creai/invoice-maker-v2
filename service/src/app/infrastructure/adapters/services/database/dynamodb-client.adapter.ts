import { DynamoDBClient, DynamoDBClientConfig, QueryCommand } from '@aws-sdk/client-dynamodb';
import {
	BatchGetCommand,
	BatchGetCommandInput,
	BatchGetCommandOutput,
	BatchWriteCommand,
	BatchWriteCommandInput,
	BatchWriteCommandOutput,
	DeleteCommand,
	DeleteCommandInput,
	DeleteCommandOutput,
	DynamoDBDocumentClient,
	GetCommand,
	GetCommandInput,
	GetCommandOutput,
	PutCommand,
	PutCommandInput,
	PutCommandOutput,
	QueryCommandInput,
	QueryCommandOutput,
	UpdateCommand,
	UpdateCommandInput,
	UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

/**
 * The DynamoDB adapter config
 */
interface DynamoDBAdapterConfig {
	clientConfig: DynamoDBClientConfig;
	tableName: string;
}

export interface IDynamoDBClientAdapter {
	save: (params: PutCommandInput) => Promise<PutCommandOutput>;
	get: (params: GetCommandInput) => Promise<GetCommandOutput>;
	update: (params: UpdateCommandInput) => Promise<UpdateCommandOutput>;
	remove: (params: DeleteCommandInput) => Promise<DeleteCommandOutput>;
	query: (params: QueryCommandInput) => Promise<QueryCommandOutput>;
	batchWrite: (params: BatchWriteCommandInput) => Promise<BatchWriteCommandOutput>;
	batchGet: (params: BatchGetCommandInput) => Promise<BatchGetCommandOutput>;
}

/**
 * The DynamoDB document client
 */
let docsClient: DynamoDBDocumentClient | undefined = undefined;

/**
 * Gets the DynamoDB document client
 * @param config - The DynamoDB client config
 * @returns The DynamoDB document client
 */
function getDocsClient(config: DynamoDBClientConfig): DynamoDBDocumentClient {
	if (!docsClient) {
		docsClient = DynamoDBDocumentClient.from(new DynamoDBClient(config), {
			marshallOptions: {
				removeUndefinedValues: true,
				convertEmptyValues: true,
				convertClassInstanceToMap: true,
			},
		});
	}

	return docsClient;
}

/**
 * Clears the DynamoDBDocumentClient instance
 */
function clearDocsClient() {
	docsClient = undefined;
}

/**
 * Saves an item to DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The PutCommandInput
 * @returns The PutCommandOutput
 */
function save(client: DynamoDBDocumentClient, params: PutCommandInput): Promise<PutCommandOutput> {
	return client.send(new PutCommand(params));
}

/**
 * Gets an item from DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The GetCommandInput
 * @returns The GetCommandOutput
 */
function get(client: DynamoDBDocumentClient, params: GetCommandInput): Promise<GetCommandOutput> {
	return client.send(new GetCommand(params));
}

/**
 * Updates an item in DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The UpdateCommandInput
 * @returns The UpdateCommandOutput
 */
function update(client: DynamoDBDocumentClient, params: UpdateCommandInput): Promise<UpdateCommandOutput> {
	return client.send(new UpdateCommand(params));
}

/**
 * Removes an item from DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The DeleteCommandInput
 * @returns The DeleteCommandOutput
 */
function remove(client: DynamoDBDocumentClient, params: DeleteCommandInput): Promise<DeleteCommandOutput> {
	return client.send(new DeleteCommand(params));
}

/**
 * Queries items from DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The QueryCommandInput
 * @returns The QueryCommandOutput
 */
function query(client: DynamoDBDocumentClient, params: QueryCommandInput): Promise<QueryCommandOutput> {
	return client.send(new QueryCommand(params));
}

/**
 * Batch writes items to DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The BatchWriteCommandInput
 * @returns The BatchWriteCommandOutput
 */
function batchWrite(client: DynamoDBDocumentClient, params: BatchWriteCommandInput): Promise<BatchWriteCommandOutput> {
	return client.send(new BatchWriteCommand(params));
}

/**
 * Batch gets items from DynamoDB
 * @param client - The DynamoDB document client
 * @param params - The BatchGetCommandInput
 * @returns The BatchGetCommandOutput
 */
function batchGet(client: DynamoDBDocumentClient, params: BatchGetCommandInput): Promise<BatchGetCommandOutput> {
	return client.send(new BatchGetCommand(params));
}

/**
 * Creates a new DynamoDB adapter
 * @param config - The DynamoDB adapter config
 * @returns The DynamoDB adapter
 */
const create = (config: DynamoDBAdapterConfig) => {
	const client = getDocsClient(config.clientConfig);

	return {
		save: (params: PutCommandInput) => save(client, params),
		get: (params: GetCommandInput) => get(client, params),
		update: (params: UpdateCommandInput) => update(client, params),
		remove: (params: DeleteCommandInput) => remove(client, params),
		query: (params: QueryCommandInput) => query(client, params),
		batchWrite: (params: BatchWriteCommandInput) => batchWrite(client, params),
		batchGet: (params: BatchGetCommandInput) => batchGet(client, params),
	};
};

export const DynamoDBClientAdapter = {
	create,
	clearDocsClient,
};

export default DynamoDBClientAdapter;
