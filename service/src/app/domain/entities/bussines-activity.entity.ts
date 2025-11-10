import { DomainValidatorUtils } from '@domain/utils/validator-domain.util';

/**
 * Bussines activity entity
 */
export interface IBussinesActivity {
	id: string;
	name: string;
	skus: number;
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

function validate(bussinesActivity: IBussinesActivity): void {
	DomainValidatorUtils.validateRequiredString('id', bussinesActivity.id);
	DomainValidatorUtils.validateRequiredString('name', bussinesActivity.name);
	DomainValidatorUtils.validatePositiveNumber('skus', bussinesActivity.skus);
}

function create(id: string, name: string, skus: number): IBussinesActivity {
	const item = { id, name, skus };
	validate(item);

	return item;
}

// ============================================
// Exports
// ============================================

export const BussinesActivity = {
	create,
	validate,
} as const;

export default BussinesActivity;
