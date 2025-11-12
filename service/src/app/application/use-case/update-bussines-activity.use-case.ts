import { ExternalServiceError, DomainError } from '@domain/errors';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import { BussinesActivity } from '@domain/entities/bussines-activity.entity';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';

const UpdateBussinesActivityUseCase = (repository: IBussinesActivityRepository) => {
	return {
		execute: async (id: string, name: string, skus: number): Promise<void> => {
			try {
				DomainValidatorUtils.validateRequiredString('id', id);
				DomainValidatorUtils.validateRequiredString('name', name);
				DomainValidatorUtils.validatePositiveNumber('skus', skus);

				let instance = await repository.findById(id);

				if (!instance) {
					instance = BussinesActivity.create(id, name, skus);
					await repository.save(instance);
				} else {
					instance = BussinesActivity.create(id, name, skus);
					await repository.update(id, instance);
				}
			} catch (error: any) {
				if (error instanceof DomainError) throw error;
				throw ExternalServiceError('Failed to update bussines activity', error);
			}
		},
	};
};

export default UpdateBussinesActivityUseCase;
