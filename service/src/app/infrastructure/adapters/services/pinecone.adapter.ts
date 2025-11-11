import { Pinecone } from '@pinecone-database/pinecone';
import { IVectorStorePort, IVectorDocument } from '@domain/ports/services/vector-store.port';
import { ExternalServiceError } from '@domain/errors';

// ============================================
// Constants and interfaces
// ============================================

/**
 * Batch size for fetching documents
 */
const FETCH_BATCH_SIZE: number = 1000;
/**
 * Batch size for saving documents
 */
const UPSERT_BATCH_SIZE: number = 100;

/**
 * Pinecone config
 */
interface PineconeConfig {
	apiKey: string;
	indexName: string;
	namespace: string;
}

// ============================================
// Queries
// ============================================

/**
 * Finds documents by their IDs
 * @param pinecone - The Pinecone client
 * @param config - The Pinecone config
 * @param ids - The IDs of the documents to find
 * @returns The documents that were found
 */
async function findByIds(pinecone: Pinecone, config: PineconeConfig, ids: string[]): Promise<IVectorDocument[]> {
	if (!ids || ids.length === 0) return [];

	try {
		const index = pinecone.index(config.indexName);
		const results: IVectorDocument[] = [];

		for (let i = 0; i < ids.length; i += FETCH_BATCH_SIZE) {
			const batch = ids.slice(i, i + FETCH_BATCH_SIZE);
			const response = await index.namespace(config.namespace).fetch(batch);

			if (response.records) {
				for (const [id, record] of Object.entries(response.records)) {
					if (record.values) {
						results.push({ id, vector: record.values });
					}
				}
			}
		}

		return results;
	} catch (error: any) {
		throw ExternalServiceError('Pinecone fetch', error);
	}
}

/**
 * Saves documents to the Pinecone index
 * @param pinecone - The Pinecone client
 * @param config - The Pinecone config
 * @param documents - The documents to save
 * @returns The documents that were saved
 */
async function save(pinecone: Pinecone, config: PineconeConfig, documents: IVectorDocument[]): Promise<void> {
	if (!documents || documents.length === 0) return;

	try {
		const index = pinecone.index(config.indexName);
		const vectors = documents.map((doc) => ({ id: doc.id, values: doc.vector }));

		for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
			const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);
			await index.namespace(config.namespace).upsert(batch);
		}
	} catch (error: any) {
		throw ExternalServiceError('Pinecone upsert', error);
	}
}

/**
 * Deletes documents by their IDs
 * @param pinecone - The Pinecone client
 * @param config - The Pinecone config
 * @param ids - The IDs of the documents to delete
 * @returns The documents that were deleted
 */
async function deleteIds(pinecone: Pinecone, config: PineconeConfig, ids: string[]): Promise<void> {
	if (!ids || ids.length === 0) return;

	try {
		const index = pinecone.index(config.indexName);
		await index.namespace(config.namespace).deleteMany(ids);
	} catch (error: any) {
		throw ExternalServiceError('Pinecone delete', error);
	}
}

// ============================================
// Commands
// ============================================

const create = (config: PineconeConfig): IVectorStorePort => {
	const pinecone = new Pinecone({ apiKey: config.apiKey });

	return {
		findByIds: (ids: string[]) => findByIds(pinecone, config, ids),
		save: (documents: IVectorDocument[]) => save(pinecone, config, documents),
		deleteIds: (ids: string[]) => deleteIds(pinecone, config, ids),
	};
};

export const PineconeAdapter = {
	create,
} as const;

export default PineconeAdapter;
