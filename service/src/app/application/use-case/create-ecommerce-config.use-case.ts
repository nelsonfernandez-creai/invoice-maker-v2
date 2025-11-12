import { v4 as uuidv4 } from 'uuid';
import {
	ExternalServiceError,
	DomainError,
	EcommerceNotFoundError,
	CatalogNotFoundError,
	ValidateNumberOfEmbeddingsError,
} from '@domain/errors';
import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import { IEcommerceConfigRepository } from '@domain/ports/repositories/ecommerce-config.port';
import { IEmbeddingPort } from '@domain/ports/services/embedding.port';
import { IVectorDocument, IVectorStorePort } from '@domain/ports/services/vector-store.port';
import { DomainValidatorUtils } from '@domain/utils/validator-domain.util';
import EcommerceConfig, { IReference } from '@domain/entities/ecommerce-config.entity';
import EcommerceProduct from '@domain/entities/ecommerce-product.entity';

async function saveEmbeddings(
	embeddingService: IEmbeddingPort,
	vectorStore: IVectorStorePort,
	items: Array<{ id: string; content: string }>
): Promise<void> {
	// Generate embeddings for all documents
	const texts = items.map((doc) => doc.content);
	const embeddingResults = await embeddingService.generateEmbeddings(texts);

	// Validate that we got the same number of embeddings as documents
	if (embeddingResults.length !== items.length) {
		throw ValidateNumberOfEmbeddingsError(
			`Expected ${items.length} embeddings, but received ${embeddingResults.length}`
		);
	}

	const documents: IVectorDocument[] = items.map((doc, index) => ({
		id: doc.id,
		vector: embeddingResults[index].vector,
	}));

	// Store in vector database
	await vectorStore.save(documents);
}

async function execute(config: ICreateEcommerceConfigUseCase, id: string): Promise<void> {
	DomainValidatorUtils.validateRequiredString('ID', id);

	try {
		// Fetch ecommerce metadata, catalog and configuration in parallel
		const [ecommerce, catalog, configuration] = await Promise.all([
			config.metadataApiService.fetchEcommerce(id),
			config.metadataApiService.fetchProducts(id),
			config.configRepository.findById(id),
		]);

		if (!ecommerce) {
			throw EcommerceNotFoundError(`ID: ${id}`);
		}

		if (!catalog.length) {
			throw CatalogNotFoundError(`ID: ${id}`);
		}

		const tempConfig = configuration || EcommerceConfig.create(id, new Map<string, IReference>());

		const entries: Array<[string, { vectorId: string; content: string; hash: string }]> = catalog.map((item) => {
			const content = EcommerceProduct.getTextToEmbed(item);
			const hash = EcommerceProduct.getTextToHash(item);

			return [item.id, { vectorId: uuidv4(), content, hash }];
		});

		const catalogMap = new Map<string, { vectorId: string; content: string; hash: string }>(entries);
		const newItems: Array<{ id: string; content: string }> = [];
		const deletedIds: string[] = [];
		const updatedReferences = new Map<string, IReference>(tempConfig.references);

		for (const [itemId, item] of catalogMap) {
			const existingRef = updatedReferences.get(itemId);

			if (!existingRef || existingRef.hash !== item.hash) {
				if (existingRef) {
					deletedIds.push(existingRef.vectorId);
				}

				// Add to new items for embedding generation
				newItems.push({ id: item.vectorId, content: item.content });
				// Update reference
				updatedReferences.set(itemId, {
					vectorId: item.vectorId,
					hash: item.hash,
				});
			}
		}

		// Find items that were removed from catalog
		for (const [itemId, ref] of updatedReferences) {
			if (!catalogMap.has(itemId)) {
				// Item was removed from catalog
				updatedReferences.delete(itemId);
				deletedIds.push(ref.vectorId);
			}
		}

		// Execute operations in parallel
		const operations: Promise<void>[] = [];

		// Delete old embeddings if any
		if (deletedIds.length > 0) {
			operations.push(config.vectorStore.deleteIds(deletedIds));
		}

		// Save new embeddings if any
		if (newItems.length > 0) {
			operations.push(saveEmbeddings(config.embeddingService, config.vectorStore, newItems));
		}

		// Update ecommerce config with new references
		operations.push(config.configRepository.save(EcommerceConfig.create(id, updatedReferences)));

		await Promise.all(operations);
	} catch (error: any) {
		// Re-throw domain errors as-is
		if (error instanceof DomainError) {
			throw error;
		}
		// Wrap unexpected errors
		throw ExternalServiceError('Authentication failed', error);
	}
}

/**
 * Interface for the create ecommerce config use case
 */
interface ICreateEcommerceConfigUseCase {
	readonly metadataApiService: IMetadataApiPort;
	readonly configRepository: IEcommerceConfigRepository;
	readonly embeddingService: IEmbeddingPort;
	readonly vectorStore: IVectorStorePort;
}

const create = (config: ICreateEcommerceConfigUseCase) => {
	return {
		execute: (id: string) => execute(config, id),
	};
};

export const CreateEcommerceConfigUseCase = {
	create,
} as const;

export default CreateEcommerceConfigUseCase;
