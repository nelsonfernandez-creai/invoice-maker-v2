/**
 * Item for the invoice output
 */
export interface IInvoiceOutputItem {
	catalogItemId: string;
	name: string;
	unitPrice: number;
	quantity: number;
	isTangible: boolean;
	subtotal: number;
}

/**
 * Amounts for the invoice output
 */
export interface IInvoiceOutputAmounts {
	subtotalBeforeTax: number;
	taxAmount: number;
	discountAmount: number;
	shippingFee: number;
	totalAmount: number;
}

/**
 * Metadata for the invoice output
 */
export interface IInvoiceOutputMetadata {
	calculationStrategy: string;
	aiModelUsed: string;
	coherenceScore?: number;
	processingTimeMs?: number;
}

/**
 * Output for the invoice generated
 */
export interface IInvoiceOutput {
	requestId: string;
	selectedCombinationIndex: number;
	selectedItems: IInvoiceOutputItem[];
	amounts: IInvoiceOutputAmounts;
	metadata: IInvoiceOutputMetadata;
	generatedAt: Date;
}
