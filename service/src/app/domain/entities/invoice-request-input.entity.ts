import { DomainValidatorUtils } from '@domain/utils/validator-domain.util';

/**
 * Input for creating an invoice request
 */
export interface IInvoiceRequestInput {
	id: string;
	batchId: string;
	transactionId: string;
	ecommerceId: string;
	amount: number;
	country: string;
	taxRate: number;
	shippingFee: number;
	promotionRate: number;
	commercialActivityName: string;
	sku: number;
}

// ============================================
// Commands 
// ============================================

/**
 * Validate the invoice request input
 * @param input - The invoice request input to validate
 */
function validate(input: IInvoiceRequestInput): void {
	DomainValidatorUtils.validateRequiredString('ID', input.id);
	DomainValidatorUtils.validateRequiredString('Batch ID', input.batchId);
	DomainValidatorUtils.validateRequiredString('Transaction ID', input.transactionId);
	DomainValidatorUtils.validateRequiredString('Ecommerce ID', input.ecommerceId);
	DomainValidatorUtils.validateRequiredString('Country', input.country);
	DomainValidatorUtils.validateRequiredString('Commercial activity name', input.commercialActivityName);

	DomainValidatorUtils.validatePositiveNumber('Amount', input.amount, true);
	DomainValidatorUtils.validatePositiveNumber('SKU', input.sku, true);

	DomainValidatorUtils.validateNonNegativeNumber('Tax rate', input.taxRate);
	DomainValidatorUtils.validateNonNegativeNumber('Shipping fee', input.shippingFee);
	DomainValidatorUtils.validateNonNegativeNumber('Promotion rate', input.promotionRate);
}

/**
 * Create a new invoice request input
 * @param id - The id of the invoice request
 * @param batchId - The batch id of the invoice request
 * @param transactionId - The transaction id of the invoice request
 * @param ecommerceId - The ecommerce id of the invoice request
 * @param amount - The amount of the invoice request
 * @param country - The country of the invoice request
 * @param taxRate - The tax rate of the invoice request
 * @param shippingFee - The shipping fee of the invoice request
 * @param promotionRate - The promotion rate of the invoice request
 * @param commercialActivityName - The commercial activity name of the invoice request
 * @param sku - The sku of the invoice request
 * @returns The invoice request input
 */
function create(
	id: string,
	batchId: string,
	transactionId: string,
	ecommerceId: string,
	amount: number,
	country: string,
	taxRate: number,
	shippingFee: number,
	promotionRate: number,
	commercialActivityName: string,
	sku: number
): IInvoiceRequestInput {
	const input = {
		id,
		batchId,
		transactionId,
		ecommerceId,
		amount,
		country,
		taxRate,
		shippingFee,
		promotionRate,
		commercialActivityName,
		sku,
	};

	validate(input);
	return input;
}

// ============================================
// Exports
// ============================================

export const InvoiceRequestInput = {
	// Commands
	create,
} as const;

export default InvoiceRequestInput;
