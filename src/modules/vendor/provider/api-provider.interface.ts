import { StockDto } from '../../stocks/dto/stock.dto';

/**
 * Interface for stock API providers
 */
export interface ApiProvider {
  /**
   * Get name of the provider for logging
   */
  getName(): string;
  
  /**
   * Get a list of available stocks
   */
  getStocks(): Promise<StockDto[]>;
  
  /**
   * Get the current price for a stock
   * @param symbol Stock symbol
   */
  getStockPrice(symbol: string): Promise<number>;
} 