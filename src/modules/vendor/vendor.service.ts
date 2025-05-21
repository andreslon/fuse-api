import { Injectable, Logger } from '@nestjs/common';
import { StockDto } from '../stocks/dto/stock.dto';
import { ApiProviderFactory } from './provider/api-provider.factory';
import { CircuitBreakerService } from '../../core/resilience/circuit-breaker.service';

/**
 * Service for interacting with external stock APIs
 * Uses the Factory pattern to support multiple API providers
 */
@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);

  constructor(
    private readonly apiProviderFactory: ApiProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  /**
   * Get all available stocks
   */
  async getStocks(): Promise<StockDto[]> {
    return this.circuitBreaker.executeWithBreaker(
      'getStocks',
      async () => {
        const provider = this.apiProviderFactory.getProvider();
        this.logger.log(`Fetching stocks from provider: ${provider.getName()}`);
        return provider.getStocks();
      }
    );
  }

  /**
   * Get current price for a stock
   * @param symbol Stock symbol
   */
  async getStockPrice(symbol: string): Promise<number> {
    return this.circuitBreaker.executeWithBreaker(
      `getStockPrice-${symbol}`,
      async () => {
        const provider = this.apiProviderFactory.getProvider();
        this.logger.log(`Fetching price for ${symbol} from provider: ${provider.getName()}`);
        return provider.getStockPrice(symbol);
      }
    );
  }

  /**
   * Buy a stock
   * @param symbol Stock symbol
   * @param quantity Quantity to buy
   */
  async buyStock(symbol: string, quantity: number): Promise<{ id: string; status: string }> {
    return this.circuitBreaker.executeWithBreaker(
      `buyStock-${symbol}`,
      async () => {
        const provider = this.apiProviderFactory.getProvider();
        this.logger.log(`Buying ${quantity} shares of ${symbol} via provider: ${provider.getName()}`);
        
        // Call the provider's buyStock method
        // This is a type assertion since we know FuseApiProvider has this method
        // but it's not in the interface yet to maintain compatibility
        return (provider as any).buyStock(symbol, quantity);
      }
    );
  }

  /**
   * Get a list of available API providers
   */
  getAvailableProviders(): string[] {
    return this.apiProviderFactory.getProviderNames();
  }

  /**
   * Set the active API provider
   * @param providerName Name of the provider to use
   */
  setActiveProvider(providerName: string): void {
    this.apiProviderFactory.setDefaultProvider(providerName);
    this.logger.log(`Active API provider set to: ${providerName}`);
  }
} 