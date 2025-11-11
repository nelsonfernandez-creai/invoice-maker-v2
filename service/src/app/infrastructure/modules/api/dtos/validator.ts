import { z } from 'zod';
import { ValidationError } from '@domain/errors';

export class DtoValidator {
	static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
		try {
			return schema.parse(data);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
				throw ValidationError(messages.join(', '));
			}
			throw error;
		}
	}
}
