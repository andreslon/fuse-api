import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from './transaction-repository.interface';
import { TransactionDto, TransactionType } from '../dto/transaction.dto';
import { Transaction } from '../entities/transaction.entity';

/**
 * Implementation of the transaction repository
 * Uses TypeORM for database operations
 */
@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly logger = new Logger(TransactionRepositoryImpl.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  /**
   * Save a new transaction
   */
  async saveTransaction(transactionDto: TransactionDto): Promise<TransactionDto> {
    try {
      // Generate an ID if not provided
      if (!transactionDto.id) {
        transactionDto.id = this.generateTransactionId();
      }
      
      // Set timestamp if not provided
      if (!transactionDto.timestamp) {
        transactionDto.timestamp = new Date();
      }
      
      // Create entity from DTO
      const transaction = this.transactionRepo.create({
        id: transactionDto.id,
        userId: transactionDto.userId,
        symbol: transactionDto.symbol,
        quantity: transactionDto.quantity,
        price: transactionDto.price,
        totalValue: transactionDto.totalValue,
        type: transactionDto.type,
        confirmationId: `conf_${transactionDto.id}`,
        status: 'SUCCESS',
      });
      
      // Save to database
      const savedTransaction = await this.transactionRepo.save(transaction);
      
      this.logger.log(`Transaction saved: ${savedTransaction.id}`);
      
      // Map back to DTO
      return {
        id: savedTransaction.id,
        userId: savedTransaction.userId,
        symbol: savedTransaction.symbol,
        quantity: Number(savedTransaction.quantity),
        price: Number(savedTransaction.price),
        totalValue: Number(savedTransaction.totalValue),
        type: savedTransaction.type,
        timestamp: savedTransaction.createdAt,
      };
    } catch (error) {
      this.logger.error(`Failed to save transaction: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all transactions for a user
   */
  async getTransactionsByUserId(userId: string): Promise<TransactionDto[]> {
    const transactions = await this.transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    
    return transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      symbol: transaction.symbol,
      quantity: Number(transaction.quantity),
      price: Number(transaction.price),
      totalValue: Number(transaction.totalValue),
      type: transaction.type,
      timestamp: transaction.createdAt,
    }));
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<TransactionDto | null> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });
    
    if (!transaction) {
      return null;
    }
    
    return {
      id: transaction.id,
      userId: transaction.userId,
      symbol: transaction.symbol,
      quantity: Number(transaction.quantity),
      price: Number(transaction.price),
      totalValue: Number(transaction.totalValue),
      type: transaction.type,
      timestamp: transaction.createdAt,
    };
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
} 