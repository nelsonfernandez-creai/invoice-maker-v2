import { IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';

/**
 * Metadata API port
 */
export interface IMetadataApiPort {
	/**
	 * Fetch the catalog for a given id
	 * @param id - The id of the catalog
	 * @returns The catalog
	 */
	fetchEcommerceProducts(id: string): Promise<IEcommerceProduct[]>;
}
