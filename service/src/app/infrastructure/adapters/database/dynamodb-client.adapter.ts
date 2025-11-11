import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

interface DynamoDBClientConfig {
	docClient: DynamoDBDocumentClient;
	tableName: string;
}

const create = (config: DynamoDBClientConfig) => {
	return {};
};

export const DynamoDBClientAdapter = {
	create,
};

export default DynamoDBClientAdapter;
