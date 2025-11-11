import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelCommandInput } from '@aws-sdk/client-bedrock-runtime';
import { ExternalServiceError } from '@domain/errors';
import { IEmbeddingResult, IEmbeddingPort } from '@domain/ports/services/embedding.port';

/**
 * Batch size for parallel processing
 */
const BATCH_SIZE = 10;

/**
 * Configuration for Bedrock
 */
interface IBedrockAdapterConfig {
	client: BedrockRuntimeClient;
	// completionModel?: string;
	embeddingsModel?: string;
}

/**
 * Generate an embedding for a text
 * @param text - The text to generate an embedding for
 * @returns The embedding result
 */
async function generateEmbedding(
	client: BedrockRuntimeClient,
	embeddingsModelId: string,
	text: string
): Promise<IEmbeddingResult> {
	try {
		const input: InvokeModelCommandInput = {
			modelId: embeddingsModelId,
			contentType: 'application/json',
			accept: 'application/json',
			body: JSON.stringify({
				inputText: text.trim(),
				dimensions: 1024,
				normalize: true,
			}),
		};

		const command = new InvokeModelCommand(input);
		const response = await client.send(command);

		if (!response.body) {
			throw new Error('Empty response from Bedrock');
		}

		const responseBody = JSON.parse(new TextDecoder().decode(response.body));
		const embedding = responseBody.embedding;

		return {
			vector: embedding,
		};
	} catch (error: any) {
		if (error instanceof Error && error.message.includes('Empty response')) {
			throw error;
		}
		throw ExternalServiceError('AWS Bedrock Embeddings', error);
	}
}

/**
 * Generate embeddings for multiple texts
 * @param texts - The texts to generate embeddings for
 * @returns The embedding results
 */
async function generateEmbeddings(
	client: BedrockRuntimeClient,
	embeddingsModelId: string,
	texts: string[]
): Promise<IEmbeddingResult[]> {
	if (!texts || texts.length === 0) {
		return [];
	}

	const validTexts = texts.filter((t) => t && t.trim().length > 0);
	if (validTexts.length === 0) {
		return [];
	}

	try {
		const results: IEmbeddingResult[] = [];

		for (let i = 0; i < validTexts.length; i += BATCH_SIZE) {
			const batch = validTexts.slice(i, i + BATCH_SIZE);
			const batchResults = await Promise.all(batch.map((text) => generateEmbedding(client, embeddingsModelId, text)));

			results.push(...batchResults);
		}

		return results;
	} catch (error: any) {
		throw ExternalServiceError('AWS Bedrock Embeddings Batch', error);
	}
}

const create = (config: IBedrockAdapterConfig): IEmbeddingPort => {
	// const completionModelId = config.completionModel || 'us.anthropic.claude-3-7-sonnet-20250219-v1:0';
	const embeddingsModelId = config.embeddingsModel || 'amazon.titan-embed-text-v1';
	const client = config.client;

	return {
		generateEmbedding: (text: string) => generateEmbedding(client, embeddingsModelId, text),
		generateEmbeddings: (texts: string[]) => generateEmbeddings(client, embeddingsModelId, texts),
	};
};

export const BedrockAdapter = {
	create,
} as const;

export default BedrockAdapter;
