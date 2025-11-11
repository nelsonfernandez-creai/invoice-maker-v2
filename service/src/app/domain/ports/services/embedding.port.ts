/**
 * Result of embedding generation
 */
export interface IEmbeddingResult {
	vector: number[];
}

/**
 * Port for embedding/vectorization services
 * Defines the contract for converting text into numeric vectors
 */
export interface IEmbeddingPort {
	/**
	 * Generates an embedding (vector) from text
	 * @param text - The text to vectorize
	 * @returns Result with the vector and its metadata
	 */
	generateEmbedding(text: string): Promise<IEmbeddingResult>;

	/**
	 * Generates embeddings for multiple texts
	 * @param texts - Array of texts to vectorize
	 * @returns Array of results with vectors
	 */
	generateEmbeddings(texts: string[]): Promise<IEmbeddingResult[]>;
}
