/**
 * Response from the Metadata API
 */
export interface B2sApiResponse<T> {
	status: boolean;
	error?: string;
	body: T;
}

/**
 * Data from a B2S Ecommerce
 */
export interface B2SEcommerce {
	website_id: string;
	commercial_activity_id: string;
	jurisdiction_id: string;
	promo_name: string;
	promo_percent: string;
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

/**
 * Data from a B2S Jurisdiction
 */
export interface B2SJurisdiction{
	tax_id: string;
	jurisdiction_id: string;
	amount: string;
	customer_country: string;
}