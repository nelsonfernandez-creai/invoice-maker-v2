import BussinesActivity, { IBussinesActivity } from '@domain/entities/bussines-activity.entity';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import { IDynamoDBClientAdapter } from '../services/database/dynamodb-client.adapter';

/**
 * The bussines activity repository config
 */
interface IBussinesActivityRepositoryConfig {
	client: IDynamoDBClientAdapter;
	tableName: string;
}

/**
 * Bussines activity data transfer object
 */
export interface IBussinesActivityDto {
	id: string;
	name: string;
	skus: number;
}

/**
 * Convert a bussines activity to a database data transfer object
 * @param bussinesActivity - The bussines activity
 * @returns The bussines activity database data transfer object
 */
function toDatabaseDto(bussinesActivity: IBussinesActivity): IBussinesActivityDto {
	return {
		id: bussinesActivity.id,
		name: bussinesActivity.name,
		skus: bussinesActivity.skus,
	};
}

/**
 * Convert a database data transfer object to a bussines activity
 * @param bussinesActivityDto - The bussines activity database data transfer object
 * @returns The bussines activity
 */
function fromDatabaseDto(dto: IBussinesActivityDto): IBussinesActivity {
	return BussinesActivity.create(dto.id, dto.name, dto.skus);
}

// ============================================
// Queries
// ============================================

/**
 * Find a bussines activity by its id
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param id - The id
 * @returns The bussines activity
 */
async function findById(
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IBussinesActivity | undefined> {
	try {
		const item = await client.get({
			TableName: tableName,
			Key: { pk: 'BUSINESS_ACTIVITY', sk: id },
		});

		if (!item.Item) return;

		return fromDatabaseDto(item.Item as IBussinesActivityDto);
	} catch (error) {}
}

/**
 * Save a bussines activity
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param bussinesActivity - The bussines activity
 */
async function save(
	client: IDynamoDBClientAdapter,
	tableName: string,
	bussinesActivity: IBussinesActivity
): Promise<void> {
	try {
		const dto = toDatabaseDto(bussinesActivity);
		const now = new Date().toISOString();

		const { ...data } = {
			pk: 'BUSINESS_ACTIVITY',
			sk: bussinesActivity.id,
			...dto,
			createdAt: now,
			updatedAt: now,
		};

		await client.save({
			TableName: tableName,
			Item: data,
		});
	} catch (error) {}
}

/**
 * Update a bussines activity
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param bussinesActivity - The bussines activity
 */
async function update(
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	bussinesActivity: IBussinesActivity
): Promise<void> {
	try {
		const dto = toDatabaseDto(bussinesActivity);
		const now = new Date().toISOString();

		await client.update({
			TableName: tableName,
			Key: {
				pk: 'BUSINESS_ACTIVITY',
				sk: id,
			},
			UpdateExpression: 'set #name = :name, #skus = :skus, #updatedAt = :updatedAt',
			ExpressionAttributeNames: {
				'#name': 'name',
				'#skus': 'skus',
				'#updatedAt': 'updatedAt',
			},
			ExpressionAttributeValues: {
				':name': dto.name,
				':skus': dto.skus,
				':updatedAt': now,
			},
		});
	} catch (error) {}
}
/**
 * Creates a new bussines activity repository
 * @param config - The bussines activity repository config
 * @returns The bussines activity repository
 */
const create = (config: IBussinesActivityRepositoryConfig): IBussinesActivityRepository => {
	const { client, tableName } = config;

	return {
		findById: (id: string) => findById(client, tableName, id),
		save: (bussinesActivity: IBussinesActivity) => save(client, tableName, bussinesActivity),
		update: (id: string, bussinesActivity: IBussinesActivity) => update(client, tableName, id, bussinesActivity),
	};
};

/**
 * Bussines activity repository
 */
export const BussinesActivityRepository = {
	create,
} as const;

export default BussinesActivityRepository;
