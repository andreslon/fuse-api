import { Injectable, Logger } from '@nestjs/common';
import { ApiProvider } from './api-provider.interface';
import { StockDto } from '../../stocks/dto/stock.dto';

/**
 * Mock implementation of the API provider for demonstration
 */
@Injectable()
export class MockApiProvider implements ApiProvider {
  private readonly logger = new Logger(MockApiProvider.name);
  
  /**
   * Get provider name
   */
  getName(): string {
    return 'MockAPI';
  }
  
  /**
   * Get mock stocks data
   */
  async getStocks(): Promise<StockDto[]> {
    this.logger.log('Fetching stocks from Mock API');
    
    // Simulate API delay
    await this.delay(300);
    
    // Return mock data
    return [
      { symbol: 'AAPL', name: 'Apple Inc', price: 175.50, market: 'NASDAQ', lastUpdated: new Date() },
      { symbol: 'MSFT', name: 'Microsoft Corp', price: 340.25, market: 'NASDAQ', lastUpdated: new Date() },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 131.75, market: 'NASDAQ', lastUpdated: new Date() },
      { symbol: 'AMZN', name: 'Amazon.com Inc', price: 125.30, market: 'NASDAQ', lastUpdated: new Date() },
      { symbol: 'TSLA', name: 'Tesla Inc', price: 255.70, market: 'NASDAQ', lastUpdated: new Date() },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co', price: 145.20, market: 'NYSE', lastUpdated: new Date() },
      { symbol: 'V', name: 'Visa Inc', price: 240.10, market: 'NYSE', lastUpdated: new Date() },
      { symbol: 'WMT', name: 'Walmart Inc', price: 65.85, market: 'NYSE', lastUpdated: new Date() },
    ];
  }
  
  /**
   * Get current price for a stock
   */
  async getStockPrice(symbol: string): Promise<number> {
    this.logger.log(`Fetching price for ${symbol} from Mock API`);
    
    // Simulate API delay
    await this.delay(200);
    
    // Mock price with minor random variation
    const basePrice = this.getBasePriceForSymbol(symbol);
    const variation = (Math.random() - 0.5) * 2; // -1 to 1
    const price = basePrice + variation;
    
    return parseFloat(price.toFixed(2));
  }
  
  /**
   * Get base price for a stock symbol
   */
  private getBasePriceForSymbol(symbol: string): number {
    const prices: Record<string, number> = {
      'AAPL': 175.50,
      'MSFT': 340.25,
      'GOOGL': 131.75,
      'AMZN': 125.30,
      'TSLA': 255.70,
      'JPM': 145.20,
      'V': 240.10,
      'WMT': 65.85,
    };
    
    return prices[symbol] || 100.00; // Default price if symbol not found
  }
  
  /**
   * Helper to simulate network delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 