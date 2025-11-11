import { ProcessingStatus, StatusError } from '@domain/constants/status.constants';

/**
 * Processing state
 */
export interface IProcessingState {
	status: ProcessingStatus;
	isDelivered: boolean;
	error?: { status: StatusError; message: string };
}

/**
 * Creates a processing state object with the given parameters
 * @param status - The current processing status
 * @param isDelivered - Whether the processing has been delivered (default: false)
 * @param error - Optional error information including status and message
 * @returns A new processing state object
 */
function create(
	status: ProcessingStatus,
	isDelivered: boolean = false,
	error?: { status: StatusError; message: string }
): IProcessingState {
	return {
		status,
		isDelivered,
		error,
	};
}

/**
 * Creates a processing state with PENDING status
 * @returns A processing state marked as pending
 */
function pending(): IProcessingState {
	return create(ProcessingStatus.PENDING);
}

/**
 * Creates a processing state with PROCESSING status
 * @returns A processing state marked as currently processing
 */
function processing(): IProcessingState {
	return create(ProcessingStatus.PROCESSING);
}

/**
 * Creates a processing state with COMPLETED status and marks it as delivered
 * @returns A processing state marked as completed and delivered
 */
function completed(): IProcessingState {
	return create(ProcessingStatus.COMPLETED, true);
}

/**
 * Creates a processing state with FAILED status and error information
 * @param errorStatus - The specific error status type
 * @param message - The error message describing what went wrong
 * @returns A processing state marked as failed with error details
 */
function failed(errorStatus: StatusError, message: string): IProcessingState {
	return create(ProcessingStatus.FAILED, false, { status: errorStatus, message });
}

/**
 * Checks if a processing state can be processed
 * A state can be processed if it's pending and has no errors
 * @param value - The processing state to check
 * @returns True if the state can be processed, false otherwise
 */
function canBeProcessed(value: IProcessingState): boolean {
	return value.status === ProcessingStatus.PENDING && !value.error;
}

/**
 * Checks if a processing state is completed
 * @param value - The processing state to check
 * @returns True if the state is completed, false otherwise
 */
function isCompleted(value: IProcessingState): boolean {
	return value.status === ProcessingStatus.COMPLETED;
}

export const ProcessingState = {
	create,
	pending,
	processing,
	completed,
	failed,
	canBeProcessed,
	isCompleted,
} as const;

export default ProcessingState;
