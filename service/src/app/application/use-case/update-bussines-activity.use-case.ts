import { ExternalServiceError, DomainError } from '@domain/errors';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import { BussinesActivity } from '@domain/entities/bussines-activity.entity';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';

async function execute(repository: IBussinesActivityRepository, id: string, name: string, skus: number): Promise<void> {
	DomainValidatorUtils.validateRequiredString('id', id);
	DomainValidatorUtils.validateRequiredString('name', name);
	DomainValidatorUtils.validatePositiveNumber('skus', skus);

	try {
		let instance = await repository.findById(id);
		
		if(!instance) {
			instance = BussinesActivity.create(id, name, skus);
			await repository.save(instance);
		} else {
			instance = BussinesActivity.create(id, name, skus);
			await repository.update(id, instance);
		}

	} catch (error: any) {
		// Re-throw domain errors as-is
		if (error instanceof DomainError) {
			throw error;
		}
		// Wrap unexpected errors
		throw ExternalServiceError('Authentication failed', error);
	}
}

const create = (repository: IBussinesActivityRepository) => {
	return {
		execute: (id: string, name: string, skus: number) => execute(repository, id, name, skus),
	};
};

export const UpdateBussinesActivityUseCase = {
	create,
} as const;

export default UpdateBussinesActivityUseCase;
