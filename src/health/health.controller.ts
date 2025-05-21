import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheService } from '../core/cache/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly cacheService: CacheService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fuse-api'
    };
  }
  
  @Get('redis')
  @ApiOperation({ summary: 'Check Redis cache status' })
  async checkRedis() {
    try {
      const keys = await this.cacheService.getAllKeys();
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        keysCount: keys.length,
        keys: keys
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
} 