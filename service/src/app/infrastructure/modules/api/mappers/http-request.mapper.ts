import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { BadRequestError, MissingPathParameterError } from '@domain/errors';

function parseBody<T>(event: APIGatewayProxyEventV2): T {
	const body = event.body;
	try {
		return JSON.parse(body || '{}') as T;
	} catch (error) {
		throw BadRequestError('Request body is required');
	}
}

function getPathParameter(event: APIGatewayProxyEventV2, param: string): string {
	const value = event.pathParameters?.[param];
	if (!value) {
		throw MissingPathParameterError(`${param} is required`);
	}
	return value;
}

function getQueryParameter(event: APIGatewayProxyEventV2, param: string): string | undefined {
	return event.queryStringParameters?.[param];
}

export const HttpRequestMapper = {
	parseBody,
	getPathParameter,
	getQueryParameter,
} as const;

export default HttpRequestMapper;