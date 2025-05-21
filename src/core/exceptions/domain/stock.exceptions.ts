import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

export class StockNotFoundException extends BaseAppException {
  constructor(symbol: string) {
    super(
      `Stock with symbol ${symbol} not found`,
      HttpStatus.NOT_FOUND,
      'STOCK_NOT_FOUND',
    );
  }
}

export class StockServiceUnavailableException extends BaseAppException {
  constructor(message = 'Stock service is currently unavailable') {
    super(
      message,
      HttpStatus.SERVICE_UNAVAILABLE,
      'STOCK_SERVICE_UNAVAILABLE',
    );
  }
} 