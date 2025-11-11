import DomainValidatorUtils from "@domain/utils/validator-domain.util";

/**
 * Ecommerce Jurisdiction entity
 */
export interface IEcommerceJurisdiction {
	readonly taxId: string;
	readonly jurisdictionId: string;
	readonly amount: number;
	readonly customerCountry: string;
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

function validate(jurisdiction: IEcommerceJurisdiction): void {
	DomainValidatorUtils.validateRequiredString('taxId', jurisdiction.taxId);
	DomainValidatorUtils.validateRequiredString('jurisdictionId', jurisdiction.jurisdictionId);
	DomainValidatorUtils.validatePositiveNumber('amount', jurisdiction.amount);
	DomainValidatorUtils.validateRequiredString('customerCountry', jurisdiction.customerCountry);
}

function create(
	taxId: string,
	jurisdictionId: string,
	amount: number,
	customerCountry: string
): IEcommerceJurisdiction {
	const item = { taxId, jurisdictionId, amount, customerCountry };
	validate(item);

	return item;
}


export const EcommerceJurisdiction = {
	create,
} as const;

export default EcommerceJurisdiction;