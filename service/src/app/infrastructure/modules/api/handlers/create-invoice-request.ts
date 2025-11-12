import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

import MetadataHttpAdapter from '@infrastructure/adapters/services/http/http.adapter';
import DynamoDBClientAdapter from '@infrastructure/adapters/services/database/dynamodb-client.adapter';
import BussinesActivityRepository from '@infrastructure/adapters/repositories/bussines-activity.repository';
import EcommerceConfigRepository from '@infrastructure/adapters/repositories/ecommerce-config.repository';
import CreateInvoiceRequestUseCase from '@application/use-case/create-invoice-request.use-case';

import { HttpResponseBuilder } from '../builders/http-response.builder';
import { HttpRequestMapper } from '../mappers/http-request.mapper';
import { DtoValidator } from '../dtos/validator';
import { CreateInvoicesRequestDtoSchema } from '../dtos/invoice-request.dto';

const dynamoDBClient = DynamoDBClientAdapter.create({ region: process.env.AWS_REGION! });

const bussinesActivityRepository = BussinesActivityRepository.create({
	client: dynamoDBClient,
	tableName: process.env.DYNAMODB_BUSINESS_ACTIVITY_TABLE_NAME!,
});

const ecommerceConfigRepository = EcommerceConfigRepository.create({
	client: dynamoDBClient,
	tableName: process.env.DYNAMODB_CONFIGURATION_TABLE_NAME!,
});

const configRepository = EcommerceConfigRepository.create({
	client: dynamoDBClient,
	tableName: process.env.DYNAMODB_CONFIGURATION_TABLE_NAME!,
});

const metadataApiService = MetadataHttpAdapter.create({
	baseURL: process.env.B2S_API_URL!,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});

const useCase = CreateInvoiceRequestUseCase.create({
	bussinesActivityRepository,
	ecommerceConfigRepository,
	metadataApiService,
	configRepository,
});

/**
 * Handler to create a ecommerce config
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	try {
		const body = HttpRequestMapper.parseBody(event);
		const dtoRequests = DtoValidator.validate(CreateInvoicesRequestDtoSchema, body);

		const requests = dtoRequests.map((dto) => {
			return {
				batchId: dto.batch_id,
				transactionId: dto.transaction_id,
				ecommerceId: dto.website_id,
				amount: dto.invoice_amount,
			};
		});

		await useCase.execute(requests);

		return HttpResponseBuilder.success('Ecommerce config created successfully', 201);
	} catch (error: any) {
		return HttpResponseBuilder.error(error);
	}
};
