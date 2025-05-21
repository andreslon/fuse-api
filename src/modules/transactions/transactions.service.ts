import { Injectable, Logger } from '@nestjs/common';
import { VendorService } from '../vendor/vendor.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';
import { TransactionDto, TransactionType } from './dto/transaction.dto';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionFailedException } from '../../core/exceptions/domain/transaction.exceptions';
import { StockNotFoundException } from '../../core/exceptions/domain/stock.exceptions';

/**
 * Service for handling stock transactions
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly transactionRepository: TransactionRepositoryImpl,
    private readonly vendorService: VendorService,
    private readonly portfolioService: PortfolioService,
  ) {}

  /**
   * Buy stock
   * @param buyStockDto Details of the stock purchase
   * @returns Transaction response
   */
  async buyStock(buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    const { userId, symbol, quantity } = buyStockDto;
    
    try {
      this.logger.log(`Processing buy order: ${quantity} shares of ${symbol} for user ${userId}`);
      
      // Get current price from vendor service
      const price = await this.vendorService.getStockPrice(symbol);
      
      // Calculate total value
      const totalValue = price * quantity;
      
      // Create transaction record
      const transaction: TransactionDto = {
        userId,
        symbol,
        quantity,
        price,
        totalValue,
        type: TransactionType.BUY,
        timestamp: new Date(),
      };
      
      // Save the transaction
      const savedTransaction = await this.transactionRepository.saveTransaction(transaction);
      
      // Update user's portfolio
      await this.portfolioService.addStockToPortfolio(userId, symbol, quantity, price);
      
      // Create successful response
      return TransactionResponseDto.createSuccessfulBuyResponse(savedTransaction);
      
    } catch (error) {
      this.logger.error(`Failed to buy stock: ${error.message}`);
      
      // Map specific errors to appropriate domain exceptions
      if (error instanceof StockNotFoundException) {
        throw new TransactionFailedException(
          symbol,
          `Stock not found: ${error.message}`
        );
      }
      
      throw new TransactionFailedException(
        symbol,
        `Transaction failed: ${error.message}`
      );
    }
  }

  /**
   * Get all transactions for a user
   * @param userId User ID
   * @returns Array of transactions
   */
  async getTransactionsByUserId(userId: string): Promise<TransactionDto[]> {
    this.logger.log(`Fetching transactions for user: ${userId}`);
    return this.transactionRepository.getTransactionsByUserId(userId);
  }

  /**
   * Get a transaction by ID
   * @param transactionId Transaction ID
   * @returns Transaction or null if not found
   */
  async getTransactionById(transactionId: string): Promise<TransactionDto | null> {
    return this.transactionRepository.getTransactionById(transactionId);
  }
} 