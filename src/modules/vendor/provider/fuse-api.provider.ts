import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, timeout } from 'rxjs';
import { ApiProvider } from './api-provider.interface';
import { StockDto } from '../../stocks/dto/stock.dto';
import axiosRetry from 'axios-retry';
import { BaseAppException } from '../../../core/exceptions/base-app.exception';

@Injectable()
export class FuseApiProvider implements ApiProvider {
  private readonly logger = new Logger(FuseApiProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly requestTimeout = 10000; // 10 seconds
  private readonly maxRetries = 3;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const baseUrl = this.configService.get<string>('VENDOR_API_BASE_URL');
    const apiKey = this.configService.get<string>('VENDOR_API_KEY');
    
    if (!baseUrl || !apiKey) {
      throw new Error('VENDOR_API_BASE_URL and VENDOR_API_KEY must be set in environment variables');
    }
    
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

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
    const url = `${this.baseUrl}/stocks`;
    
    const response = await this.makeRequest<{ stocks: StockDto[] }>(url);
    return response.stocks;
  }

  async getStockPrice(symbol: string): Promise<number> {
    // For this implementation, we'll get the stock details which includes price
    const url = `${this.baseUrl}/stocks/${symbol}`;
    
    const response = await this.makeRequest<{ price: number }>(url);
    return response.price;
  }

  async buyStock(symbol: string, quantity: number): Promise<{ id: string; status: string }> {
    const url = `${this.baseUrl}/stocks/${symbol}/buy`;
    
    const response = await this.makeRequest<{ id: string; status: string }>(
      url,
      'POST',
      { quantity },
    );
    
    return response;
  }

  private async makeRequest<T>(
    url: string,
    method: string = 'GET',
    data?: any,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'x-api-key': this.apiKey,
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