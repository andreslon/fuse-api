import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

export class TransactionFailedException extends BaseAppException {
  constructor(symbol: string, message = 'Transaction failed') {
    super(
      `${message} for stock ${symbol}`,
      HttpStatus.BAD_REQUEST,
      'TRANSACTION_FAILED',
    );
  }
}

export class InsufficientFundsException extends BaseAppException {
  constructor() {
    super(
      'Insufficient funds to complete this transaction',
      HttpStatus.BAD_REQUEST,
      'INSUFFICIENT_FUNDS',
    );
  }
} 