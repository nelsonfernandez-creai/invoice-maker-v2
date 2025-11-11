import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import HttpRequestMapper from '../mappers/http-request.mapper';
import { DtoValidator } from '../dtos/validator';
import { LoginDtoSchema } from '../dtos/login.dto';
import { HttpResponseBuilder } from '../builders/http-response.builder';
import AuthenticateUserUseCase from '@application/use-case/authenticate-user.use-case';
import CognitoAuthAdapter from '@infrastructure/adapters/services/cognito-auth.adapter';

// Dependencias
const useCase = AuthenticateUserUseCase.create(
	CognitoAuthAdapter.create({
		region: process.env.AWS_REGION!,
		clientId: process.env.COGNITO_CLIENT_ID!,
	})
);

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
	try {
		const body = HttpRequestMapper.parseBody(event);
		const loginData = DtoValidator.validate(LoginDtoSchema, body);
		const result = await useCase.execute(loginData.username, loginData.password);

		return HttpResponseBuilder.success(
			{
				access_token: result.accessToken,
				expires_in: result.expiresIn,
			},
			200
		);
	} catch (error: any) {
		console.error('Error in authenticate user handler:', error);
		return HttpResponseBuilder.error(error);
	}
};
