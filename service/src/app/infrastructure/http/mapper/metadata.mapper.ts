import EcommerceProduct, { IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';
import { B2SProduct } from '../dto/metadata.dto';

/**
 * Map the data from a catalog item to the CatalogItemMetadata interface
 * @param product - The data from a catalog item
 * @returns The metadata for the catalog item
 */
function mapToCatalog(product: B2SProduct): IEcommerceProduct {
	return EcommerceProduct.create(
		product.product_id,
		product.name,
		product.name_es,
		product.short_description,
		product.description,
		product.sku,
		parseFloat(product.unit_price),
		parseFloat(product.weight),
		parseInt(product.time_to_serve)
	);
}


export const MetadataMapper = {
	mapToCatalog,
} as const;

export default MetadataMapper;