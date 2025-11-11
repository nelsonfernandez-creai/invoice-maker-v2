import { z } from 'zod';

export const CreateBussinesActivityDtoSchema = z
	.object({
		id: z.string('Id is required'),
		name: z.string('Name is required'),
		skus: z.number('Skus is required').min(1, 'Skus must be greater than 0'),
	})
	.strict();

export const UpdateBussinesActivityDtoSchema = z
	.object({
		name: z.string('Name is required'),
		skus: z.number('Skus is required'),
	})
	.strict();
