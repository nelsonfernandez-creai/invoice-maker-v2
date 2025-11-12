import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import { IEcommerceConfigRepository } from '@domain/ports/repositories/ecommerce-config.port';
import { IEmbeddingPort } from '@domain/ports/services/embedding.port';
import { IVectorStorePort } from '@domain/ports/services/vector-store.port';
import CreateEcommerceConfigUseCase from './create-ecommerce-config.use-case';

/**
 * Interface for the update ecommerce config use case
 */
interface IUseCaseProps {
	readonly metadataApiService: IMetadataApiPort;
	readonly configRepository: IEcommerceConfigRepository;
	readonly embeddingService: IEmbeddingPort;
	readonly vectorStore: IVectorStorePort;
}

// ============================================================================
// USE CASE FACTORY
// ============================================================================

/**
 * Factory function that creates the use case with dependency injection
 * Returns an object with the execute method
 */
function UpdateEcommerceConfigUseCase(config: IUseCaseProps) {
	const useCase = CreateEcommerceConfigUseCase(config, 'Failed to update ecommerce config');

	return {
		execute: (id: string): Promise<void> => useCase.execute(id),
	};
}

export default UpdateEcommerceConfigUseCase;
