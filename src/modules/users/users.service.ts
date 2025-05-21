import { Injectable, Logger } from '@nestjs/common';
import { UserRepositoryImpl } from './repositories/user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepositoryImpl,
  ) {}

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns User or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findByUserId(userId);
  }

  /**
   * Create a new user
   * @param userId User ID
   * @param createdFromTransaction Whether the user was created from a transaction
   * @returns The created user
   */
  async createUser(userId: string, createdFromTransaction: boolean = false): Promise<User> {
    return this.userRepository.createUser(userId, createdFromTransaction);
  }

  /**
   * Check if a user exists
   * @param userId User ID
   * @returns True if user exists, false otherwise
   */
  async userExists(userId: string): Promise<boolean> {
    return this.userRepository.userExists(userId);
  }

  /**
   * Get or create a user
   * @param userId User ID
   * @returns Existing or newly created user
   */
  async getOrCreateUser(userId: string): Promise<User> {
    const exists = await this.userExists(userId);
    
    if (exists) {
      const user = await this.getUserById(userId);
      if (user === null) {
        // This should not happen, but just in case
        this.logger.warn(`User ${userId} exists but was not found, creating new user`);
        return this.createUser(userId, true);
      }
      return user;
    }
    
    this.logger.log(`User ${userId} does not exist, creating new user`);
    return this.createUser(userId, true);
  }
} 