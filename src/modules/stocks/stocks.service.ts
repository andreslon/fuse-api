import { Injectable, Logger } from '@nestjs/common';
import { VendorService } from '../vendor/vendor.service';
import { CacheService } from '../../core/cache/cache.service';
import { StockDto } from './dto/stock.dto';
import { StockNotFoundException, StockServiceUnavailableException } from '../../core/exceptions/domain/stock.exceptions';
import { ListStocksDto } from './dto/list-stocks.dto';
import { PaginationDto, createPaginatedResponse } from '../../shared/pagination/pagination.util';
import { PaginatedResponseInterface } from '../../shared/pagination/paginated-response.interface';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);
  private readonly CACHE_KEY = 'stocks';
  private readonly CACHE_TTL = 300000; // 5 minutes

  constructor(
    private readonly vendorService: VendorService,
    private readonly cacheService: CacheService,
  ) {}

  async getPaginatedStocks(queryParams: ListStocksDto): Promise<PaginatedResponseInterface<StockDto>> {
    try {
      const stocks = await this.getStocks();
      const filteredStocks = this.filterStocks(stocks, queryParams);
      const paginatedStocks = this.paginateStocks(filteredStocks, queryParams);
      
      return createPaginatedResponse(
        paginatedStocks,
        filteredStocks.length,
        queryParams,
      );
    } catch (error) {
      this.logger.error(`Failed to get paginated stocks: ${error.message}`);
      throw new StockServiceUnavailableException();
    }
  }

  async getStocks(): Promise<StockDto[]> {
    try {
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
    } catch (error) {
      this.logger.error(`Failed to fetch stocks: ${error.message}`);
      throw new StockServiceUnavailableException();
    }
  }

  async getStockBySymbol(symbol: string): Promise<StockDto> {
    const stocks = await this.getStocks();
    const stock = stocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new StockNotFoundException(symbol);
    }
    
    return stock;
  }

  /**
   * Get the current price for a stock
   * @param symbol Stock symbol
   * @returns Current price
   */
  async getStockPrice(symbol: string): Promise<number> {
    try {
      // First try to get from cached stocks
      const cachedStock = await this.getStockBySymbol(symbol);
      if (cachedStock) {
        return cachedStock.price;
      }

      // If not in cache or more up-to-date price needed, get from vendor API
      this.logger.log(`Fetching current price for ${symbol} from vendor API`);
      const price = await this.vendorService.getStockPrice(symbol);
      
      return price;
    } catch (error) {
      if (error instanceof StockNotFoundException) {
        throw error;
      }
      
      this.logger.error(`Failed to get price for ${symbol}: ${error.message}`);
      throw new StockServiceUnavailableException();
    }
  }

  private filterStocks(stocks: StockDto[], queryParams: ListStocksDto): StockDto[] {
    let filteredStocks = [...stocks];
    
    // Filter by symbol if provided
    if (queryParams.symbol && typeof queryParams.symbol === 'string') {
      const symbolLower = queryParams.symbol.toLowerCase();
      filteredStocks = filteredStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(symbolLower)
      );
    }
    
    // Filter by market if provided
    if (queryParams.market && typeof queryParams.market === 'string') {
      const marketLower = queryParams.market.toLowerCase();
      filteredStocks = filteredStocks.filter(stock => 
        stock.market.toLowerCase() === marketLower
      );
    }
    
    return filteredStocks;
  }

  private paginateStocks(stocks: StockDto[], queryParams: PaginationDto): StockDto[] {
    const { offset, limit } = queryParams;
    return stocks.slice(offset, offset + limit);
  }
} 