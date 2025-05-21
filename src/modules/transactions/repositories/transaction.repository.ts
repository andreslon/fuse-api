import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionRepository } from './transaction-repository.interface';
import { TransactionDto } from '../dto/transaction.dto';
import { CacheService } from '../../../core/cache/cache.service';

/**
 * Implementation of the transaction repository
 * Uses cache for data storage in this demo
 * In a real application, this would use a database
 */
@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly logger = new Logger(TransactionRepositoryImpl.name);
  private readonly TRANSACTIONS_CACHE_KEY = 'transactions';
  private readonly CACHE_TTL = 86400000; // 24 hours

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Save a new transaction
   */
  async saveTransaction(transaction: TransactionDto): Promise<TransactionDto> {
    try {
      // Generate an ID if not provided
      if (!transaction.id) {
        transaction.id = this.generateTransactionId();
      }
      
      // Set timestamp if not provided
      if (!transaction.timestamp) {
        transaction.timestamp = new Date();
      }
      
      // Get existing transactions
      const transactions = await this.getAllTransactions();
      
      // Add new transaction
      transactions.push(transaction);
      
      // Save updated list
      await this.cacheService.set(this.TRANSACTIONS_CACHE_KEY, transactions, this.CACHE_TTL);
      
      this.logger.log(`Transaction saved: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to save transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   */
  async getTransactionsByUserId(userId: string): Promise<TransactionDto[]> {
    const transactions = await this.getAllTransactions();
    return transactions.filter(t => t.userId === userId);
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<TransactionDto | null> {
    const transactions = await this.getAllTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    return transaction || null;
  }

  /**
   * Get all transactions from cache
   */
  private async getAllTransactions(): Promise<TransactionDto[]> {
    const transactions = await this.cacheService.get<TransactionDto[]>(this.TRANSACTIONS_CACHE_KEY);
    return transactions || [];
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
} 