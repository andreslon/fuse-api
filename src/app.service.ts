import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): { name: string; version: string } {
    return {
      name: 'Fuse API',
      version: '1.0.0',
    };
  }
} 