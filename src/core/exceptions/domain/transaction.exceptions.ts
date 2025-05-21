import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

/**
 * Exception thrown when a transaction fails
 */
export class TransactionFailedException extends BaseAppException {
  constructor(symbol: string, reason: string) {
    super(
      `Transaction for ${symbol} failed: ${reason}`,
      'TRANSACTION_FAILED',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Thrown when a user has insufficient funds for a transaction
 */
export class InsufficientFundsException extends BaseAppException {
  constructor(userId: string, requiredAmount: number) {
    super(
      'Insufficient funds to complete this transaction',
      'INSUFFICIENT_FUNDS',
      HttpStatus.BAD_REQUEST,
      { userId, requiredAmount }
    );
  }
}

/**
 * Thrown when a purchase request is invalid
 */
export class InvalidPurchaseRequestException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'INVALID_PURCHASE_REQUEST',
      HttpStatus.BAD_REQUEST,
      context
    );
  }
} 