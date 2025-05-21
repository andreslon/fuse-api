import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, concat, firstValueFrom, Observable, of, throwError, timer } from 'rxjs';
import { mergeMap, timeout, retry, delay } from 'rxjs/operators';
import { AxiosError, AxiosResponse } from 'axios';
import { StockServiceUnavailableException } from '../../core/exceptions/domain/stock.exceptions';
import { TransactionFailedException } from '../../core/exceptions/domain/transaction.exceptions';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);
  private readonly baseUrl = 'https://api.challenge.fusefinance.com';
  private readonly timeoutMs = 5000; // 5 seconds
  private readonly maxRetries = 3;
  private readonly initialDelay = 1000; // 1 second

  constructor(private readonly httpService: HttpService) {}

  async getStocks() {
    const url = `${this.baseUrl}/stocks`;
    
    try {
      const { data } = await firstValueFrom<AxiosResponse>(
        this.httpService.get(url).pipe(
          timeout(this.timeoutMs),
          retry({
            count: this.maxRetries,
            delay: (error, retryCount) => {
              if (this.isClientError(error)) {
                return throwError(() => error);
              }
              
              const delay = this.initialDelay * Math.pow(2, retryCount - 1);
              this.logger.log(`Retrying getStocks after ${delay}ms (attempt ${retryCount}/${this.maxRetries})`);
              return timer(delay);
            }
          }),
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch stocks: ${error.message}`);
            throw new StockServiceUnavailableException();
          }),
        ),
      );
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to get stocks after retries: ${error.message}`);
      throw new StockServiceUnavailableException();
    }
  }

  async buyStock(symbol: string, userId: string, quantity: number) {
    const url = `${this.baseUrl}/stocks/${symbol}/buy`;
    
    try {
      const { data } = await firstValueFrom<AxiosResponse>(
        this.httpService.post(url, { userId, quantity }).pipe(
          timeout(this.timeoutMs),
          retry({
            count: this.maxRetries,
            delay: (error, retryCount) => {
              if (this.isClientError(error)) {
                return throwError(() => error);
              }
              
              const delay = this.initialDelay * Math.pow(2, retryCount - 1);
              this.logger.log(`Retrying buyStock after ${delay}ms (attempt ${retryCount}/${this.maxRetries})`);
              return timer(delay);
            }
          }),
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to buy stock ${symbol}: ${error.message}`);
            throw new TransactionFailedException(symbol, error.message);
          }),
        ),
      );
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to buy stock ${symbol} after retries: ${error.message}`);
      if (error instanceof TransactionFailedException) {
        throw error;
      }
      throw new TransactionFailedException(symbol, 'Transaction failed due to service unavailability');
    }
  }

  private isClientError(error: any): boolean {
    return error?.response?.status >= 400 && error?.response?.status < 500;
  }
} 