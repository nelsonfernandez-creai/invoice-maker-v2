/**
 * Response from the Metadata API
 */
export interface B2sApiResponse<T> {
	status: boolean;
	error?: string;
	body: T;
}

/**
 * Data from a B2S Product
 */
export interface B2SProduct {
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