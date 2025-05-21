import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo(): { name: string; version: string } {
    return {
      name: 'Fuse API',
      version: '1.0.0',
    };
  }
} 