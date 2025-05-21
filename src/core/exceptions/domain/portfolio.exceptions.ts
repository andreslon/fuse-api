import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from '../base-app.exception';

export class PortfolioNotFoundException extends BaseAppException {
  constructor(userId: string) {
    super(
      `Portfolio for user ${userId} not found`,
      HttpStatus.NOT_FOUND,
      'PORTFOLIO_NOT_FOUND',
    );
  }
}

export class PortfolioUpdateFailedException extends BaseAppException {
  constructor(message = 'Failed to update portfolio') {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'PORTFOLIO_UPDATE_FAILED',
    );
  }
} 