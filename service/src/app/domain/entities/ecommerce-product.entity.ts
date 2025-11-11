import DomainValidatorUtils from "@domain/utils/validator-domain.util";

/**
 * Ecommerce Product entity
 */
export interface IEcommerceProduct {
	readonly id: string;
	readonly name: string;
	readonly nameEs: string;
	readonly shortDescription: string;
	readonly description: string;
	readonly sku: string;
	readonly unitPrice: number;
	readonly weight: number;
	readonly timeToServe: number;
}

// ============================================
// Queries (Lectura)
// ============================================

/**
 * Gets the text to hash for the item
 * @param item - The item to get the text to hash
 * @returns The text to hash
 */
function getTextToHash(item: IEcommerceProduct): string {
	return `${item.name} ${item.nameEs} ${item.shortDescription} ${item.description}`;
}

/**
 * Gets the text to embed for the item
 * @param item - The item to get the text to embed
 * @returns The text to embed
 */
function getTextToEmbed(item: IEcommerceProduct): string {
	return `${item.name} ${item.nameEs} ${item.shortDescription} ${item.description}`;
}

/**
 * Checks if the item is tangible
 * @param item - The item to check if it is tangible
 * @returns True if the item is tangible, false otherwise
 */
function isTangible(item: IEcommerceProduct): boolean {
	return item.timeToServe === 0;
}

/**
 * Filters the items by the maximum price
 * @param items - The items to filter
 * @param maxPrice - The maximum price
 * @returns The items filtered by the maximum price
 */
function filterByMaxPrice(items: IEcommerceProduct[], maxPrice: number): IEcommerceProduct[] {
	return items.filter((item) => item.unitPrice <= maxPrice);
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

/**
 * Validates the ecommerce product
 * @param product - The ecommerce product to validate
 */
function validate(jurisdiction: IEcommerceProduct): void {
	DomainValidatorUtils.validateRequiredString('id', jurisdiction.id);
	DomainValidatorUtils.validateRequiredString('name', jurisdiction.name);
	DomainValidatorUtils.validateRequiredString('nameEs', jurisdiction.nameEs);
	DomainValidatorUtils.validateRequiredString('shortDescription', jurisdiction.shortDescription);
	DomainValidatorUtils.validateRequiredString('description', jurisdiction.description);
	DomainValidatorUtils.validateRequiredString('sku', jurisdiction.sku);
	DomainValidatorUtils.validatePositiveNumber('unitPrice', jurisdiction.unitPrice);
	DomainValidatorUtils.validatePositiveNumber('weight', jurisdiction.weight);
	DomainValidatorUtils.validatePositiveNumber('timeToServe', jurisdiction.timeToServe);
}

function create(
	id: string,
	name: string,
	nameEs: string,
	shortDescription: string,
	description: string,
	sku: string,
	unitPrice: number,
	weight: number,
	timeToServe: number
): IEcommerceProduct {
	const item = { id, name, nameEs, shortDescription, description, sku, unitPrice, weight, timeToServe };
	validate(item);

	return item;
}

// ============================================
// Exports
// ============================================

export const EcommerceProduct = {
	create,
	filterByMaxPrice,
	getTextToHash,
	getTextToEmbed,
	isTangible,
} as const;

export default EcommerceProduct;
