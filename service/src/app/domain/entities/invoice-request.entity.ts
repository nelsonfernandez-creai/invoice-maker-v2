import { IInvoiceOutput } from '@domain/entities/invoice-request-output.entity';
import { IInvoiceRequestInput } from '@domain/entities/invoice-request-input.entity';
import ProcessingState, { IProcessingState } from '@domain/value-object/processing-state.vo';
import { ProcessingStatus, StatusError } from '@domain/constants/status.constants';

/**
 * Invoice request entity
 */
export interface IInvoiceRequest {
	readonly id: string;
	readonly input: IInvoiceRequestInput;
	readonly output?: IInvoiceOutput;
	processingState: IProcessingState;
}

// ============================================
// Queries (Lectura)
// ============================================

/**
 * Get the status of the invoice request
 * @param request - The invoice request
 * @returns The status of the invoice request
 */
function status(request: IInvoiceRequest): ProcessingStatus {
	return request.processingState.status;
}

/**
 * Get the error of the invoice request
 * @param request - The invoice request
 * @returns The error of the invoice request
 */
function error(request: IInvoiceRequest): { status: StatusError; message: string } | undefined {
	return request.processingState.error;
}

/**
 * Check if the invoice request is delivered
 * @param request - The invoice request
 * @returns True if the invoice request is delivered, false otherwise
 */
function isDelivered(request: IInvoiceRequest): boolean {
	return request.processingState.isDelivered;
}

/**
 * Get the output of the invoice request
 * @param request - The invoice request
 * @returns The output of the invoice request
 */
function output(request: IInvoiceRequest): IInvoiceOutput | undefined {
	return request.output;
}

/**
 * Check if the invoice request can be processed
 * @param request - The invoice request
 * @returns True if the invoice request can be processed, false otherwise
 */
function canBeProcessed(request: IInvoiceRequest): boolean {
	return ProcessingState.canBeProcessed(request.processingState);
}

/**
 * Check if the invoice request has output
 * @param request - The invoice request
 * @returns True if the invoice request has output, false otherwise
 */
function hasOutput(request: IInvoiceRequest): boolean {
	return request.output !== undefined;
}

// ============================================
// Commands (Escritura - Retornan nueva instancia)
// ============================================

/**
 * Create a new invoice request
 * @param id - The id of the invoice request
 * @param input - The input of the invoice request
 * @param processingState - The processing state of the invoice request
 * @returns The new invoice request
 */
function create(id: string, input: IInvoiceRequestInput, processingState?: IProcessingState): IInvoiceRequest {
	return {
		id,
		input,
		processingState: processingState || ProcessingState.pending(),
		output: undefined,
	};
}

/**
 * Mark the invoice request as processing
 * @param request - The invoice request
 * @returns The invoice request
 */
function markAsProcessing(request: IInvoiceRequest): IInvoiceRequest {
	request = {
		...request,
		processingState: ProcessingState.processing(),
	};

	return request;
}

/**
 * Mark the invoice request as completed
 * @param request - The invoice request
 * @param output - The output of the invoice request
 * @returns The invoice request
 */
function markAsCompleted(request: IInvoiceRequest, output: IInvoiceOutput): IInvoiceRequest {
	return {
		...request,
		output,
		processingState: ProcessingState.completed(),
	};
}

/**
 * Mark the invoice request as error
 * @param request - The invoice request
 * @param errorStatus - The status of the error
 * @param message - The message of the error
 * @returns The invoice request
 */
function markAsError(request: IInvoiceRequest, errorStatus: StatusError, message: string): IInvoiceRequest {
	return {
		...request,
		processingState: ProcessingState.failed(errorStatus, message),
	};
}

// ============================================
// Exports
// ============================================

export const InvoiceRequest = {
	// Queries
	status,
	error,
	isDelivered,
	output,
	canBeProcessed,
	hasOutput,

	// Commands
	create,
	markAsProcessing,
	markAsCompleted,
	markAsError,
} as const;

export default InvoiceRequest;
