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
import EcommerceConfig, { IEcommerceConfig, IReference } from '@domain/entities/ecommerce-config.entity';
import EcommerceProduct from '@domain/entities/ecommerce-product.entity';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface IUseCaseProps {
	readonly metadataApiService: IMetadataApiPort;
	readonly configRepository: IEcommerceConfigRepository;
	readonly embeddingService: IEmbeddingPort;
	readonly vectorStore: IVectorStorePort;
}

interface CatalogEntry {
	readonly vectorId: string;
	readonly content: string;
	readonly hash: string;
}

interface EmbeddingItem {
	readonly id: string;
	readonly content: string;
}

interface CatalogChanges {
	readonly newItems: ReadonlyArray<EmbeddingItem>;
	readonly deletedIds: ReadonlyArray<string>;
	readonly updatedReferences: ReadonlyMap<string, IReference>;
}

interface FetchedData {
	readonly ecommerce: any;
	readonly catalog: ReadonlyArray<any>;
	readonly configuration: IEcommerceConfig | undefined;
}

// ============================================================================
// PURE FUNCTIONS - DATA TRANSFORMATION
// ============================================================================

/**
 * Extracts content and hash from a product item
 * Pure function: same input always produces same output
 */
const extractItemMetadata = (item: any): Omit<CatalogEntry, 'vectorId'> => ({
	content: EcommerceProduct.getTextToEmbed(item),
	hash: EcommerceProduct.getTextToHash(item),
});

/**
 * Transforms a product item into a catalog entry with a unique vector ID
 * Pure function with side effect of UUID generation (acceptable for this use case)
 */
const createCatalogEntry = (item: any): [string, CatalogEntry] => {
	const metadata = extractItemMetadata(item);
	return [
		item.id,
		{
			vectorId: uuidv4(),
			...metadata,
		},
	];
};

/**
 * Transforms catalog array into a Map of catalog entries
 * Pure function: deterministic transformation
 */
const mapCatalogToEntries = (catalog: ReadonlyArray<any>): ReadonlyMap<string, CatalogEntry> =>
	new Map(catalog.map(createCatalogEntry));

/**
 * Creates an embedding item from a catalog entry
 * Pure function: simple data transformation
 */
const toEmbeddingItem = (entry: CatalogEntry): EmbeddingItem => ({
	id: entry.vectorId,
	content: entry.content,
});

/**
 * Checks if an item needs updating (new or hash changed)
 * Pure function: boolean logic
 */
const needsUpdate = (existingRef: IReference | undefined, newEntry: CatalogEntry): boolean =>
	!existingRef || existingRef.hash !== newEntry.hash;

/**
 * Creates a reference from a catalog entry
 * Pure function: data mapping
 */
const toReference = (entry: CatalogEntry): IReference => ({
	vectorId: entry.vectorId,
	hash: entry.hash,
});

// ============================================================================
// PURE FUNCTIONS - REFERENCE DIFF CALCULATION
// ============================================================================

/**
 * Processes new or updated items in the catalog
 * Pure function: returns transformed data without mutations
 */
const processNewAndUpdatedItems = (
	catalogMap: ReadonlyMap<string, CatalogEntry>,
	existingReferences: ReadonlyMap<string, IReference>
): {
	newItems: ReadonlyArray<EmbeddingItem>;
	deletedFromUpdates: ReadonlyArray<string>;
	updatedRefs: ReadonlyMap<string, IReference>;
} => {
	const newItems: EmbeddingItem[] = [];
	const deletedFromUpdates: string[] = [];
	const updatedRefs = new Map(existingReferences);

	catalogMap.forEach((entry, itemId) => {
		const existingRef = existingReferences.get(itemId);

		if (needsUpdate(existingRef, entry)) {
			// If item exists but hash changed, mark old vector for deletion
			if (existingRef) {
				deletedFromUpdates.push(existingRef.vectorId);
			}

			// Add to new items for embedding generation
			newItems.push(toEmbeddingItem(entry));

			// Update reference
			updatedRefs.set(itemId, toReference(entry));
		}
	});

	return {
		newItems,
		deletedFromUpdates,
		updatedRefs,
	};
};

/**
 * Finds items removed from the catalog
 * Pure function: identifies deletions without mutating input
 */
const findRemovedItems = (
	catalogMap: ReadonlyMap<string, CatalogEntry>,
	references: ReadonlyMap<string, IReference>
): {
	deletedIds: ReadonlyArray<string>;
	cleanedRefs: ReadonlyMap<string, IReference>;
} => {
	const deletedIds: string[] = [];
	const cleanedRefs = new Map(references);

	references.forEach((ref, itemId) => {
		if (!catalogMap.has(itemId)) {
			// Item was removed from catalog
			cleanedRefs.delete(itemId);
			deletedIds.push(ref.vectorId);
		}
	});

	return {
		deletedIds,
		cleanedRefs,
	};
};

/**
 * Categorizes all changes between catalog and existing references
 * Pure function: orchestrates diff calculation
 */
const categorizeChanges = (
	catalogMap: ReadonlyMap<string, CatalogEntry>,
	existingReferences: ReadonlyMap<string, IReference>
): CatalogChanges => {
	// Process updates and new items
	const { newItems, deletedFromUpdates, updatedRefs } = processNewAndUpdatedItems(catalogMap, existingReferences);

	// Process removed items
	const { deletedIds: deletedFromRemovals, cleanedRefs } = findRemovedItems(catalogMap, updatedRefs);

	return {
		newItems,
		deletedIds: [...deletedFromUpdates, ...deletedFromRemovals],
		updatedReferences: cleanedRefs,
	};
};

// ============================================================================
// SIDE EFFECTS - DATA FETCHING
// ============================================================================

/**
 * Fetches all required data in parallel
 * Side effect: makes external API calls
 */
const fetchEcommerceData = async (config: IUseCaseProps, id: string): Promise<FetchedData> => {
	const [ecommerce, catalog, configuration] = await Promise.all([
		config.metadataApiService.fetchEcommerce(id),
		config.metadataApiService.fetchProducts(id),
		config.configRepository.findById(id),
	]);

	return { ecommerce, catalog, configuration };
};

/**
 * Validates that required data was fetched successfully
 * Throws domain errors if validation fails
 */
const validateFetchedData = (data: FetchedData, id: string): void => {
	if (!data.ecommerce) {
		throw EcommerceNotFoundError(`ID: ${id}`);
	}

	if (!data.catalog.length) {
		throw CatalogNotFoundError(`ID: ${id}`);
	}
};

// ============================================================================
// SIDE EFFECTS - EMBEDDING OPERATIONS
// ============================================================================

/**
 * Prepares vector documents from embeddings and items
 * Pure function: transforms data without side effects
 */
const prepareVectorDocuments = (
	items: ReadonlyArray<EmbeddingItem>,
	embeddingResults: ReadonlyArray<{ vector: number[] }>
): IVectorDocument[] =>
	items.map((item, index) => ({
		id: item.id,
		vector: embeddingResults[index].vector,
	}));

/**
 * Validates embedding results match expected count
 * Throws validation error if counts don't match
 */
const validateEmbeddingResults = (items: ReadonlyArray<EmbeddingItem>, embeddingResults: ReadonlyArray<any>): void => {
	if (embeddingResults.length !== items.length) {
		throw ValidateNumberOfEmbeddingsError(
			`Expected ${items.length} embeddings, but received ${embeddingResults.length}`
		);
	}
};

/**
 * Generates embeddings and saves them to vector store
 * Side effect: generates embeddings and persists to database
 */
const generateAndSaveEmbeddings = async (
	embeddingService: IEmbeddingPort,
	vectorStore: IVectorStorePort,
	items: ReadonlyArray<EmbeddingItem>
): Promise<void> => {
	// Extract texts for embedding generation
	const texts = items.map((item) => item.content);
	// Generate embeddings
	const embeddingResults = await embeddingService.generateEmbeddings(texts);
	// Validate results
	validateEmbeddingResults(items, embeddingResults);
	// Prepare documents
	const documents = prepareVectorDocuments(items, embeddingResults);
	// Store in vector database
	await vectorStore.save(documents);
};

// ============================================================================
// ORCHESTRATION - COMPOSING OPERATIONS
// ============================================================================

/**
 * Builds array of operations to execute based on changes
 * Pure function: creates operation array without executing them
 */
const buildOperations = (
	config: IUseCaseProps,
	changes: CatalogChanges,
	ecommerceId: string
): ReadonlyArray<Promise<void>> => {
	const operations: Promise<void>[] = [];

	// Delete old embeddings if any
	if (changes.deletedIds.length > 0) {
		operations.push(config.vectorStore.deleteIds([...changes.deletedIds]));
	}

	// Save new embeddings if any
	if (changes.newItems.length > 0) {
		operations.push(generateAndSaveEmbeddings(config.embeddingService, config.vectorStore, changes.newItems));
	}

	// Update ecommerce config with new references
	const updatedConfig = EcommerceConfig.create(ecommerceId, new Map(changes.updatedReferences));
	operations.push(config.configRepository.save(updatedConfig));

	return operations;
};

/**
 * Executes all operations in parallel
 * Side effect: performs all database operations
 */
const executeOperations = async (operations: ReadonlyArray<Promise<void>>): Promise<void> => {
	await Promise.all(operations);
};

// ============================================================================
// MAIN ORCHESTRATION - COMPOSING THE ENTIRE FLOW
// ============================================================================

/**
 * Main orchestration function that composes the entire workflow
 * Coordinates data fetching, transformation, and persistence
 */
const orchestrateEcommerceConfigCreation = async (config: IUseCaseProps, id: string): Promise<void> => {
	// Validate input
	DomainValidatorUtils.validateRequiredString('ID', id);
	// Fetch data (side effect)
	const fetchedData = await fetchEcommerceData(config, id);
	// Validate fetched data
	validateFetchedData(fetchedData, id);
	// Get or create initial configuration
	const existingConfig = fetchedData.configuration || EcommerceConfig.create(id, new Map<string, IReference>());
	// Transform catalog to entries (pure)
	const catalogMap = mapCatalogToEntries(fetchedData.catalog);
	// Calculate changes (pure)
	const changes = categorizeChanges(catalogMap, existingConfig.references);
	// Build operations (pure)
	const operations = buildOperations(config, changes, id);
	// Execute all operations (side effect)
	await executeOperations(operations);
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Wraps execution with centralized error handling
 * Ensures domain errors are preserved and unexpected errors are wrapped
 */
const wrapWithErrorHandling =
	(fn: (config: IUseCaseProps, id: string) => Promise<void>, errorMessage: string) =>
	async (config: IUseCaseProps, id: string): Promise<void> => {
		try {
			await fn(config, id);
		} catch (error: any) {
			if (error instanceof DomainError) throw error;
			throw ExternalServiceError(errorMessage, error);
		}
	};

// ============================================================================
// USE CASE FACTORY
// ============================================================================

/**
 * Factory function that creates the use case with dependency injection
 * Returns an object with the execute method
 */
function CreateEcommerceConfigUseCase(
	config: IUseCaseProps,
	errorMessage: string = 'Failed to create ecommerce config'
) {
	// Create error-wrapped version of orchestration
	const safeExecute = wrapWithErrorHandling(orchestrateEcommerceConfigCreation, errorMessage);

	return {
		execute: (id: string): Promise<void> => safeExecute(config, id),
	};
}

export default CreateEcommerceConfigUseCase;
