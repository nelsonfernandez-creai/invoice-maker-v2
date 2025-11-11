import { APIGatewayAuthorizerResult } from 'aws-lambda';

export class PolicyBuilder {
	static allow(principalId: string, resource: string, context?: Record<string, any>): APIGatewayAuthorizerResult {
		return {
			principalId,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Allow',
						Resource: resource,
					},
				],
			},
			context: context || {},
		};
	}

	static deny(resource: string, message: string): APIGatewayAuthorizerResult {
		return {
			principalId: 'unauthorized',
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Deny',
						Resource: resource,
					},
				],
			},
			context: { message },
		};
	}
}
