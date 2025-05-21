import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { VendorService } from '../vendor/vendor.service';
import { StocksService } from '../stocks/stocks.service';
import { CacheService } from '../../core/cache/cache.service';
import { PortfolioDto, PortfolioItemDto } from '../portfolio/dto/portfolio.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  private readonly PORTFOLIO_CACHE_PREFIX = 'portfolio:';
  private readonly TRANSACTIONS_CACHE_PREFIX = 'transactions:';

  constructor(
    private readonly vendorService: VendorService,
    private readonly stocksService: StocksService,
    private readonly cacheService: CacheService,
  ) {}

  async buyStock(buyStockDto: BuyStockDto): Promise<TransactionResponseDto> {
    const { userId, symbol, quantity } = buyStockDto;
    
    // Check if stock exists
    const stocks = await this.stocksService.getStocks();
    const stock = stocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new NotFoundException(`Stock with symbol ${symbol} not found`);
    }
    
    // Execute purchase via vendor API
    const purchaseResponse = await this.vendorService.buyStock(symbol, userId, quantity);
    
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
    
    // Update user's portfolio in cache
    await this.updatePortfolio(userId, symbol, quantity, stock.price);
    
    // Store transaction in cache
    await this.storeTransaction(transaction);
    
    return transaction;
  }

  private async updatePortfolio(
    userId: string, 
    symbol: string, 
    quantity: number,
    price: number
  ): Promise<void> {
    const cacheKey = `${this.PORTFOLIO_CACHE_PREFIX}${userId}`;
    let portfolio = await this.cacheService.get<PortfolioDto>(cacheKey);
    
    if (!portfolio) {
      // Create new portfolio if it doesn't exist
      portfolio = {
        userId,
        totalValue: 0,
        totalProfit: 0,
        totalProfitPercentage: 0,
        items: [],
      };
    }
    
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
    let totalValue = 0;
    let totalCost = 0;
    
    for (const item of portfolio.items) {
      totalValue += item.totalValue;
      totalCost += item.quantity * item.purchasePrice;
    }
    
    portfolio.totalValue = totalValue;
    portfolio.totalProfit = totalValue - totalCost;
    portfolio.totalProfitPercentage = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
    
    // Save updated portfolio to cache
    await this.cacheService.set(cacheKey, portfolio);
  }

  private async storeTransaction(transaction: TransactionResponseDto): Promise<void> {
    const cacheKey = `${this.TRANSACTIONS_CACHE_PREFIX}${transaction.userId}`;
    
    // Get existing transactions or create empty array
    const transactions = await this.cacheService.get<TransactionResponseDto[]>(cacheKey) || [];
    
    // Add new transaction
    transactions.push(transaction);
    
    // Save updated transactions
    await this.cacheService.set(cacheKey, transactions);
  }
} 