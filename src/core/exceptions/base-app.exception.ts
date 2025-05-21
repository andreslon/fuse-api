import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception class for all application exceptions
 * Provides consistent error structure across the application
 */
export class BaseAppException extends HttpException {
  /**
   * Create a new application exception
   * @param message Human-readable error message
   * @param errorCode Machine-readable error code 
   * @param statusCode HTTP status code
   * @param context Additional error context data
   */
  constructor(
    message: string,
    readonly errorCode: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    readonly context: Record<string, any> = {},
  ) {
    const response = {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    
    super(response, statusCode);
  }

  /**
   * Creates a structured error object with standard properties
   */
  static createErrorResponse(
    statusCode: HttpStatus,
    message: string,
    code: string,
    context?: Record<string, any>,
    details?: any
  ): Record<string, any> {
    return {
      statusCode,
      message,
      code,
      context,
      details,
      timestamp: new Date().toISOString(),
    };
  }
} 