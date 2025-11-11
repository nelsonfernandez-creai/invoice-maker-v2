import { DomainValidatorUtils } from '@domain/utils/validator-domain.util';

/**
 * Bussines activity entity
 */
export interface IBussinesActivity {
	id: string;
	name: string;
	skus: number;
}

/**
 * Bussines activity data transfer object
 */
export interface IBussinesActivityDto {
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

/**
 * Convert a bussines activity to a database data transfer object
 * @param bussinesActivity - The bussines activity
 * @returns The bussines activity database data transfer object
 */
function toDatabaseDto(bussinesActivity: IBussinesActivity): IBussinesActivityDto {
	return {
		id: bussinesActivity.id,
		name: bussinesActivity.name,
		skus: bussinesActivity.skus,
	};
}

/**
 * Convert a database data transfer object to a bussines activity
 * @param bussinesActivityDto - The bussines activity database data transfer object
 * @returns The bussines activity
 */
function fromDatabaseDto(dto: IBussinesActivityDto): IBussinesActivity {
	return create(dto.id, dto.name, dto.skus);
}

// ============================================
// Exports
// ============================================

export const BussinesActivity = {
	create,
	toDatabaseDto,
	fromDatabaseDto,
} as const;

export default BussinesActivity;
