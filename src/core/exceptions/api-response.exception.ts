import { HttpStatus } from '@nestjs/common';
import { BaseAppException } from './base-app.exception';

/**
 * Exception thrown when there are issues with external API responses
 */
export class ApiResponseException extends BaseAppException {
  /**
   * Create a new API response exception
   * @param message Error message
   * @param statusCode HTTP status code
   * @param context Additional error context data
   */
  constructor(
    message: string,
    statusCode: number = HttpStatus.BAD_GATEWAY,
    context: Record<string, any> = {},
  ) {
    super(
      message,
      'API_RESPONSE_ERROR',
      statusCode,
      context,
    );
  }
} 