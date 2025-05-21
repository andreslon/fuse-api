import { Injectable, Logger } from '@nestjs/common';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { VendorService } from '../vendor/vendor.service';
import { StocksService } from '../stocks/stocks.service';
import { PortfolioDto, PortfolioItemDto } from '../portfolio/dto/portfolio.dto';
import { v4 as uuidv4 } from 'uuid';
import { TransactionRepository } from './repository/transaction.repository';
import { PortfolioRepository } from '../portfolio/repository/portfolio.repository';
import { StockNotFoundException } from '../../core/exceptions/domain/stock.exceptions';
import { TransactionFailedException } from '../../core/exceptions/domain/transaction.exceptions';
import { PortfolioUpdateFailedException } from '../../core/exceptions/domain/portfolio.exceptions';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly vendorService: VendorService,
    private readonly stocksService: StocksService,
    private readonly transactionRepository: TransactionRepository,
    private readonly portfolioRepository: PortfolioRepository,
  ) {}

  async buyStock(buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    const { userId, symbol, quantity } = buyStockDto;
    
    try {
      // Check if stock exists
      const stock = await this.stocksService.getStockBySymbol(symbol);
      
      // Execute purchase via vendor API
      await this.vendorService.buyStock(symbol, userId, quantity);
      
      // Create transaction record
      const transaction: TransactionResponseDto = {
        id: uuidv4(),
        userId,
        symbol,
        quantity,
        price: stock.price,
        totalAmount: stock.price * quantity,
        timestamp: new Date(),
        status: 'completed',
      };
      
      // Update user's portfolio
      await this.updatePortfolio(userId, symbol, quantity, stock.price);
      
      // Store transaction
      return this.transactionRepository.save(transaction);
    } catch (error) {
      this.logger.error(`Buy stock failed: ${error.message}`);
      
      if (error instanceof StockNotFoundException || 
          error instanceof TransactionFailedException ||
          error instanceof PortfolioUpdateFailedException) {
        throw error;
      }
      
      throw new TransactionFailedException(symbol, `Failed to execute transaction: ${error.message}`);
    }
  }

  private async updatePortfolio(
    userId: string, 
    symbol: string, 
    quantity: number,
    price: number
  ): Promise<void> {
    try {
      // Get or create portfolio
      let portfolio = await this.portfolioRepository.findOrCreate(userId);
      
      // Find if stock already exists in portfolio
      const existingItem = portfolio.items.find(item => item.symbol === symbol);
      
      if (existingItem) {
        // Update existing position
        const newTotalQuantity = existingItem.quantity + quantity;
        const newTotalCost = (existingItem.quantity * existingItem.purchasePrice) + (quantity * price);
        
        existingItem.quantity = newTotalQuantity;
        existingItem.purchasePrice = newTotalCost / newTotalQuantity; // Weighted average price
        existingItem.currentPrice = price;
        existingItem.totalValue = existingItem.quantity * existingItem.currentPrice;
        existingItem.profit = existingItem.totalValue - (existingItem.quantity * existingItem.purchasePrice);
        existingItem.profitPercentage = ((existingItem.currentPrice - existingItem.purchasePrice) / existingItem.purchasePrice) * 100;
      } else {
        // Add new position
        const newItem: PortfolioItemDto = {
          symbol,
          quantity,
          purchasePrice: price,
          currentPrice: price,
          totalValue: quantity * price,
          profit: 0,
          profitPercentage: 0,
        };
        
        portfolio.items.push(newItem);
      }
      
      // Recalculate portfolio totals
      this.recalculatePortfolioTotals(portfolio);
      
      // Save updated portfolio
      await this.portfolioRepository.save(portfolio);
    } catch (error) {
      this.logger.error(`Failed to update portfolio: ${error.message}`);
      throw new PortfolioUpdateFailedException(`Failed to update portfolio after transaction: ${error.message}`);
    }
  }

  private recalculatePortfolioTotals(portfolio: PortfolioDto): void {
    let totalValue = 0;
    let totalCost = 0;
    
    for (const item of portfolio.items) {
      totalValue += item.totalValue;
      totalCost += item.quantity * item.purchasePrice;
    }
    
    portfolio.totalValue = totalValue;
    portfolio.totalProfit = totalValue - totalCost;
    portfolio.totalProfitPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  }
} 