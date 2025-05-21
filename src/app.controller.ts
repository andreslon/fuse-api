import { Controller, Get } from '@nestjs/common';
import { Public } from './core/guards/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getApiInfo(): { name: string; version: string } {
    return {
      name: 'Fuse API',
      version: '1.0.0',
    };
  }
} 