import DomainValidatorUtils from '@domain/utils/validator-domain.util';

/**
 * Ecommerce entity
 */
export interface IEcommerce {
	readonly id: string;
	readonly commercialActivityId: string;
	readonly jurisdictionId: string;
	readonly promotionName: string;
	readonly promotionPercentage: string;
}


// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

function validate(jurisdiction: IEcommerce): void {
	DomainValidatorUtils.validateRequiredString('id', jurisdiction.id);
	DomainValidatorUtils.validateRequiredString('commercialActivityId', jurisdiction.commercialActivityId);
	DomainValidatorUtils.validateRequiredString('jurisdictionId', jurisdiction.jurisdictionId);
	DomainValidatorUtils.validateRequiredString('promotionName', jurisdiction.promotionName);
	DomainValidatorUtils.validateRequiredString('promotionPercent', jurisdiction.promotionPercentage);
}

function create(
	id: string,
	commercialActivityId: string,
	jurisdictionId: string,
	promotionName: string,
	promotionPercentage: string
): IEcommerce {
	const item = { id, commercialActivityId, jurisdictionId, promotionName, promotionPercentage };
	validate(item);

	return item;
}

// ============================================
// Exports
// ============================================

export const Ecommerce = {
	create,
} as const;

export default Ecommerce;
