import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user-repository.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  private readonly logger = new Logger(UserRepositoryImpl.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Find a user by userId
   */
  async findByUserId(userId: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { userId } });
    } catch (error) {
      this.logger.error(`Error finding user by userId: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userId: string, createdFromTransaction: boolean = false): Promise<User> {
    try {
      // Create new user entity
      const user = new User();
      user.userId = userId;
      user.createdFromTransaction = createdFromTransaction;
      user.name = ''; // Empty string instead of null
      user.email = ''; // Empty string instead of null
      
      // Save to database
      const savedUser = await this.userRepo.save(user);
      this.logger.log(`Created new user: ${userId}`);
      
      return savedUser;
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if a user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const count = await this.userRepo.count({ where: { userId } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking if user exists: ${error.message}`, error.stack);
      throw error;
    }
  }
} 