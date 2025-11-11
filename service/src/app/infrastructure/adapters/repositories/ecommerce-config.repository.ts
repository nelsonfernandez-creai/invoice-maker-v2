import EcommerceConfig, { IEcommerceConfig, IReference, IReferences } from '@domain/entities/ecommerce-config.entity';
import { IDynamoDBClientAdapter } from '../services/database/dynamodb-client.adapter';
import { IEcommerceConfigRepository } from '@domain/ports/repositories/ecommerce-config.port';

/**
 * The ecommerce config repository config
 */
interface IEcommerceConfigRepositoryConfig {
	client: IDynamoDBClientAdapter;
	tableName: string;
}

/**
 * Ecommerce config data transfer object
 */
export interface IEcommerceConfigDto {
	id: string;
	references: Array<[string, IReference]>;
}

/**
 * Convert a ecommerce config to a database data transfer object
 * @param config - The ecommerce config
 * @returns The ecommerce config database data transfer object
 */
function toDatabaseDto(config: IEcommerceConfig): IEcommerceConfigDto {
	const entries = Array.from(config.references.entries());

	return {
		id: config.id,
		references: entries,
	};
}

/**
 * Convert a database data transfer object to a ecommerce config
 * @param dto - The ecommerce config database data transfer object
 * @returns The ecommerce config
 */
function fromDatabaseDto(dto: IEcommerceConfigDto): IEcommerceConfig {
	const references: IReferences = new Map(dto.references);

	return EcommerceConfig.create(dto.id, references);
}

// ============================================
// Queries
// ============================================

/**
 * Find a ecommerce config by its id
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param id - The id
 * @returns The ecommerce config
 */
async function findById(
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string
): Promise<IEcommerceConfig | undefined> {
	try {
		const item = await client.get({
			TableName: tableName,
			Key: {
				pk: 'ECOMMERCE_CONFIG',
				sk: id,
			},
		});

		if (!item.Item) return;

		return fromDatabaseDto(item.Item as IEcommerceConfigDto);
	} catch (error) {}
}

/**
 * Save a ecommerce config
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param config - The ecommerce config
 */
async function save(client: IDynamoDBClientAdapter, tableName: string, config: IEcommerceConfig): Promise<void> {
	try {
		const dto = toDatabaseDto(config);
		const now = new Date().toISOString();

		const { ...data } = {
			pk: 'ECOMMERCE_CONFIG',
			sk: config.id,
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
 * Update a ecommerce config
 * @param client - The DynamoDB client
 * @param tableName - The table name
 * @param config - The ecommerce config
 */
async function update(
	client: IDynamoDBClientAdapter,
	tableName: string,
	id: string,
	config: IEcommerceConfig
): Promise<void> {
	try {
		const dto = toDatabaseDto(config);
		const now = new Date().toISOString();

		await client.update({
			TableName: tableName,
			Key: {
				pk: 'ECOMMERCE_CONFIG',
				sk: id,
			},
			UpdateExpression: 'set #references = :references, #updatedAt = :updatedAt',
			ExpressionAttributeNames: {
				'#references': 'references',
				'#updatedAt': 'updatedAt',
			},
			ExpressionAttributeValues: {
				':references': dto.references,
				':updatedAt': now,
			},
		});
	} catch (error) {}
}

/**
 * Creates a new ecommerce config repository
 * @param config - The ecommerce config repository config
 * @returns The ecommerce config repository
 */
const create = (config: IEcommerceConfigRepositoryConfig): IEcommerceConfigRepository => {
	const { client, tableName } = config;

	return {
		findById: (id: string) => findById(client, tableName, id),
		save: (config: IEcommerceConfig) => save(client, tableName, config),
		update: (id: string, config: IEcommerceConfig) => update(client, tableName, id, config),
	};
};

/**
 * Ecommerce config repository
 */
export const EcommerceConfigRepository = {
	create,
} as const;

export default EcommerceConfigRepository;
