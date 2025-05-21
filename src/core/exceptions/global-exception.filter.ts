import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseAppException } from './base-app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      statusCode,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof BaseAppException) {
      const exceptionResponse = exception.getResponse() as any;
      statusCode = exception.getStatus();
      errorResponse = {
        ...exceptionResponse,
        path: request.url,
      };
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        errorResponse = {
          ...exceptionResponse,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else {
        errorResponse = {
          statusCode,
          message: exceptionResponse,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - ${JSON.stringify(errorResponse)}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(statusCode).json(errorResponse);
  }
} 