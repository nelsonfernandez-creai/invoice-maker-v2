/**
 * Document with its embedding
 */
export interface IVectorDocument {
	id: string;
	vector: number[];
}

/**
 * Port for vector store services
 * Defines the contract for storing and retrieving vectorized documents
 */
export interface IVectorStorePort {
	/**
	 * Gets embeddings by IDs
	 * @param ids - Array of IDs to retrieve
	 * @returns Array of results with the vectors
	 */
	findByIds(ids: string[]): Promise<IVectorDocument[]>;
	/**
	 * Inserts or updates vectorized documents in the store
	 * @param documents - Array of documents with their embeddings
	 */
	save(documents: IVectorDocument[]): Promise<void>;
	/**
	 * Deletes documents by their IDs
	 * @param ids - Array of IDs to delete
	 */
	deleteIds(ids: string[]): Promise<void>;
}
