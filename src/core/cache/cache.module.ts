import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get('REDIS_HOST');
        const port = configService.get('REDIS_PORT');
        const password = configService.get('REDIS_PASSWORD');
        const ttl = configService.get('REDIS_CACHE_TTL', 300000);
        
        console.log(`Connecting to Redis at ${host}:${port}`);
        
        return {
          store: redisStore,
          host,
          port,
          auth_pass: password,
          ttl: ttl,
          prefix: 'fuse_api:',
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {} 