import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpRequestMapper } from '../mappers/http-request.mapper';
import { HttpResponseBuilder } from '../builders/http-response.builder';
import { DtoValidator } from '../dtos/validator';
import { CreateBussinesActivityDtoSchema } from '../dtos/bussines-activity.dto';

// Dependencies
import UpdateBussinesActivityUseCase from '@application/use-case/update-bussines-activity.use-case';
import { BussinesActivityRepository } from '@infrastructure/adapters/repositories/bussines-activity.repository';
import { DynamoDBClientAdapter } from '@infrastructure/adapters/services/database/dynamodb-client.adapter';

const useCase = UpdateBussinesActivityUseCase.create(
	BussinesActivityRepository.create({
		client: DynamoDBClientAdapter.create({ region: process.env.AWS_REGION! }),
		tableName: process.env.DYNAMODB_BUSINESS_ACTIVITY_TABLE_NAME!,
	})
);

/**
 * Handler to update a bussines activity
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	const body = HttpRequestMapper.parseBody(event);
	const { id, name, skus } = DtoValidator.validate(CreateBussinesActivityDtoSchema, body);

	try {
		await useCase.execute(id, name, skus);
		return HttpResponseBuilder.success('Bussines activity created successfully', 201);
	} catch (error: any) {
		return HttpResponseBuilder.error(error);
	}
};
