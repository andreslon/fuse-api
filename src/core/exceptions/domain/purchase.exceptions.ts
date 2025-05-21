import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

/**
 * Thrown when a purchase operation fails
 */
export class PurchaseFailedException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'PURCHASE_FAILED',
      HttpStatus.BAD_REQUEST,
      context
    );
  }
}

/**
 * Thrown when a purchase is not allowed for the current user
 */
export class PurchaseNotAllowedException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'PURCHASE_NOT_ALLOWED',
      HttpStatus.FORBIDDEN,
      context
    );
  }
}

/**
 * Thrown when a purchase limit has been exceeded
 */
export class PurchaseLimitExceededException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'PURCHASE_LIMIT_EXCEEDED',
      HttpStatus.BAD_REQUEST,
      context
    );
  }
}

/**
 * Thrown when a purchase validation fails
 */
export class PurchaseValidationException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'PURCHASE_VALIDATION_FAILED',
      HttpStatus.BAD_REQUEST,
      context
    );
  }
} 