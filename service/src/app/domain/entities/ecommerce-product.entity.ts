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

function getTextToHash(item: IEcommerceProduct): string {
	return `${item.name} ${item.nameEs} ${item.shortDescription} ${item.description}`;
}

function getTextToEmbed(item: IEcommerceProduct): string {
	return `${item.name} ${item.nameEs} ${item.shortDescription} ${item.description}`;
}

function isTangible(item: IEcommerceProduct): boolean {
	return item.timeToServe === 0;
}

function filterByMaxPrice(items: IEcommerceProduct[], maxPrice: number): IEcommerceProduct[] {
	return items.filter((item) => item.unitPrice <= maxPrice);
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

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
	return {
		id,
		name,
		nameEs,
		shortDescription,
		description,
		sku,
		unitPrice,
		weight,
		timeToServe,
	};
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
