import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import { IEcommerceConfigRepository } from '@domain/ports/repositories/ecommerce-config.port';
import { IEmbeddingPort } from '@domain/ports/services/embedding.port';
import { IVectorStorePort } from '@domain/ports/services/vector-store.port';
import CreateEcommerceConfigUseCase from './create-ecommerce-config.use-case';

/**
 * Interface for the update ecommerce config use case
 */
interface IUpdateEcommerceConfigUseCase {
	readonly metadataApiService: IMetadataApiPort;
	readonly configRepository: IEcommerceConfigRepository;
	readonly embeddingService: IEmbeddingPort;
	readonly vectorStore: IVectorStorePort;
}

const create = (config: IUpdateEcommerceConfigUseCase) => {
	const useCase = CreateEcommerceConfigUseCase.create(config);

	return {
		execute: (id: string) => useCase.execute(id),
	};
};

export const UpdateEcommerceConfigUseCase = {
	create,
} as const;

export default UpdateEcommerceConfigUseCase;
