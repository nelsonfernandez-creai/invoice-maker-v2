import { ExternalServiceError, DomainError } from '@domain/errors';
import { IBussinesActivityRepository } from '@domain/ports/repositories/bussiness-activity-repository.port';
import DomainValidatorUtils from '@domain/utils/validator-domain.util';
import { BussinesActivity } from '@domain/entities/bussines-activity.entity';

const CreateBussinesActivityUseCase = (repository: IBussinesActivityRepository) => {
	return {
		execute: async (id: string, name: string, skus: number): Promise<void> => {
			try {
				DomainValidatorUtils.validateRequiredString('id', id);
				DomainValidatorUtils.validateRequiredString('name', name);
				DomainValidatorUtils.validatePositiveNumber('skus', skus);

				return await repository.save(BussinesActivity.create(id, name, skus));
			} catch (error: any) {
				if (error instanceof DomainError) throw error;
				throw ExternalServiceError('Failed to create bussines activity', error);
			}
		},
	};
};

export default CreateBussinesActivityUseCase;
