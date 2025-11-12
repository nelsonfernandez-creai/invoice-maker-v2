import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import MetadataHttpAdapter from '@infrastructure/adapters/services/http/http.adapter';
import BedrockAdapter from '@infrastructure/adapters/services/bedrock.adapter';
import PineconeAdapter from '@infrastructure/adapters/services/pinecone.adapter';
import DynamoDBClientAdapter from '@infrastructure/adapters/services/database/dynamodb-client.adapter';
import EcommerceConfigRepository from '@infrastructure/adapters/repositories/ecommerce-config.repository';
import CreateEcommerceConfigUseCase from '@application/use-case/create-ecommerce-config.use-case';
import { HttpResponseBuilder } from '../builders/http-response.builder';
import { HttpRequestMapper } from '../mappers/http-request.mapper';

const metadataApiService = MetadataHttpAdapter.create({
	baseURL: process.env.B2S_API_URL!,
	timeout: 10000,
	headers: { 'Content-Type': 'application/json' },
});

const embeddingService = BedrockAdapter.create({
	client: new BedrockRuntimeClient({
		region: process.env.AWS_REGION!,
	}),
	embeddingsModel: process.env.BEDROCK_EMBEDDINGS_MODEL!,
});

const vectorStore = PineconeAdapter.create({
	apiKey: process.env.PINECONE_API_KEY!,
	indexName: process.env.PINECONE_INDEX_NAME!,
	namespace: process.env.PINECONE_NAMESPACE!,
});

const configRepository = EcommerceConfigRepository.create({
	client: DynamoDBClientAdapter.create({ region: process.env.AWS_REGION! }),
	tableName: process.env.DYNAMODB_CONFIGURATION_TABLE_NAME!,
});

const useCase = CreateEcommerceConfigUseCase.create({
	metadataApiService,
	embeddingService,
	vectorStore,
	configRepository,
});

/**
 * Handler to create a ecommerce config
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	try {
		const id = HttpRequestMapper.getPathParameter(event, 'id');

		await useCase.execute(id);

		return HttpResponseBuilder.success('Ecommerce config created successfully', 201);
	} catch (error: any) {
		return HttpResponseBuilder.error(error);
	}
};
