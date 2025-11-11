import { DomainValidatorUtils } from '@domain/utils/validator-domain.util';

/**
 * Reference to an item in the ecommerce config
 */
export interface IReference {
	vectorId: string;
	hash: string;
}

/**
 * References to items in the ecommerce config
 */
interface IReferences extends Map<string, IReference> {}

/**
 * Ecommerce config entity
 */
export interface IEcommerceConfig {
	readonly id: string;
	readonly references: IReferences;
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

/**
 * Validate the ecommerce config
 * @param config - The ecommerce config to validate
 */
function validate(config: IEcommerceConfig): void {
	DomainValidatorUtils.validateRequiredString('ID', config.id);
	DomainValidatorUtils.validateNotNull('references', config.references);
	DomainValidatorUtils.validateNotEmpty('references', config.references.entries());
}

/**
 * Create a new ecommerce config
 * @param id - The id of the ecommerce config
 * @param references - The references to the items in the ecommerce config
 * @returns The new ecommerce config
 */
function create(id: string, references: IReferences): IEcommerceConfig {
	const config = { id, references };
	validate(config);

	return config;
}

// ============================================
// Queries (Lectura - Retornan valor)
// ============================================

/**
 * Add a reference to an item in the ecommerce config
 * @param itemId - The id of the item
 * @param embeddingId - The id of the embedding
 * @param hash - The hash of the item
 */
function addReference(config: IEcommerceConfig, itemId: string, vectorId: string, hash: string): void {
	config.references.set(itemId, { vectorId, hash });
}

/**
 * Remove a reference from the ecommerce config
 * @param itemId - The id of the item
 * @returns True if the reference was removed, false otherwise
 */
function removeReference(config: IEcommerceConfig, itemId: string): boolean {
	return config.references.delete(itemId);
}

/**
 * Check if the ecommerce config has a reference to an item
 * @param itemId - The id of the item
 * @returns True if the ecommerce config has a reference to the item, false otherwise
 */
function hasReference(config: IEcommerceConfig, itemId: string): boolean {
	return config.references.has(itemId);
}

/**
 * Get a reference from the ecommerce config
 * @param itemId - The id of the item
 * @returns The reference to the item
 */
function getReference(config: IEcommerceConfig, itemId: string): IReference | undefined {
	return config.references.get(itemId);
}

// ============================================
// Exports
// ============================================

export const EcommerceConfig = {
	create,
	validate,
	addReference,
	removeReference,
	hasReference,
	getReference,
} as const;

export default EcommerceConfig;
