import { ExternalServiceError, DomainError } from '@domain/errors';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import { BussinesActivity } from '@domain/entities/bussines-activity.entity';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';

async function execute(repository: IBussinesActivityRepository, id: string, name: string, skus: number): Promise<void> {
	try {
		let bussinesActivity = await repository.findById(id);

		if (bussinesActivity) {
			DomainValidatorUtils.validateRequiredString('Name', name);
			DomainValidatorUtils.validatePositiveNumber('Skus', skus);

			bussinesActivity.name = name;
			bussinesActivity.skus = skus;
			
			await repository.update(id, bussinesActivity);
			return;
		}

		bussinesActivity = BussinesActivity.create(id, name, skus);
		await repository.save(bussinesActivity);
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
