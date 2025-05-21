import { User } from '../entities/user.entity';

export interface UserRepository {
  /**
   * Find a user by userId
   * @param userId The user ID
   * @returns User or null if not found
   */
  findByUserId(userId: string): Promise<User | null>;

  /**
   * Create a new user
   * @param userId The user ID
   * @param createdFromTransaction Flag indicating if user was created from transaction
   * @returns The created user
   */
  createUser(userId: string, createdFromTransaction?: boolean): Promise<User>;

  /**
   * Check if a user exists
   * @param userId The user ID
   * @returns True if user exists, false otherwise
   */
  userExists(userId: string): Promise<boolean>;
} 