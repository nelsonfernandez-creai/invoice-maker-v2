import { IBussinesActivity } from '@domain/entities/bussines-activity.entity';

/**
 * Port for the bussines activity repository
 */
export interface IBussinesActivityRepository {
	/**
	 * Find a bussines activity by its id
	 * @param id - The id of the bussines activity
	 * @returns The bussines activity
	 */
	findById(id: string): Promise<IBussinesActivity | undefined>;
	/**
	 * Save a bussines activity
	 * @param bussinesActivity - The bussines activity
	 * @returns void
	 */
	save(bussinesActivity: IBussinesActivity): Promise<void>;
	/**
	 * Update a bussines activity
	 * @param id - The id of the bussines activity
	 * @param bussinesActivity - The bussines activity
	 * @returns void
	 */
	update(id: string, bussinesActivity: IBussinesActivity): Promise<void>;
}
