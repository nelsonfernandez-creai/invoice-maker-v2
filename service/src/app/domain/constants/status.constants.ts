/**
 * Status error
 */
export enum StatusError {
	ERROR_CREATION = 'error_creation',
	ERROR_PROCESSING = 'error_processing',
	ERROR_SENDING = 'error_sending',
}

/**
 * Processing status
 */
export enum ProcessingStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	READY_TO_SEND = 'ready_to_send',
	COMPLETED = 'completed',
	FAILED = 'failed',
}
