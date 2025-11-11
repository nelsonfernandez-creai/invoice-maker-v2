import { IInvoiceRequest } from '@domain/entities/invoice-request.entity';

/**
 * Port for the invoice request repository
 */
export interface IInvoiceRequestRepository {
	/**
	 * Find a invoice request by its id
	 * @param id - The id of the invoice request
	 * @returns The invoice request
	 */
	findById(id: string): Promise<IInvoiceRequest | null>;
	/**
	 * Update a invoice request
	 * @param id - The id of the invoice request
	 * @param request - The invoice request
	 * @returns The invoice request
	 */
	update(id: string, request: Partial<IInvoiceRequest>): Promise<void>;
	/**
	 * Save a invoice request
	 * @param request - The invoice request
	 * @returns The invoice request
	 */
	save(request: IInvoiceRequest): Promise<void>;
	/**
	 * Delete all invoice requests
	 */
	deleteAll(): Promise<void>;
}
