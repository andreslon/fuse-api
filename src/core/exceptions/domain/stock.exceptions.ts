import { BaseAppException } from '../base-app.exception';
import { HttpStatus } from '@nestjs/common';

/**
 * Exception thrown when a stock cannot be found
 */
export class StockNotFoundException extends BaseAppException {
  constructor(symbol: string) {
    super(
      `Stock with symbol '${symbol}' not found`,
      'STOCK_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Exception thrown when the stock service is unavailable
 */
export class StockServiceUnavailableException extends BaseAppException {
  constructor(message = 'Stock service is currently unavailable') {
    super(
      message,
      'STOCK_SERVICE_UNAVAILABLE',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Thrown when a request to get stock information is invalid
 */
export class InvalidStockRequestException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'INVALID_STOCK_REQUEST',
      HttpStatus.BAD_REQUEST,
      context,
    );
  }
} 