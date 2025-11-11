import { z } from 'zod';

export const LoginDtoSchema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(50, 'Username must be at most 50 characters')
		.trim(),
	password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
}).strict();

export type LoginDto = z.infer<typeof LoginDtoSchema>;
