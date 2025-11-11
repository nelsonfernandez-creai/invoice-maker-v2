import { IEcommerce } from '@domain/entities/ecommerce.entity';
import { IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';
import { IEcommerceJurisdiction } from '@domain/entities/ecommerce-jurisdiction.entity';

/**
 * Metadata API port
 */
export interface IMetadataApiPort {
	/**
	 * Fetch the ecommerce for a given ecommerce id
	 * @param ecommerceId - The id of the ecommerce
	 * @returns The ecommerce
	 */
	fetchEcommerce(ecommerceId: string): Promise<IEcommerce | null>;
	/**
	 * Fetch the catalog for a given ecommerceId id
	 * @param ecommerceId - The id of the ecommerce
	 * @returns The catalog
	 */
	fetchProducts(ecommerceId: string): Promise<IEcommerceProduct[]>;
	/**
	 * Fetch the jurisdiction for a given ecommerce id
	 * @param ecommerceId - The id of the ecommerce
	 * @returns The jurisdiction
	 */
	fetchJurisdiction(ecommerceId: string): Promise<IEcommerceJurisdiction[]>;
}
