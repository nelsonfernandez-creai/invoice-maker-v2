import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { DomainError } from '@domain/errors';

export class HttpResponseBuilder {
	static success(data: any, statusCode: number = 200): APIGatewayProxyResultV2 {
		return {
			statusCode,
			body: JSON.stringify(data),
		};
	}

	static error(error: DomainError): APIGatewayProxyResultV2 {
		const status = error.code;
		const body = {
			error: error.message || 'Internal server error',
			...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
		};

		if (process.env.NODE_ENV === 'development') console.error('Error response:', body);

		return {
			statusCode: status,
			body: JSON.stringify(body),
		};
	}
}
