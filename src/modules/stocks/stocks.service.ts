import { Injectable, Logger } from '@nestjs/common';
import { VendorService } from '../vendor/vendor.service';
import { CacheService } from '../../core/cache/cache.service';
import { StockDto } from './dto/stock.dto';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);
  private readonly CACHE_KEY = 'stocks';
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    private readonly vendorService: VendorService,
    private readonly cacheService: CacheService,
  ) {}

  async getStocks(): Promise<StockDto[]> {
    // Try to get stocks from cache first
    const cachedStocks = await this.cacheService.get<StockDto[]>(this.CACHE_KEY);
    
    if (cachedStocks) {
      this.logger.log('Returning stocks from cache');
      return cachedStocks;
    }

    // If not in cache, fetch from API
    this.logger.log('Fetching stocks from API');
    const stocks = await this.vendorService.getStocks();
    
    // Cache the results
    await this.cacheService.set(this.CACHE_KEY, stocks, this.CACHE_TTL);
    
    return stocks;
  }
} 