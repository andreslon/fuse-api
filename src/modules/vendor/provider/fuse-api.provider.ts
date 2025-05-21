import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { ApiProvider } from './api-provider.interface';
import { StockDto } from '../../stocks/dto/stock.dto';
import axiosRetry from 'axios-retry';
import { BaseAppException } from '../../../core/exceptions/base-app.exception';
import { CacheService } from '../../../core/cache/cache.service';
import * as redis from 'redis';

interface FuseApiStockResponse {
  status: number;
  data: {
    items: Array<{
      symbol: string;
      name: string;
      price: number;
      sector: string;
      change: number;
      lastUpdated: string;
    }>;
    nextToken?: string;
  };
}

@Injectable()
export class FuseApiProvider implements ApiProvider {
  private readonly logger = new Logger(FuseApiProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly requestTimeout = 10000; // 10 seconds
  private readonly maxRetries = 3;
  private readonly cacheTTL: number;
  private readonly redisClient: redis.RedisClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {
    const baseUrl = this.configService.get<string>('VENDOR_API_BASE_URL');
    const apiKey = this.configService.get<string>('VENDOR_API_KEY');
    
    if (!baseUrl || !apiKey) {
      throw new Error('VENDOR_API_BASE_URL and VENDOR_API_KEY must be set in environment variables');
    }
    
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.cacheTTL = this.configService.get<number>('REDIS_CACHE_TTL', 300000); // Default to 5 minutes

    // Create a dedicated Redis client for this provider
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');
    
    this.redisClient = redis.createClient({
      host,
      port,
      password,
      prefix: 'fuse_api:'
    });

    this.redisClient.on('error', (err) => {
      this.logger.error(`Redis Client Error: ${err.message}`, err.stack);
    });

    // Configure axios-retry
    axiosRetry(this.httpService.axiosRef, {
      retries: this.maxRetries,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error: AxiosError): boolean => {
        return !!(
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 ||
          (error.response?.status && error.response?.status >= 500 && error.response?.status < 600)
        );
      },
      onRetry: (retryCount, error) => {
        this.logger.warn(
          `Retrying request (${retryCount}/${this.maxRetries}) due to error: ${error.message}`,
        );
      },
    });
  }

  getName(): string {
    return 'FuseAPI';
  }

  async getStocks(): Promise<StockDto[]> {
    try {
      const redisKey = 'stocks';
      
      // Intento leer desde Redis directamente
      const getFromRedis = () => {
        return new Promise<StockDto[] | null>((resolve) => {
          this.redisClient.get(redisKey, (err, data) => {
            if (err || !data) {
              this.logger.log(`Redis cache miss for key: ${redisKey}`);
              return resolve(null);
            }
            
            try {
              const stocks = JSON.parse(data);
              this.logger.log(`Retrieved ${stocks.length} stocks from Redis cache`);
              return resolve(stocks);
            } catch (e) {
              this.logger.error(`Error parsing Redis data: ${e.message}`);
              return resolve(null);
            }
          });
        });
      };
      
      // Try to get from Redis first
      const cachedStocks = await getFromRedis();
      if (cachedStocks) {
        return cachedStocks;
      }
      
      // Cache miss, get from API
      this.logger.log('Cache miss for stocks, fetching from API');
      const url = `${this.baseUrl}/stocks`;
      
      const response = await this.makeRequest<FuseApiStockResponse>(url);
      
      // Validate the response
      if (!response || !response.data || !response.data.items) {
        this.logger.error('Invalid response structure from Fuse API');
        throw new Error('Invalid response structure from Fuse API');
      }
      
      // Map the response to the expected format
      const stocks: StockDto[] = response.data.items.map(item => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        market: item.sector || 'NASDAQ', // Use sector as market or default to NASDAQ
        lastUpdated: new Date(item.lastUpdated)
      }));
      
      // Cache in Redis directly
      this.redisClient.setex(redisKey, this.cacheTTL / 1000, JSON.stringify(stocks), (err) => {
        if (err) {
          this.logger.error(`Error caching stocks in Redis: ${err.message}`);
        } else {
          this.logger.log(`Cached ${stocks.length} stocks in Redis for ${this.cacheTTL / 1000} seconds`);
        }
      });
      
      // Set a test key too
      this.redisClient.setex('test_key', this.cacheTTL / 1000, JSON.stringify({ timestamp: new Date() }));
      
      return stocks;
    } catch (error) {
      this.logger.error(`Failed to fetch stocks: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStockPrice(symbol: string): Promise<number> {
    try {
      const redisKey = `stock_price_${symbol}`;
      
      // Intentamos leer el precio desde Redis primero
      const getFromRedis = () => {
        return new Promise<number | null>((resolve) => {
          this.redisClient.get(redisKey, (err, data) => {
            if (err || !data) {
              return resolve(null);
            }
            
            try {
              const price = parseFloat(data);
              if (isNaN(price)) {
                return resolve(null);
              }
              this.logger.log(`Retrieved price for ${symbol} from Redis cache: ${price}`);
              return resolve(price);
            } catch (e) {
              return resolve(null);
            }
          });
        });
      };
      
      // Try to get price from Redis
      const cachedPrice = await getFromRedis();
      if (cachedPrice !== null) {
        return cachedPrice;
      }
      
      this.logger.log(`Cache miss for ${symbol} price, fetching from API`);
      const url = `${this.baseUrl}/stocks/${symbol}`;
      
      const response = await this.makeRequest<{ status: number; data: { price: number } }>(url);
      if (!response || !response.data || typeof response.data.price !== 'number') {
        throw new Error(`Invalid price data for symbol ${symbol}`);
      }
      
      const price = response.data.price;
      
      // Cache directly in Redis
      this.redisClient.setex(redisKey, this.cacheTTL / 1000, price.toString(), (err) => {
        if (err) {
          this.logger.error(`Error caching price for ${symbol} in Redis: ${err.message}`);
        } else {
          this.logger.log(`Cached price for ${symbol} in Redis: ${price} for ${this.cacheTTL / 1000} seconds`);
        }
      });
      
      return price;
    } catch (error) {
      this.logger.error(`Failed to get price for ${symbol}: ${error.message}`);
      throw error;
    }
  }

  async buyStock(symbol: string, quantity: number, price: number): Promise<{ id: string; status: string }> {
    const url = `${this.baseUrl}/stocks/${symbol}/buy`;
    
    try {
      const response = await this.makeRequest<{ 
        status: number; 
        message: string;
        data: { 
          order: {
            symbol: string;
            quantity: number;
            price: number;
            total: number;
          }
        } 
      }>(
        url,
        'POST',
        { quantity, price },
      );
      
      if (!response || !response.data || !response.data.order) {
        throw new Error(`Invalid buy response for symbol ${symbol}`);
      }
      
      // Generate a unique ID based on the order details
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        id: orderId,
        status: 'completed'
      };
    } catch (error) {
      this.logger.error(`Failed to buy stock ${symbol}: ${error.message}`);
      throw error;
    }
  }

  private async makeRequest<T>(
    url: string,
    method: string = 'GET',
    data?: any,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      },
    };

    try {
      let request;
      
      if (method === 'GET') {
        request = this.httpService.get<T>(url, config);
      } else if (method === 'POST') {
        request = this.httpService.post<T>(url, data, config);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }

      const response = await firstValueFrom<AxiosResponse<T>>(
        request.pipe(
          timeout(this.requestTimeout),
          catchError((error: AxiosError) => {
            this.handleApiError(error);
            throw error;
          }),
        ),
      );

      // Now response is properly typed
      return response.data;
    } catch (error) {
      this.logger.error(
        `Request to ${url} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private handleApiError(error: AxiosError): never {
    const status = error.response?.status || 500;
    const responseData = error.response?.data as any;

    // Log the error details
    this.logger.error(
      `API error (${status}): ${error.message}`,
      responseData,
    );

    // Create appropriate exception
    if (status === 401 || status === 403) {
      throw new BaseAppException(
        'Authentication or authorization error with vendor API',
        'AUTH_ERROR',
        status,
      );
    } else if (status === 404) {
      throw new BaseAppException('Resource not found in vendor API', 'NOT_FOUND', status);
    } else if (status === 429) {
      throw new BaseAppException('Rate limit exceeded for vendor API', 'RATE_LIMIT', status);
    } else if (status >= 500) {
      throw new BaseAppException(
        'Vendor API server error',
        'SERVER_ERROR',
        status,
      );
    }

    // Default error
    throw new BaseAppException(
      'Unexpected error when calling vendor API',
      'API_ERROR',
      status,
    );
  }
} 