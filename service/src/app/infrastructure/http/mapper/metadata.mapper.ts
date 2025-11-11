import Ecommerce, { IEcommerce } from '@domain/entities/ecommerce.entity';
import EcommerceProduct, { IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';
import EcommerceJurisdiction, { IEcommerceJurisdiction } from '@domain/entities/ecommerce-jurisdiction.entity';
import { B2SProduct, B2SEcommerce, B2SJurisdiction } from '../dto/metadata.dto';


/**
 * Map the data from a B2S Ecommerce to the Ecommerce entity
 * @param ecommerce - The data from a B2S Ecommerce
 * @returns The Ecommerce entity
 */
function mapToEcommerce(ecommerce: B2SEcommerce): IEcommerce {
	return Ecommerce.create(
		ecommerce.website_id,
		ecommerce.commercial_activity_id,
		ecommerce.jurisdiction_id,
		ecommerce.promo_name,
		ecommerce.promo_percent
	);
}

/**
 * Map the data from a catalog item to the CatalogItemMetadata interface
 * @param product - The data from a catalog item
 * @returns The metadata for the catalog item
 */
function mapToProduct(product: B2SProduct): IEcommerceProduct {
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

/**
 * Map the data from a jurisdiction to the JurisdictionMetadata interface
 * @param tax - The data from a jurisdiction
 * @returns The metadata for the jurisdiction
 */
function mapToJurisdiction(tax: B2SJurisdiction): IEcommerceJurisdiction {
	return EcommerceJurisdiction.create(tax.tax_id, tax.jurisdiction_id, parseFloat(tax.amount), tax.customer_country);
}

export const MetadataMapper = {
	mapToEcommerce,
	mapToProduct,
	mapToJurisdiction,
} as const;

export default MetadataMapper;
