import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../../core/cache/cache.service';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(TransactionRepository.name);
  private readonly TRANSACTIONS_CACHE_PREFIX = 'transactions:';

  constructor(private readonly cacheService: CacheService) {}

  async findAllByUserId(userId: string): Promise<TransactionResponseDto[]> {
    const cacheKey = `${this.TRANSACTIONS_CACHE_PREFIX}${userId}`;
    return await this.cacheService.get<TransactionResponseDto[]>(cacheKey) || [];
  }

  async save(transaction: TransactionResponseDto): Promise<TransactionResponseDto> {
    const cacheKey = `${this.TRANSACTIONS_CACHE_PREFIX}${transaction.transaction.userId}`;
    
    // Get existing transactions
    const transactions = await this.findAllByUserId(transaction.transaction.userId);
    
    // Add new transaction
    transactions.push(transaction);
    
    // Save updated transactions
    await this.cacheService.set(cacheKey, transactions);
    
    return transaction;
  }
} 