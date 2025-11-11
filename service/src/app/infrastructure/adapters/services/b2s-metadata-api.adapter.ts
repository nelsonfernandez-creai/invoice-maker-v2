import { AxiosInstance } from 'axios';
import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import { EcommerceProduct, IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';
import { ExternalServiceError } from '@domain/errors';

// ============================================
// Constants and interfaces
// ============================================

/**
 * Status of a catalog item
 */
enum Status {
	DISABLED = 'disabled',
	DISABLEDd = 'disabledd',
}

/**
 * Response from the B2S API
 */
interface B2sApiResponse<T> {
	status: boolean;
	error?: string;
	body: T;
}

/**
 * Data from a catalog item endpoint
 */
interface B2sCatalogData {
	product_id: string;
	name: string;
	name_es: string;
	short_description: string;
	description: string;
	sku: string;
	unit_price: string;
	weight: string;
	time_to_serve: string;
	status: string;
	deleted_at: string;
}

// ============================================
// Functions Helpers
// ============================================

/**
 * Fetch the data from the B2S API
 * @param endpoint - The endpoint to fetch the data from
 * @returns The data from the B2S API
 */
async function fetch<T>(client: AxiosInstance, endpoint: string): Promise<B2sApiResponse<T>> {
	try {
		const { data } = await client.get<B2sApiResponse<T>>(endpoint);

		if (!data.status) {
			throw new Error(data.error || 'B2S API returned error status');
		}

		return data;
	} catch (error: any) {
		const message = error?.response?.data?.error || error?.message || 'B2S API request failed';
		throw ExternalServiceError('B2S Metadata API', message);
	}
}

/**
 * Check if a catalog item is valid
 * @param metadata - The metadata for the catalog item
 * @returns True if the catalog item is valid, false otherwise
 */
function isValidProduct(metadata: B2sCatalogData): boolean {
	if (metadata.deleted_at != '' || !metadata.status) return false;
	if (metadata.status === Status.DISABLED) return false;
	if (metadata.status === Status.DISABLEDd) return false;

	return true;
}

// ============================================
// Mappers
// ============================================

/**
 * Map the data from a catalog item to the CatalogItemMetadata interface
 * @param product - The data from a catalog item
 * @returns The metadata for the catalog item
 */
function mapToCatalog(product: B2sCatalogData): IEcommerceProduct {
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

// ============================================
// Queries
// ============================================

/**
 * Fetch the metadata for a catalog item
 * @param id - The ID of the catalog item
 * @returns The metadata for the catalog item
 */
async function fetchCatalog(client: AxiosInstance, id: string): Promise<IEcommerceProduct[]> {
	const response = await fetch<{ products: B2sCatalogData[] }>(client, `?product=${id}`);

	return response.body.products.filter(isValidProduct).map(mapToCatalog);
}

// ============================================
// Commands
// ============================================

const create = (client: AxiosInstance): IMetadataApiPort => {
	return {
		fetchCatalog: (id: string): Promise<IEcommerceProduct[]> => fetchCatalog(client, id),
	};
};

// ============================================
// Exports
// ============================================

export const B2sMetadataApiAdapter = {
	create,
};

export default B2sMetadataApiAdapter;
