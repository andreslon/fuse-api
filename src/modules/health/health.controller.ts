import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheService } from '../../core/cache/cache.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly cacheService: CacheService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis cache status' })
  async checkRedis() {
    try {
      const keys = await this.cacheService.getAllKeys();
      
      // Intentar obtener los valores de las claves
      const values = {};
      for (const key of keys) {
        const value = await this.cacheService.getFromRedis(key);
        values[key] = value;
      }
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        keysCount: keys.length,
        keys: keys,
        values: values
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