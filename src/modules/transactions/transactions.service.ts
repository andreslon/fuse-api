import { Injectable, Logger } from '@nestjs/common';
import { VendorService } from '../vendor/vendor.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { StocksService } from '../stocks/stocks.service';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';
import { TransactionDto, TransactionType } from './dto/transaction.dto';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionFailedException } from '../../core/exceptions/domain/transaction.exceptions';
import { StockNotFoundException } from '../../core/exceptions/domain/stock.exceptions';
import { BaseAppException } from '../../core/exceptions/base-app.exception';

/**
 * Service for handling stock transactions
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly PRICE_TOLERANCE_PERCENTAGE = 2;

  constructor(
    private readonly transactionRepository: TransactionRepositoryImpl,
    private readonly vendorService: VendorService,
    private readonly portfolioService: PortfolioService,
    private readonly stocksService: StocksService,
  ) {}

  /**
   * Execute a stock purchase
   * Includes validation for 2% price tolerance rule
   */
  async buyStock(buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    const { symbol, quantity, userId } = buyStockDto;
    
    try {
      this.logger.log(`Processing buy order: ${quantity} shares of ${symbol} for user ${userId}`);
      
      // 1. Get current stock price
      const currentPrice = await this.stocksService.getStockPrice(symbol);
      this.logger.log(`Current price for ${symbol}: ${currentPrice}`);
      
      // 2. Execute purchase through the vendor API
      const result = await this.vendorService.buyStock(symbol, quantity);
      
      // 3. Get the actual execution price from the result
      const executionPrice = await this.getExecutionPrice(result.id, symbol);
      this.logger.log(`Execution price for ${symbol}: ${executionPrice}`);
      
      // 4. Validate price tolerance (2%)
      this.validatePriceTolerance(currentPrice, executionPrice);
      
      // 5. Update user's portfolio
      await this.portfolioService.addStockToPortfolio(userId, symbol, quantity, executionPrice);
      
      // 6. Create transaction record
      const transaction: TransactionDto = {
        id: result.id,
        userId,
        symbol,
        quantity,
        price: executionPrice,
        totalValue: executionPrice * quantity,
        type: TransactionType.BUY,
        timestamp: new Date(),
      };
      
      // 7. Return success response
      return {
        transaction,
        status: 'SUCCESS',
        confirmationId: `conf_${result.id}`,
        totalCost: transaction.totalValue,
      };
    } catch (error) {
      this.logger.error(`Failed to buy stock: ${error.message}`, error.stack);
      
      // Handle different error types
      if (error instanceof BaseAppException) {
        // Create a failed transaction response
        return TransactionResponseDto.createFailedResponse(
          userId,
          symbol,
          quantity,
          error.message
        );
      }
      
      // Handle other errors
      throw new BaseAppException(
        `Failed to process transaction: ${error.message}`,
        'TRANSACTION_FAILED',
      );
    }
  }
  
  /**
   * Get the execution price from a transaction ID
   * In a real system, this would fetch the actual execution price from the order details
   */
  private async getExecutionPrice(transactionId: string, symbol: string): Promise<number> {
    // In a real implementation, we'd get this from the transaction details
    // For this implementation, we'll use the current market price
    return this.stocksService.getStockPrice(symbol);
  }
  
  /**
   * Validate that the execution price is within tolerance of the quoted price
   * Throws an exception if the price difference exceeds the tolerance threshold
   */
  private validatePriceTolerance(quotedPrice: number, executionPrice: number): void {
    const priceDifference = Math.abs(quotedPrice - executionPrice);
    const percentDifference = (priceDifference / quotedPrice) * 100;
    
    this.logger.log(`Price difference: ${percentDifference.toFixed(2)}% (tolerance: ${this.PRICE_TOLERANCE_PERCENTAGE}%)`);
    
    if (percentDifference > this.PRICE_TOLERANCE_PERCENTAGE) {
      throw new BaseAppException(
        `Execution price exceeds ${this.PRICE_TOLERANCE_PERCENTAGE}% tolerance threshold`,
        'PRICE_TOLERANCE_EXCEEDED',
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