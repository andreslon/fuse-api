import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {} 