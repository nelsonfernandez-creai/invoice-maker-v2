/**
 * Transform functions for converting between domain entities and database items
 */
export interface PersistenceTransforms<TDomain, TDatabase = any> {
	/**
	 * Convert a database item to a domain entity
	 * @param item - The database item
	 * @returns The domain entity
	 */
	toDomain: (item: TDatabase) => TDomain;
	/**
	 * Convert a domain entity to a database item
	 * @param entity - The domain entity
	 * @returns The database item
	 */
	toDatabase: (entity: TDomain) => TDatabase;
}

/**
 * Port for Persistence Store Client operations
 * Defines the contract for Persistence Store operations following hexagonal architecture
 */
export interface IPersistenceNoSqlClient<T> {
	/**
	 * Get an item from Persistence Store
	 * @param key - The key of the item
	 * @returns The item or null if not found
	 */
	get: (key: Record<string, any>) => Promise<T | null>;

	/**
	 * Put an item into Persistence Store
	 * @param item - The item to put
	 */
	put: (item: Record<string, any>) => Promise<void>;

	/**
	 * Update an item in Persistence Store
	 * @param key - The key of the item
	 * @param updates - The updates to make
	 */
	update: (key: Record<string, any>, updates: Record<string, any>) => Promise<void>;

	/**
	 * Delete an item from Persistence Store
	 * @param key - The key of the item
	 */
	delete: (key: Record<string, any>) => Promise<void>;

	/**
	 * Query items from Persistence Store
	 * @param keyCondition - The key condition
	 * @param values - The values to query
	 * @returns The items
	 */
	query: (keyCondition: string, values: Record<string, any>) => Promise<T[]>;

	/**
	 * Batch get items from Persistence Store
	 * @param keys - The keys of the items to get
	 * @returns The items
	 */
	batchGet: (keys: Record<string, any>[]) => Promise<T[]>;

	/**
	 * Batch write items into Persistence Store
	 * @param items - The items to write
	 */
	batchWrite: (items: Record<string, any>[]) => Promise<void>;

	/**
	 * Batch delete items from Persistence Store
	 * @param keys - The keys of the items to delete
	 */
	batchDelete: (keys: Record<string, any>[]) => Promise<void>;

	/**
	 * Batch update items in Persistence Store
	 * @param entities - The entities to update
	 */
	batchUpdate: (entities: T[]) => Promise<void>;
}
