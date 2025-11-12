import EcommerceConfig, { IEcommerceConfig, IReference, IReferences } from '@domain/entities/ecommerce-config.entity';
import { IEcommerceConfigRepository } from '@domain/ports/repositories/ecommerce-config.port';
import { getCurrentTimestamp, itemExists } from '@domain/utils/pure-functions.util';
import { IDynamoDBClientAdapter } from '@infrastructure/adapters/services/database/dynamodb-client.adapter';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPE = 'ECOMMERCE_CONFIG' as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Repository configuration interface
 */
interface IRepositoryConfig {
	readonly client: IDynamoDBClientAdapter;
	readonly tableName: string;
}

/**
 * Ecommerce config data transfer object for database storage
 */
export interface IEcommerceConfigDto {
	readonly id: string;
	readonly references: ReadonlyArray<[string, IReference]>;
}

/**
 * DynamoDB key structure
 */
interface IDynamoDBKey {
	readonly pk: string;
	readonly sk: string;
}

/**
 * DynamoDB item with timestamps
 */
interface IDynamoDBItem extends IEcommerceConfigDto {
	readonly pk: string;
	readonly sk: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

/**
 * Update expression components
 */
interface IUpdateExpression {
	readonly UpdateExpression: string;
	readonly ExpressionAttributeNames: Record<string, string>;
	readonly ExpressionAttributeValues: Record<string, any>;
}

// ============================================================================
// PURE FUNCTIONS - MAPPERS
// ============================================================================

/**
 * Converts ecommerce config entity to database DTO
 * Pure function: simple data transformation
 */
const toDatabaseDto = (entity: IEcommerceConfig): IEcommerceConfigDto => ({
	id: entity.id,
	references: Array.from(entity.references.entries()),
});

/**
 * Converts database DTO to ecommerce config entity
 * Pure function: creates domain entity from DTO
 */
const fromDatabaseDto = (dto: IEcommerceConfigDto): IEcommerceConfig => {
	const references: IReferences = new Map(dto.references);
	return EcommerceConfig.create(dto.id, references);
};

// ============================================================================
// PURE FUNCTIONS - KEY BUILDERS
// ============================================================================

/**
 * Creates DynamoDB key for ecommerce config
 * Pure function: builds composite key
 */
const createDynamoDBKey = (id: string): IDynamoDBKey => ({
	pk: ENTITY_TYPE,
	sk: id,
});

// ============================================================================
// PURE FUNCTIONS - ITEM BUILDERS
// ============================================================================

/**
 * Creates complete DynamoDB item for new entity
 * Pure function: combines DTO with key and timestamps
 */
const createDynamoDBItem = (dto: IEcommerceConfigDto, timestamp: string): IDynamoDBItem => ({
	...createDynamoDBKey(dto.id),
	...dto,
	createdAt: timestamp,
	updatedAt: timestamp,
});

/**
 * Creates update expression for DynamoDB update operation
 * Pure function: builds update expression components
 */
const createUpdateExpression = (dto: IEcommerceConfigDto, timestamp: string): IUpdateExpression => ({
	UpdateExpression: 'set #references = :references, #updatedAt = :updatedAt',
	ExpressionAttributeNames: {
		'#references': 'references',
		'#updatedAt': 'updatedAt',
	},
	ExpressionAttributeValues: {
		':references': dto.references,
		':updatedAt': timestamp,
	},
});

// ============================================================================
// SIDE EFFECTS - DATABASE OPERATIONS
// ============================================================================

/**
 * Fetches ecommerce config from DynamoDB by ID
 * Side effect: database read operation
 */
const fetchEcommerceConfigById = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IEcommerceConfig | undefined> => {
	const result = await client.get({
		TableName: tableName,
		Key: createDynamoDBKey(id),
	});

	if (!itemExists(result.Item)) {
		return undefined;
	}

	return fromDatabaseDto(result.Item as IEcommerceConfigDto);
};

/**
 * Persists new ecommerce config to DynamoDB
 * Side effect: database write operation
 */
const persistEcommerceConfig = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	entity: IEcommerceConfig
): Promise<void> => {
	const dto = toDatabaseDto(entity);
	const timestamp = getCurrentTimestamp();
	const item = createDynamoDBItem(dto, timestamp);

	await client.save({
		TableName: tableName,
		Item: item,
	});
};

/**
 * Updates existing ecommerce config in DynamoDB
 * Side effect: database update operation
 */
const updateEcommerceConfig = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	entity: IEcommerceConfig
): Promise<void> => {
	const dto = toDatabaseDto(entity);
	const timestamp = getCurrentTimestamp();
	const updateExpression = createUpdateExpression(dto, timestamp);

	await client.update({
		TableName: tableName,
		Key: createDynamoDBKey(id),
		...updateExpression,
	});
};

// ============================================================================
// REPOSITORY OPERATIONS - WITH ERROR HANDLING
// ============================================================================

/**
 * Finds ecommerce config by ID with error handling
 * Wraps database operation and handles errors gracefully
 */
const findById = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IEcommerceConfig | undefined> => {
	try {
		return await fetchEcommerceConfigById(client, tableName, id);
	} catch (error) {
		console.error(`Error fetching ecommerce config with id ${id}:`, error);
		return undefined;
	}
};

/**
 * Saves ecommerce config with error handling
 * Wraps database operation and handles errors gracefully
 */
const save = async (client: IDynamoDBClientAdapter, tableName: string, entity: IEcommerceConfig): Promise<void> => {
	try {
		await persistEcommerceConfig(client, tableName, entity);
	} catch (error) {
		console.error(`Error saving ecommerce config with id ${entity.id}:`, error);
		throw error;
	}
};

/**
 * Updates ecommerce config with error handling
 * Wraps database operation and handles errors gracefully
 */
const update = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	entity: IEcommerceConfig
): Promise<void> => {
	try {
		await updateEcommerceConfig(client, tableName, id, entity);
	} catch (error) {
		console.error(`Error updating ecommerce config with id ${id}:`, error);
		throw error;
	}
};

// ============================================================================
// REPOSITORY FACTORY
// ============================================================================

/**
 * Creates an ecommerce config repository instance with dependency injection
 * Returns an object implementing the repository interface
 */
function EcommerceConfigRepository(config: IRepositoryConfig): IEcommerceConfigRepository {
	const { client, tableName } = config;

	return {
		findById: (id: string): Promise<IEcommerceConfig | undefined> => findById(client, tableName, id),
		save: (entity: IEcommerceConfig): Promise<void> => save(client, tableName, entity),
		update: (id: string, entity: IEcommerceConfig): Promise<void> => update(client, tableName, id, entity),
	};
}

export default EcommerceConfigRepository;
