import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';
import { JwtValidatorService } from '../services/jwt-validator.service';
import { PolicyBuilder } from '../builders/policy-builder';

const jwksUri = process.env.COGNITO_IDP_URL!;
const jwtValidator = new JwtValidatorService(jwksUri);

const extractToken = (event: APIGatewayRequestAuthorizerEventV2): string | null => {
	const authHeader = event?.headers?.authorization ?? event?.headers?.Authorization;
	return authHeader?.replace('Bearer ', '') ?? null;
};


export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayAuthorizerResult> => {
	try {
		if (!jwksUri) {
			return PolicyBuilder.deny(event.routeArn, 'Missing JWKS URI configuration');
		}

		const token = extractToken(event);
		if (!token) {
			return PolicyBuilder.deny(event.routeArn, 'Missing authorization token');
		}

		const decoded = await jwtValidator.validate(token);

		return PolicyBuilder.allow(decoded.username, event.routeArn, {
			username: decoded.username,
		});
	} catch (error: any) {
		const message = `Internal authorization error: ${error?.message ?? 'Unknown error'}`;

		return PolicyBuilder.deny(event.routeArn, message);
	}
};