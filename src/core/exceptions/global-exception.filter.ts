import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseAppException } from './base-app.exception';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction: boolean;

  constructor(
    @Optional() @Inject('ConfigService') private readonly configService?: ConfigService,
  ) {
    // Determine if we're in production environment
    this.isProduction = this.configService?.get('NODE_ENV') === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: Record<string, any> = BaseAppException.createErrorResponse(
      statusCode,
      'Internal server error',
      'INTERNAL_ERROR',
      { path: request.url },
    );

    if (exception instanceof BaseAppException) {
      // Handle our custom exceptions
      const exceptionResponse = exception.getResponse() as Record<string, any>;
      statusCode = exception.getStatus();
      errorResponse = {
        ...exceptionResponse,
        path: request.url,
      };
    } else if (exception instanceof HttpException) {
      // Handle NestJS HttpExceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...exceptionResponse,
          timestamp,
          path: request.url,
          code: exceptionResponse['code'] || this.getErrorCodeFromStatus(statusCode),
        };
      } else {
        errorResponse = BaseAppException.createErrorResponse(
          statusCode,
          exceptionResponse as string,
          this.getErrorCodeFromStatus(statusCode),
          { path: request.url },
        );
      }
    } else if (exception instanceof Error) {
      // Handle generic errors
      errorResponse = BaseAppException.createErrorResponse(
        statusCode,
        exception.message || 'Internal server error',
        'INTERNAL_ERROR',
        { path: request.url },
        this.isProduction ? undefined : { stack: exception.stack },
      );
    }

    // Log the error with appropriate level based on status code
    this.logError(statusCode, request, errorResponse, exception);

    // Remove stack traces in production
    if (this.isProduction && errorResponse.stack) {
      delete errorResponse.stack;
    }

    // Send the response
    response.status(statusCode).json(errorResponse);
  }

  /**
   * Log the error with appropriate level based on status code
   */
  private logError(
    statusCode: number,
    request: Request,
    errorResponse: Record<string, any>,
    exception: unknown,
  ): void {
    const method = request.method;
    const url = request.url;
    const errorMessage = `${method} ${url} - ${statusCode} - ${JSON.stringify(errorResponse)}`;

    if (statusCode >= 500) {
      // Server errors - log as errors
      this.logger.error(
        errorMessage,
        exception instanceof Error ? exception.stack : '',
      );
    } else if (statusCode >= 400 && statusCode < 500) {
      // Client errors - log as warnings
      this.logger.warn(errorMessage);
    } else {
      // Other errors - log as log
      this.logger.log(errorMessage);
    }
  }

  /**
   * Get a standard error code based on HTTP status code
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      case HttpStatus.BAD_GATEWAY:
        return 'BAD_GATEWAY';
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'SERVICE_UNAVAILABLE';
      case HttpStatus.GATEWAY_TIMEOUT:
        return 'GATEWAY_TIMEOUT';
      default:
        return 'ERROR';
    }
  }
} 