import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseAppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly details?: any,
  ) {
    super(
      {
        statusCode,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
} 