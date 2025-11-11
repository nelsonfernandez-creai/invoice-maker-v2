import { AxiosInstance } from 'axios';
import { ExternalServiceError } from '@domain/errors';
import { IMetadataApiPort } from '@domain/ports/services/metadata-api.port';
import { B2SEcommerce, B2SJurisdiction, B2SProduct, B2sApiResponse } from '@infrastructure/http/dto/metadata.dto';
import { IEcommerce } from '@domain/entities/ecommerce.entity';
import { IEcommerceProduct } from '@domain/entities/ecommerce-product.entity';
import { IEcommerceJurisdiction } from '@domain/entities/ecommerce-jurisdiction.entity';
import MetadataMapper from '../mapper/metadata.mapper';

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
function isValidProduct(metadata: B2SProduct): boolean {
	if (metadata.deleted_at != '' || !metadata.status) return false;
	if (metadata.status === Status.DISABLED) return false;
	if (metadata.status === Status.DISABLEDd) return false;

	return true;
}

// ============================================
// Queries
// ============================================

/**
 * Fetch the metadata for a website
 * @param id - The ID of the website
 * @returns The metadata for the website
 */
async function fetchEcommerce(client: AxiosInstance, id: string): Promise<IEcommerce | null> {
	const response = await fetch<{ websites: B2SEcommerce[] }>(client, `?web_ids=${id}`);
	const website = response.body.websites[0];

	if (!website) return null;

	return MetadataMapper.mapToEcommerce(website);
}

/**
 * Fetch the metadata for a catalog item
 * @param id - The ID of the catalog item
 * @returns The metadata for the catalog item
 */
async function fetchProducts(client: AxiosInstance, id: string): Promise<IEcommerceProduct[]> {
	const response = await fetch<{ products: B2SProduct[] }>(client, `?product=${id}`);

	return response.body.products.filter(isValidProduct).map(MetadataMapper.mapToProduct);
}

/**
 * Fetch the metadata for a jurisdiction
 * @param jurisdictionId - The ID of the jurisdiction
 * @returns The metadata for the jurisdiction
 */
async function fetchJurisdiction(client: AxiosInstance, jurisdictionId: string): Promise<IEcommerceJurisdiction[]> {
	const response = await fetch<{ taxes: B2SJurisdiction[] }>(client, `?taxes=${jurisdictionId}`);

	return response.body.taxes.map(MetadataMapper.mapToJurisdiction);
}

// ============================================
// Commands
// ============================================

/**
 * Create the metadata HTTP adapter
 * @param client - The HTTP client
 * @returns The metadata API port
 */
const create = (client: AxiosInstance): IMetadataApiPort => {
	return {
		fetchEcommerce: (id: string): Promise<IEcommerce | null> => fetchEcommerce(client, id),
		fetchProducts: (id: string): Promise<IEcommerceProduct[]> => fetchProducts(client, id),
		fetchJurisdiction: (id: string): Promise<IEcommerceJurisdiction[]> => fetchJurisdiction(client, id),
	};
};

export const MetadataHttpAdapter = {
	create,
} as const;

export default MetadataHttpAdapter;
