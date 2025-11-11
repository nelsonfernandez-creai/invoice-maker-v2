import { IEcommerceConfig } from '@domain/entities/ecommerce-config.entity';

/**
 * Port for the ecommerce config repository
 */
export interface IEcommerceConfigRepository {
	/**
	 * Find a ecommerce config by its id
	 * @param id - The id of the ecommerce config
	 * @returns The ecommerce config
	 */
	findById(id: string): Promise<IEcommerceConfig | null>;
	/**
	 * Save a ecommerce config
	 * @param config - The ecommerce config
	 * @returns The ecommerce config
	 */
	save(config: IEcommerceConfig): Promise<void>;
	/**
	 * Update a ecommerce config
	 * @param id - The id of the ecommerce config
	 * @param config - The ecommerce config
	 * @returns The ecommerce config
	 */
	update(id: string, config: IEcommerceConfig): Promise<void>;
}
