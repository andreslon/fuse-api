import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, retry, timeout } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class VendorService {
  private readonly logger = new Logger(VendorService.name);
  private readonly baseUrl = 'https://api.challenge.fusefinance.com';
  private readonly timeoutMs = 5000; // 5 seconds
  private readonly maxRetries = 3;

  constructor(private readonly httpService: HttpService) {}

  async getStocks() {
    const url = `${this.baseUrl}/stocks`;
    
    try {
      const { data } = await firstValueFrom<AxiosResponse>(
        this.httpService.get(url).pipe(
          timeout(this.timeoutMs),
          retry(this.maxRetries),
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to fetch stocks: ${error.message}`);
            throw error;
          }),
        ),
      );
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to get stocks after retries: ${error.message}`);
      throw error;
    }
  }

  async buyStock(symbol: string, userId: string, quantity: number) {
    const url = `${this.baseUrl}/stocks/${symbol}/buy`;
    
    try {
      const { data } = await firstValueFrom<AxiosResponse>(
        this.httpService.post(url, { userId, quantity }).pipe(
          timeout(this.timeoutMs),
          retry(this.maxRetries),
          catchError((error: AxiosError) => {
            this.logger.error(`Failed to buy stock ${symbol}: ${error.message}`);
            throw error;
          }),
        ),
      );
      
      return data;
    } catch (error) {
      this.logger.error(`Failed to buy stock ${symbol} after retries: ${error.message}`);
      throw error;
    }
  }
} 