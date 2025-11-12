import BussinesActivity, { IBussinesActivity } from '@domain/entities/bussines-activity.entity';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import { getCurrentTimestamp, itemExists } from '@domain/utils/pure-functions.util';
import { IDynamoDBClientAdapter } from '@infrastructure/adapters/services/database/dynamodb-client.adapter';

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_TYPE = 'BUSINESS_ACTIVITY' as const;

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
 * Business activity data transfer object for database storage
 */
export interface IBussinesActivityDto {
	readonly id: string;
	readonly name: string;
	readonly skus: number;
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
interface IDynamoDBItem extends IBussinesActivityDto {
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
 * Converts business activity entity to database DTO
 * Pure function: simple data transformation
 */
const toDatabaseDto = (entity: IBussinesActivity): IBussinesActivityDto => ({
	id: entity.id,
	name: entity.name,
	skus: entity.skus,
});

/**
 * Converts database DTO to business activity entity
 * Pure function: creates domain entity from DTO
 */
const fromDatabaseDto = (dto: IBussinesActivityDto): IBussinesActivity =>
	BussinesActivity.create(dto.id, dto.name, dto.skus);

// ============================================================================
// PURE FUNCTIONS - KEY BUILDERS
// ============================================================================

/**
 * Creates DynamoDB key for business activity
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
const createDynamoDBItem = (dto: IBussinesActivityDto, timestamp: string): IDynamoDBItem => ({
	...createDynamoDBKey(dto.id),
	...dto,
	createdAt: timestamp,
	updatedAt: timestamp,
});

/**
 * Creates update expression for DynamoDB update operation
 * Pure function: builds update expression components
 */
const createUpdateExpression = (dto: IBussinesActivityDto, timestamp: string): IUpdateExpression => ({
	UpdateExpression: 'set #name = :name, #skus = :skus, #updatedAt = :updatedAt',
	ExpressionAttributeNames: {
		'#name': 'name',
		'#skus': 'skus',
		'#updatedAt': 'updatedAt',
	},
	ExpressionAttributeValues: {
		':name': dto.name,
		':skus': dto.skus,
		':updatedAt': timestamp,
	},
});

// ============================================================================
// SIDE EFFECTS - DATABASE OPERATIONS
// ============================================================================

/**
 * Fetches business activity from DynamoDB by ID
 * Side effect: database read operation
 */
const fetchBusinessActivityById = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IBussinesActivity | undefined> => {
	const result = await client.get({
		TableName: tableName,
		Key: createDynamoDBKey(id),
	});

	if (!itemExists(result.Item)) {
		return undefined;
	}

	return fromDatabaseDto(result.Item as IBussinesActivityDto);
};

/**
 * Persists new business activity to DynamoDB
 * Side effect: database write operation
 */
const persistBusinessActivity = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	entity: IBussinesActivity
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
 * Updates existing business activity in DynamoDB
 * Side effect: database update operation
 */
const updateBusinessActivity = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	entity: IBussinesActivity
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
 * Finds business activity by ID with error handling
 * Wraps database operation and handles errors gracefully
 */
const findById = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IBussinesActivity | undefined> => {
	try {
		return await fetchBusinessActivityById(client, tableName, id);
	} catch (error) {
		console.error(`Error fetching business activity with id ${id}:`, error);
		return undefined;
	}
};

/**
 * Saves business activity with error handling
 * Wraps database operation and handles errors gracefully
 */
const save = async (client: IDynamoDBClientAdapter, tableName: string, entity: IBussinesActivity): Promise<void> => {
	try {
		await persistBusinessActivity(client, tableName, entity);
	} catch (error) {
		console.error(`Error saving business activity with id ${entity.id}:`, error);
		throw error;
	}
};

/**
 * Updates business activity with error handling
 * Wraps database operation and handles errors gracefully
 */
const update = async (
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	entity: IBussinesActivity
): Promise<void> => {
	try {
		await updateBusinessActivity(client, tableName, id, entity);
	} catch (error) {
		console.error(`Error updating business activity with id ${id}:`, error);
		throw error;
	}
};

// ============================================================================
// REPOSITORY FACTORY
// ============================================================================

/**
 * Creates a business activity repository instance with dependency injection
 * Returns an object implementing the repository interface
 */
function BussinesActivityRepository(config: IRepositoryConfig): IBussinesActivityRepository {
	const { client, tableName } = config;

	return {
		findById: (id: string): Promise<IBussinesActivity | undefined> => findById(client, tableName, id),
		save: (entity: IBussinesActivity): Promise<void> => save(client, tableName, entity),
		update: (id: string, entity: IBussinesActivity): Promise<void> => update(client, tableName, id, entity),
	};
}

export default BussinesActivityRepository;
