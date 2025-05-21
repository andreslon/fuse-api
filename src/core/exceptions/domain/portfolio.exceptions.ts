import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

/**
 * Thrown when a portfolio for the given user ID is not found
 */
export class PortfolioNotFoundException extends BaseAppException {
  constructor(userId: string) {
    super(
      `Portfolio for user ${userId} not found`,
      'PORTFOLIO_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      { userId }
    );
  }
}

/**
 * Thrown when an update to a portfolio fails
 */
export class PortfolioUpdateFailedException extends BaseAppException {
  constructor(message = 'Failed to update portfolio', context?: Record<string, any>) {
    super(
      message,
      'PORTFOLIO_UPDATE_FAILED',
      HttpStatus.INTERNAL_SERVER_ERROR,
      context
    );
  }
}

/**
 * Thrown when a portfolio operation is invalid
 */
export class InvalidPortfolioOperationException extends BaseAppException {
  constructor(message: string, context?: Record<string, any>) {
    super(
      message,
      'INVALID_PORTFOLIO_OPERATION',
      HttpStatus.BAD_REQUEST,
      context
    );
  }
} 